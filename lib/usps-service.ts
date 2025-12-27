/**
 * USPS Address Validation Service (v3 API)
 * Free USPS address validation and standardization
 *
 * API Docs: https://developers.usps.com/addressesv3
 * Rate limit: 60 calls/hour on default tier
 */

// USPS API configuration
// These should be in .env file
const USPS_API_URL = process.env.EXPO_PUBLIC_USPS_API_URL || 'https://apis.usps.com';
const USPS_CLIENT_ID = process.env.EXPO_PUBLIC_USPS_CLIENT_ID || '';
const USPS_CLIENT_SECRET = process.env.EXPO_PUBLIC_USPS_CLIENT_SECRET || '';

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * DPV Confirmation codes
 * Y = Full match (primary + secondary confirmed)
 * D = Primary matched, secondary MISSING (needs apt/unit)
 * S = Primary matched, secondary INVALID
 * N = Address not found
 */
export type DPVConfirmation = 'Y' | 'D' | 'S' | 'N' | '';

export interface USPSValidationResult {
  isValid: boolean;
  needsSecondaryAddress: boolean;
  secondaryAddressInvalid: boolean;

  // Standardized address
  standardizedAddress: {
    streetAddress: string;
    secondaryAddress?: string;
    city: string;
    state: string;
    zip5: string;
    zip4?: string;
  } | null;

  // Raw DPV data
  dpvConfirmation: DPVConfirmation;
  dpvFootnotes: string;

  // Additional flags
  isVacant: boolean;
  isBusiness: boolean;

  // Error info
  error?: string;
}

export interface AddressInput {
  streetAddress: string;
  secondaryAddress?: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Get OAuth token for USPS API
 */
async function getUSPSToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  if (!USPS_CLIENT_ID || !USPS_CLIENT_SECRET) {
    throw new Error('USPS API credentials not configured');
  }

  try {
    const response = await fetch(`${USPS_API_URL}/oauth2/v3/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: USPS_CLIENT_ID,
        client_secret: USPS_CLIENT_SECRET,
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`USPS OAuth error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Cache token
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    console.log('[USPS] Got OAuth token');
    return cachedToken.token;
  } catch (error) {
    console.error('[USPS] Token error:', error);
    throw error;
  }
}

/**
 * Validate and standardize a US address using USPS API
 */
export async function validateAddress(address: AddressInput): Promise<USPSValidationResult> {
  try {
    const token = await getUSPSToken();

    const params = new URLSearchParams({
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      ZIPCode: address.zipCode,
    });

    if (address.secondaryAddress) {
      params.append('secondaryAddress', address.secondaryAddress);
    }

    const response = await fetch(
      `${USPS_API_URL}/addresses/v3/address?${params}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[USPS] Validation error:', response.status, errorText);

      // Parse error for specific messages
      if (response.status === 404) {
        return {
          isValid: false,
          needsSecondaryAddress: false,
          secondaryAddressInvalid: false,
          standardizedAddress: null,
          dpvConfirmation: 'N',
          dpvFootnotes: '',
          isVacant: false,
          isBusiness: false,
          error: 'Address not found. Please check the address and try again.',
        };
      }

      return {
        isValid: false,
        needsSecondaryAddress: false,
        secondaryAddressInvalid: false,
        standardizedAddress: null,
        dpvConfirmation: '',
        dpvFootnotes: '',
        isVacant: false,
        isBusiness: false,
        error: `Validation failed: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('[USPS] Validation response:', data);

    return parseUSPSResponse(data);
  } catch (error) {
    console.error('[USPS] Validate error:', error);
    return {
      isValid: false,
      needsSecondaryAddress: false,
      secondaryAddressInvalid: false,
      standardizedAddress: null,
      dpvConfirmation: '',
      dpvFootnotes: '',
      isVacant: false,
      isBusiness: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

/**
 * Parse USPS API response
 */
function parseUSPSResponse(data: any): USPSValidationResult {
  const address = data.address || {};
  const additionalInfo = data.additionalInfo || {};

  const dpvConfirmation = (additionalInfo.DPVConfirmation || '') as DPVConfirmation;
  const dpvFootnotes = additionalInfo.DPVFootnotes || '';

  // Determine validation status based on DPV codes
  const isValid = dpvConfirmation === 'Y';
  const needsSecondaryAddress = dpvConfirmation === 'D' ||
    dpvFootnotes.includes('N1') ||
    dpvFootnotes.includes('C1');
  const secondaryAddressInvalid = dpvConfirmation === 'S' ||
    dpvFootnotes.includes('CC');

  // Build standardized address
  const standardizedAddress = {
    streetAddress: address.streetAddress || '',
    secondaryAddress: address.secondaryAddress || undefined,
    city: address.city || '',
    state: address.state || '',
    zip5: address.ZIPCode || '',
    zip4: address.ZIPPlus4 || undefined,
  };

  return {
    isValid,
    needsSecondaryAddress,
    secondaryAddressInvalid,
    standardizedAddress,
    dpvConfirmation,
    dpvFootnotes,
    isVacant: additionalInfo.vacant === 'Y',
    isBusiness: additionalInfo.business === 'Y',
  };
}

/**
 * Get user-friendly error message based on DPV result
 */
export function getValidationMessage(result: USPSValidationResult): {
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
} {
  if (result.isValid) {
    return {
      type: 'success',
      title: 'Address Verified',
      message: 'Your address has been validated and is ready for delivery.',
    };
  }

  if (result.needsSecondaryAddress) {
    return {
      type: 'warning',
      title: 'Unit Number Required',
      message: 'This appears to be a multi-unit building. Please add your apartment, suite, or unit number.',
    };
  }

  if (result.secondaryAddressInvalid) {
    return {
      type: 'warning',
      title: 'Invalid Unit Number',
      message: 'The unit number you entered could not be verified. Please check and try again.',
    };
  }

  if (result.isVacant) {
    return {
      type: 'warning',
      title: 'Vacant Address',
      message: 'This address is marked as vacant. Please verify this is correct.',
    };
  }

  return {
    type: 'error',
    title: 'Address Not Found',
    message: result.error || 'We could not verify this address. Please check the street address, city, and ZIP code.',
  };
}

/**
 * Lookup city and state from ZIP code
 */
export async function lookupZipCode(zipCode: string): Promise<{
  city: string;
  state: string;
} | null> {
  try {
    const token = await getUSPSToken();

    const response = await fetch(
      `${USPS_API_URL}/addresses/v3/city-state?ZIPCode=${zipCode}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      city: data.city || '',
      state: data.state || '',
    };
  } catch (error) {
    console.error('[USPS] ZIP lookup error:', error);
    return null;
  }
}

/**
 * Check if USPS service is configured
 */
export function isUSPSConfigured(): boolean {
  return Boolean(USPS_CLIENT_ID && USPS_CLIENT_SECRET);
}
