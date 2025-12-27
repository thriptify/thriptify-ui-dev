/**
 * Geocoding Service with Failover
 *
 * Primary: Nominatim (OpenStreetMap) - 1 req/sec
 * Failover: LocationIQ - 2 req/sec
 * Combined: ~3 req/sec capacity
 *
 * Both use OpenStreetMap data, so results are consistent.
 */

// Get LocationIQ key from environment (optional - works without it using Nominatim only)
const LOCATIONIQ_API_KEY = process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY || '';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const LOCATIONIQ_BASE_URL = 'https://us1.locationiq.com/v1';

// User-Agent required by Nominatim usage policy
const USER_AGENT = 'Thriptify/1.0 (contact@thriptify.com)';

// Kansas City metro bounding box for biasing results
const KC_VIEWBOX = '-95.5,39.5,-94.0,38.5';

// Track provider health for intelligent failover
let nominatimFailCount = 0;
let locationiqFailCount = 0;
let lastNominatimReset = Date.now();
let lastLocationiqReset = Date.now();

const FAIL_THRESHOLD = 3; // After 3 failures, prefer the other provider
const RESET_INTERVAL = 60000; // Reset fail counts after 1 minute

export interface GeocodingAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

export interface AddressSuggestion {
  id: string;
  displayName: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  type: string;
  provider: 'nominatim' | 'locationiq';
}

/**
 * Reset fail counts periodically
 */
function checkResetFailCounts() {
  const now = Date.now();
  if (now - lastNominatimReset > RESET_INTERVAL) {
    nominatimFailCount = 0;
    lastNominatimReset = now;
  }
  if (now - lastLocationiqReset > RESET_INTERVAL) {
    locationiqFailCount = 0;
    lastLocationiqReset = now;
  }
}

/**
 * Determine which provider to try first based on health
 */
function getProviderOrder(): ('nominatim' | 'locationiq')[] {
  checkResetFailCounts();

  // If LocationIQ key not configured, only use Nominatim
  if (!LOCATIONIQ_API_KEY) {
    return ['nominatim'];
  }

  // Prefer the provider with fewer failures
  if (nominatimFailCount >= FAIL_THRESHOLD && locationiqFailCount < FAIL_THRESHOLD) {
    return ['locationiq', 'nominatim'];
  }
  if (locationiqFailCount >= FAIL_THRESHOLD && nominatimFailCount < FAIL_THRESHOLD) {
    return ['nominatim', 'locationiq'];
  }

  // Default: Nominatim first (free, no API key tracking)
  return ['nominatim', 'locationiq'];
}

// ============================================
// NOMINATIM PROVIDER
// ============================================

async function nominatimSearch(query: string, limit: number): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    countrycodes: 'us',
    limit: limit.toString(),
    viewbox: KC_VIEWBOX,
    bounded: '0',
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const results = await response.json();

  return results
    .filter((r: any) => r.address?.country_code === 'us')
    .map((result: any) => ({
      id: `nom_${result.place_id}`,
      displayName: result.display_name,
      streetAddress: formatStreetAddress(result.address),
      city: result.address?.city || result.address?.town || result.address?.village || '',
      state: result.address?.state || '',
      zip: result.address?.postcode || '',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      type: result.type || 'place',
      provider: 'nominatim' as const,
    }));
}

async function nominatimGeocode(address: string): Promise<{
  latitude: number;
  longitude: number;
  formattedAddress: string;
} | null> {
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    addressdetails: '1',
    countrycodes: 'us',
    limit: '1',
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const results = await response.json();
  if (results.length === 0) return null;

  return {
    latitude: parseFloat(results[0].lat),
    longitude: parseFloat(results[0].lon),
    formattedAddress: results[0].display_name,
  };
}

async function nominatimReverse(latitude: number, longitude: number): Promise<AddressSuggestion | null> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: 'json',
    addressdetails: '1',
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const result = await response.json();
  if (!result || !result.address) return null;

  return {
    id: `nom_${result.place_id}`,
    displayName: result.display_name,
    streetAddress: formatStreetAddress(result.address),
    city: result.address?.city || result.address?.town || result.address?.village || '',
    state: result.address?.state || '',
    zip: result.address?.postcode || '',
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    type: result.type || 'place',
    provider: 'nominatim' as const,
  };
}

// ============================================
// LOCATIONIQ PROVIDER
// ============================================

async function locationiqSearch(query: string, limit: number): Promise<AddressSuggestion[]> {
  if (!LOCATIONIQ_API_KEY) {
    throw new Error('LocationIQ API key not configured');
  }

  const params = new URLSearchParams({
    key: LOCATIONIQ_API_KEY,
    q: query,
    format: 'json',
    addressdetails: '1',
    countrycodes: 'us',
    limit: limit.toString(),
    viewbox: KC_VIEWBOX,
    bounded: '0',
    normalizeaddress: '1',
  });

  const response = await fetch(`${LOCATIONIQ_BASE_URL}/autocomplete?${params}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LocationIQ error: ${response.status}`);
  }

  const results = await response.json();

  return results
    .filter((r: any) => r.address?.country_code === 'us')
    .map((result: any) => ({
      id: `liq_${result.place_id}`,
      displayName: result.display_name,
      streetAddress: formatStreetAddress(result.address),
      city: result.address?.city || result.address?.town || result.address?.village || '',
      state: result.address?.state || '',
      zip: result.address?.postcode || '',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      type: result.type || 'place',
      provider: 'locationiq' as const,
    }));
}

