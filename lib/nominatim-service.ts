/**
 * Nominatim (OpenStreetMap) Geocoding Service
 * Free geocoding and address autocomplete
 *
 * Rate limit: 1 request/second on public server
 * For production, consider self-hosting or using a paid provider
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// User-Agent required by Nominatim usage policy
const USER_AGENT = 'Thriptify/1.0 (contact@thriptify.com)';

export interface NominatimAddress {
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

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
  boundingbox: string[];
  type: string;
  importance: number;
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
  type: string; // house, apartment, commercial, etc.
}

/**
 * Search for address suggestions (autocomplete)
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

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      countrycodes: 'us', // US only
      limit: limit.toString(),
      // Bias results towards Kansas City area
      viewbox: '-95.5,39.5,-94.0,38.5', // KC metro bounding box
      bounded: '0', // Don't strictly limit to viewbox
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

    const results: NominatimResult[] = await response.json();

    return results
      .filter(r => r.address.country_code === 'us')
      .map(result => ({
        id: result.place_id.toString(),
        displayName: result.display_name,
        streetAddress: formatStreetAddress(result.address),
        city: result.address.city || result.address.town || result.address.village || '',
        state: result.address.state || '',
        zip: result.address.postcode || '',
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        type: result.type,
      }));
  } catch (error) {
    console.error('[Nominatim] Search error:', error);
    return [];
  }
}

/**
 * Geocode an address string to coordinates
 * @param address - Full address string
 */
export async function geocodeAddress(address: string): Promise<{
  latitude: number;
  longitude: number;
  formattedAddress: string;
} | null> {
  try {
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

    const results: NominatimResult[] = await response.json();

    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
    };
  } catch (error) {
    console.error('[Nominatim] Geocode error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address
 * @param latitude - Latitude
 * @param longitude - Longitude
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<AddressSuggestion | null> {
  try {
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

    const result: NominatimResult = await response.json();

    if (!result || !result.address) {
      return null;
    }

    return {
      id: result.place_id.toString(),
      displayName: result.display_name,
      streetAddress: formatStreetAddress(result.address),
      city: result.address.city || result.address.town || result.address.village || '',
      state: result.address.state || '',
      zip: result.address.postcode || '',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      type: result.type,
    };
  } catch (error) {
    console.error('[Nominatim] Reverse geocode error:', error);
    return null;
  }
}

/**
 * Format street address from Nominatim address components
 */
function formatStreetAddress(address: NominatimAddress): string {
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
    'Kansas': 'KS',
    'Missouri': 'MO',
    'Nebraska': 'NE',
    'Oklahoma': 'OK',
    'Iowa': 'IA',
    'Arkansas': 'AR',
    'Colorado': 'CO',
    'Texas': 'TX',
    // Add more as needed
  };

  return stateMap[stateName] || stateName;
}