async function locationiqGeocode(address: string): Promise<{
  latitude: number;
  longitude: number;
  formattedAddress: string;
} | null> {
  if (!LOCATIONIQ_API_KEY) {
    throw new Error('LocationIQ API key not configured');
  }

  const params = new URLSearchParams({
    key: LOCATIONIQ_API_KEY,
    q: address,
    format: 'json',
    addressdetails: '1',
    countrycodes: 'us',
    limit: '1',
  });

  const response = await fetch(`${LOCATIONIQ_BASE_URL}/search?${params}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LocationIQ error: ${response.status}`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) return null;

  return {
    latitude: parseFloat(results[0].lat),
    longitude: parseFloat(results[0].lon),
    formattedAddress: results[0].display_name,
  };
}

async function locationiqReverse(latitude: number, longitude: number): Promise<AddressSuggestion | null> {
  if (!LOCATIONIQ_API_KEY) {
    throw new Error('LocationIQ API key not configured');
  }

  const params = new URLSearchParams({
    key: LOCATIONIQ_API_KEY,
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: 'json',
    addressdetails: '1',
  });

  const response = await fetch(`${LOCATIONIQ_BASE_URL}/reverse?${params}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LocationIQ error: ${response.status}`);
  }

  const result = await response.json();
  if (!result || !result.address) return null;

  return {
    id: `liq_${result.place_id}`,
    displayName: result.display_name,
    streetAddress: formatStreetAddress(result.address),
    city: result.address?.city || result.address?.town || result.address?.village || '',
    state: result.address?.state || '',
    zip: result.address?.postcode || '',
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    type: result.type || 'place',
    provider: 'locationiq' as const,
  };
}

// ============================================
// PUBLIC API WITH FAILOVER
// ============================================

/**
 * Search for address suggestions (autocomplete) with automatic failover
 * @param query - User's search text
 * @param limit - Max results (default 5)
 */
export async function searchAddresses(
  query: string,
  limit: number = 5
): Promise<AddressSuggestion[]> {
  if (!query || query.length < 3) {
    return [];
  }

  const providers = getProviderOrder();

  for (const provider of providers) {
    try {
      if (provider === 'nominatim') {
        const results = await nominatimSearch(query, limit);
        nominatimFailCount = 0; // Reset on success
        return results;
      } else {
        const results = await locationiqSearch(query, limit);
        locationiqFailCount = 0; // Reset on success
        return results;
      }
    } catch (error) {
      console.warn(`[Geocoding] ${provider} failed:`, error);
      if (provider === 'nominatim') {
        nominatimFailCount++;
      } else {
        locationiqFailCount++;
      }
      // Continue to next provider
    }
  }

  console.error('[Geocoding] All providers failed');
  return [];
}

/**
 * Geocode an address string to coordinates with automatic failover
 * @param address - Full address string
 */
export async function geocodeAddress(address: string): Promise<{
  latitude: number;
  longitude: number;
  formattedAddress: string;
} | null> {
  const providers = getProviderOrder();

  for (const provider of providers) {
    try {
      if (provider === 'nominatim') {
        const result = await nominatimGeocode(address);
        if (result) {
          nominatimFailCount = 0;
          return result;
        }
      } else {
        const result = await locationiqGeocode(address);
        if (result) {
          locationiqFailCount = 0;
          return result;
        }
      }
    } catch (error) {
      console.warn(`[Geocoding] ${provider} failed:`, error);
      if (provider === 'nominatim') {
        nominatimFailCount++;
      } else {
        locationiqFailCount++;
      }
    }
  }

  return null;
}

/**
 * Reverse geocode coordinates to address with automatic failover
 * @param latitude - Latitude
 * @param longitude - Longitude
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<AddressSuggestion | null> {
  const providers = getProviderOrder();

  for (const provider of providers) {
    try {
      if (provider === 'nominatim') {
        const result = await nominatimReverse(latitude, longitude);
        if (result) {
          nominatimFailCount = 0;
          return result;
        }
      } else {
        const result = await locationiqReverse(latitude, longitude);
        if (result) {
          locationiqFailCount = 0;
          return result;
        }
      }
    } catch (error) {
      console.warn(`[Geocoding] ${provider} failed:`, error);
      if (provider === 'nominatim') {
        nominatimFailCount++;
      } else {
        locationiqFailCount++;
      }
    }
  }

  return null;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Format street address from address components
 */
function formatStreetAddress(address: GeocodingAddress): string {
  const parts: string[] = [];

  if (address.house_number) {
    parts.push(address.house_number);
  }

  if (address.road) {
    parts.push(address.road);
  }

  return parts.join(' ');
}

/**
 * Get state abbreviation from full state name
 */
export function getStateAbbreviation(stateName: string): string {
  const stateMap: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
  };

  return stateMap[stateName] || stateName;
}

/**
 * Check if LocationIQ is configured
 */
export function isLocationIQConfigured(): boolean {
  return !!LOCATIONIQ_API_KEY;
}

/**
 * Get current provider health status (for debugging)
 */
export function getProviderStatus(): {
  nominatim: { failCount: number; healthy: boolean };
  locationiq: { failCount: number; healthy: boolean; configured: boolean };
} {
  checkResetFailCounts();
  return {
    nominatim: {
      failCount: nominatimFailCount,
      healthy: nominatimFailCount < FAIL_THRESHOLD,
    },
    locationiq: {
      failCount: locationiqFailCount,
      healthy: locationiqFailCount < FAIL_THRESHOLD,
      configured: !!LOCATIONIQ_API_KEY,
    },
  };
}
