import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { searchAddresses, AddressSuggestion, reverseGeocode, getStateAbbreviation } from '@/lib/geocoding-service';
import { useAppAuth } from '@/contexts/auth-context';

// Validation result type (simplified from USPS service)
interface ValidationResult {
  isValid: boolean;
  needsSecondaryAddress: boolean;
  secondaryAddressInvalid: boolean;
  standardizedAddress: {
    streetAddress: string;
    secondaryAddress?: string;
    city: string;
    state: string;
    zip5: string;
  } | null;
  dpvConfirmation: string;
  dpvFootnotes: string;
  isVacant: boolean;
  isBusiness: boolean;
  error?: string;
}

function getValidationMessage(result: ValidationResult): { type: 'success' | 'warning' | 'error'; title: string; message: string } | null {
  if (result.error) {
    return { type: 'error', title: 'Validation Error', message: result.error };
  }
  if (result.needsSecondaryAddress) {
    return { type: 'warning', title: 'Missing Unit Number', message: 'This address appears to be a multi-unit building. Please add an apartment or unit number.' };
  }
  if (result.secondaryAddressInvalid) {
    return { type: 'warning', title: 'Unit Not Found', message: 'The unit number could not be verified. Please double-check it.' };
  }
  if (!result.isValid) {
    return { type: 'error', title: 'Address Not Found', message: 'We couldn\'t verify this address. Please check and try again.' };
  }
  return null;
}
import { useLocation, DeliveryAddress } from '@/contexts/location-context';

interface AddressEntryProps {
  onAddressVerified: (address: DeliveryAddress) => void;
  onCancel?: () => void;
  initialAddress?: Partial<DeliveryAddress>;
  showCancel?: boolean;
}

type Step = 'search' | 'details' | 'verification';

export function AddressEntry({
  onAddressVerified,
  onCancel,
  initialAddress,
  showCancel = true,
}: AddressEntryProps) {
  const { getCurrentLocation, requestLocationPermission } = useLocation();
  const { getToken, isAuthenticated } = useAppAuth();

  // Form state
  const [step, setStep] = useState<Step>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);

  // Address details
  const [streetAddress, setStreetAddress] = useState(initialAddress?.streetAddress || '');
  const [secondaryAddress, setSecondaryAddress] = useState(initialAddress?.secondaryAddress || '');
  const [city, setCity] = useState(initialAddress?.city || '');
  const [state, setState] = useState(initialAddress?.state || '');
  const [zip, setZip] = useState(initialAddress?.zip || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    initialAddress?.deliveryInstructions || ''
  );

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Coordinates (from selection or geocoding)
  const [latitude, setLatitude] = useState(initialAddress?.latitude || 0);
  const [longitude, setLongitude] = useState(initialAddress?.longitude || 0);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Search debounce
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddresses(searchQuery);
      setSuggestions(results);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleSelectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion);
    setStreetAddress(suggestion.streetAddress);
    setCity(suggestion.city);
    // Convert full state name to abbreviation if needed
    const stateValue = suggestion.state.length > 2
      ? getStateAbbreviation(suggestion.state)
      : suggestion.state;
    setState(stateValue);
    setZip(suggestion.zip);
    setLatitude(suggestion.latitude);
    setLongitude(suggestion.longitude);
    setSuggestions([]);
    setSearchQuery('');
    setStep('details');
    Keyboard.dismiss();
  }, []);

  const [locationError, setLocationError] = useState<string | null>(null);

  const handleUseCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocationError('Location permission denied. Please enable location access in your device settings.');
        return;
      }

      const location = await getCurrentLocation();
      if (!location) {
        setLocationError('Could not get your current location. Please try again or enter address manually.');
        return;
      }

      // Reverse geocode
      const address = await reverseGeocode(location.latitude, location.longitude);
      if (address) {
        // Check if we got a valid street address
        if (!address.streetAddress || address.streetAddress.trim() === '') {
          // Got coordinates but no street address - fill what we have and let user complete
          setCity(address.city);
          // Convert full state name to abbreviation if needed
          const stateValue = address.state.length > 2
            ? getStateAbbreviation(address.state)
            : address.state;
          setState(stateValue);
          setZip(address.zip);
          setLatitude(address.latitude);
          setLongitude(address.longitude);
          setStep('details');
          setLocationError('We found your approximate location. Please enter your street address.');
        } else {
          handleSelectSuggestion(address);
        }
      } else {
        setLocationError('Could not determine address from your location. Please enter address manually.');
      }
    } catch (error) {
      console.error('[AddressEntry] Location error:', error);
      setLocationError('Something went wrong. Please try again or enter address manually.');
    } finally {
      setIsGettingLocation(false);
    }
  }, [getCurrentLocation, requestLocationPermission, handleSelectSuggestion]);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.thriptify.com';

  const handleValidateAddress = useCallback(async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Basic client-side validation first
      const errors: string[] = [];

      if (!streetAddress.trim()) {
        errors.push('Street address is required');
      }
      if (!city.trim()) {
        errors.push('City is required');
      }
      if (!state.trim() || state.length !== 2) {
        errors.push('Valid 2-letter state code is required');
      }
      if (!zip.trim() || !/^\d{5}$/.test(zip)) {
        errors.push('Valid 5-digit ZIP code is required');
      }

      if (errors.length > 0) {
        setValidationResult({
          isValid: false,
          needsSecondaryAddress: false,
          secondaryAddressInvalid: false,
          standardizedAddress: null,
          dpvConfirmation: 'N',
          dpvFootnotes: '',
          isVacant: false,
          isBusiness: false,
          error: errors.join('. '),
        });
        return;
      }

      // Call backend validation endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/address/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          state: state.toUpperCase().trim(),
          zip: zip.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setValidationResult({
          isValid: false,
          needsSecondaryAddress: false,
          secondaryAddressInvalid: false,
          standardizedAddress: null,
          dpvConfirmation: 'N',
          dpvFootnotes: '',
          isVacant: false,
          isBusiness: false,
          error: data.error?.message || 'Failed to validate address',
        });
        return;
      }

      const validation = data.data;

      // Update coordinates from geocoded address if available
      if (validation.geocodedAddress) {
        setLatitude(validation.geocodedAddress.latitude);
        setLongitude(validation.geocodedAddress.longitude);
      }

      // Map API response to our validation result format
      const needsSecondary = validation.confidence === 'medium' &&
        validation.warnings.some((w: string) => w.toLowerCase().includes('house') || w.toLowerCase().includes('building'));

      setValidationResult({
        isValid: validation.isValid,
        needsSecondaryAddress: needsSecondary,
        secondaryAddressInvalid: false,
        standardizedAddress: validation.geocodedAddress ? {
          streetAddress: validation.geocodedAddress.streetAddress || streetAddress.trim(),
          secondaryAddress: secondaryAddress?.trim() || undefined,
          city: validation.geocodedAddress.city || city.trim(),
          state: validation.geocodedAddress.state || state.toUpperCase().trim(),
          zip5: validation.geocodedAddress.zip || zip.trim(),
        } : null,
        dpvConfirmation: validation.confidence === 'high' ? 'Y' : (validation.confidence === 'medium' ? 'D' : 'N'),
        dpvFootnotes: validation.warnings.join(' '),
        isVacant: false,
        isBusiness: false,
        error: validation.isValid ? undefined : validation.message,
      });

      // Show verification step if valid, otherwise stay on details for user to fix
      if (validation.isValid || validation.confidence === 'medium') {
        setStep('verification');
      }
    } catch (error) {
      console.error('[Address] Validation error:', error);
      setValidationResult({
        isValid: false,
        needsSecondaryAddress: false,
        secondaryAddressInvalid: false,
        standardizedAddress: null,
        dpvConfirmation: '',
        dpvFootnotes: '',
        isVacant: false,
        isBusiness: false,
        error: 'Failed to validate address. Please try again.',
      });
    } finally {
      setIsValidating(false);
    }
  }, [streetAddress, secondaryAddress, city, state, zip, latitude, longitude]);

  const handleConfirmAddress = useCallback(async () => {
    const address: DeliveryAddress = {
      streetAddress,
      secondaryAddress: secondaryAddress || undefined,
      city,
      state,
      zip,
      latitude,
      longitude,
      deliveryInstructions: deliveryInstructions || undefined,
    };

    // If user is signed in, also save to backend API
    if (isAuthenticated) {
      setIsSaving(true);
      setSaveError(null);

      try {
        const token = await getToken();

        const response = await fetch(`${API_BASE_URL}/api/v1/customer/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            label: 'Home', // Default label
            addressLine1: streetAddress,
            addressLine2: secondaryAddress || undefined,
            city,
            state,
            postalCode: zip,
            country: 'US',
            latitude,
            longitude,
            deliveryInstructions: deliveryInstructions || undefined,
            isDefault: true, // First address is default
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('[AddressEntry] Failed to save to backend:', errorData);
          // Don't block the user - just log the error and continue
        } else {
          console.log('[AddressEntry] Address saved to backend successfully');
        }
      } catch (error) {
        console.warn('[AddressEntry] Error saving to backend:', error);
        // Don't block the user - just log the error and continue
      } finally {
        setIsSaving(false);
      }
    }

    onAddressVerified(address);
  }, [
    streetAddress,
    secondaryAddress,
    city,
    state,
    zip,
    latitude,
    longitude,
    deliveryInstructions,
    onAddressVerified,
    isAuthenticated,
    getToken,
  ]);

  const validationMessage = validationResult ? getValidationMessage(validationResult) : null;

  return (
    <View style={styles.container}>
      {/* Drag Handle */}
      {showCancel && (
        <Pressable style={styles.dragHandleContainer} onPress={onCancel}>
          <View style={styles.dragHandle} />
        </Pressable>
      )}

      {/* Search Step */}
      {step === 'search' && (
        <>
          <Text variant="h3" style={styles.title}>
            Where should we deliver?
          </Text>
          <Text style={styles.subtitle}>
            Enter your delivery address to get started
          </Text>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size="sm"
              color={tokens.colors.semantic.text.tertiary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for your address..."
              placeholderTextColor={tokens.colors.semantic.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {isSearching && (
              <ActivityIndicator size="small" color={tokens.colors.semantic.brand.primary.default} />
            )}
          </View>

          {/* Use Current Location */}
          <Pressable
            style={styles.locationButton}
            onPress={handleUseCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <ActivityIndicator size="small" color={tokens.colors.semantic.brand.primary.default} />
            ) : (
              <Icon
                name="location"
                size="md"
                color={tokens.colors.semantic.brand.primary.default}
              />
            )}
            <Text style={styles.locationButtonText}>
              {isGettingLocation ? 'Getting location...' : 'Use current location'}
            </Text>
          </Pressable>

          {/* Location Error Message */}
          {locationError && (
            <View style={styles.locationErrorContainer}>
              <Icon name="alert" size="sm" color={tokens.colors.semantic.status.warning.default} />
              <Text style={styles.locationErrorText}>{locationError}</Text>
            </View>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <ScrollView style={styles.suggestionsContainer}>
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(suggestion)}
                >
                  <Icon
                    name="location"
                    size="sm"
                    color={tokens.colors.semantic.text.secondary}
                  />
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionMain}>
                      {suggestion.streetAddress || suggestion.city}
                    </Text>
                    <Text style={styles.suggestionSecondary}>
                      {suggestion.city}, {suggestion.state} {suggestion.zip}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Manual Entry Option */}
          <Pressable
            style={styles.manualEntryButton}
            onPress={() => setStep('details')}
          >
            <Text style={styles.manualEntryText}>Enter address manually</Text>
          </Pressable>
        </>
      )}

      {/* Details Step */}
      {step === 'details' && (
        <>
          <View style={styles.headerRow}>
            <Pressable onPress={() => setStep('search')} style={styles.backButton}>
              <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
            </Pressable>
            <Text variant="h3" style={styles.title}>Address Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Validation Message */}
          {validationMessage && validationMessage.type !== 'success' && (
            <View
              style={[
                styles.validationMessage,
                validationMessage.type === 'warning'
                  ? styles.validationWarning
                  : styles.validationError,
              ]}
            >
              <Icon
                name={validationMessage.type === 'warning' ? 'alert' : 'close-circle'}
                size="sm"
                color={
                  validationMessage.type === 'warning'
                    ? tokens.colors.semantic.status.warning.default
                    : tokens.colors.semantic.status.error.default
                }
              />
              <View style={styles.validationTextContainer}>
                <Text style={styles.validationTitle}>{validationMessage.title}</Text>
                <Text style={styles.validationText}>{validationMessage.message}</Text>
              </View>
            </View>
          )}

          {/* Form Fields */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="123 Main Street"
                placeholderTextColor={tokens.colors.semantic.text.tertiary}
                value={streetAddress}
                onChangeText={setStreetAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Apt / Suite / Unit {validationResult?.needsSecondaryAddress ? '*' : ''}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  validationResult?.needsSecondaryAddress && styles.textInputRequired,
                ]}
                placeholder="Apt 4B, Suite 200, etc."
                placeholderTextColor={tokens.colors.semantic.text.tertiary}
                value={secondaryAddress}
                onChangeText={setSecondaryAddress}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="City"
                  placeholderTextColor={tokens.colors.semantic.text.tertiary}
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="KS"
                  placeholderTextColor={tokens.colors.semantic.text.tertiary}
                  value={state}
                  onChangeText={setState}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1.5 }]}>
                <Text style={styles.inputLabel}>ZIP *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="66212"
                  placeholderTextColor={tokens.colors.semantic.text.tertiary}
                  value={zip}
                  onChangeText={setZip}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Delivery Instructions (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Gate code, building name, landmarks..."
                placeholderTextColor={tokens.colors.semantic.text.tertiary}
                value={deliveryInstructions}
                onChangeText={setDeliveryInstructions}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Verify Button */}
          <View style={styles.bottomActions}>
            <Pressable
              style={[
                styles.primaryButton,
                (!streetAddress || !city || !state || !zip) && styles.primaryButtonDisabled,
              ]}
              onPress={handleValidateAddress}
              disabled={!streetAddress || !city || !state || !zip || isValidating}
            >
              {isValidating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify Address</Text>
              )}
            </Pressable>
          </View>
        </>
      )}

      {/* Verification Step */}
      {step === 'verification' && (
        <>
          <View style={styles.verificationContainer}>
            <View style={styles.successIcon}>
              <Icon name="checkmark" size="xl" color="#fff" />
            </View>

            <Text variant="h3" style={styles.verificationTitle}>
              Address Verified
            </Text>

            <View style={styles.addressCard}>
              <Text style={styles.addressLine}>{streetAddress}</Text>
              {secondaryAddress && (
                <Text style={styles.addressLine}>{secondaryAddress}</Text>
              )}
              <Text style={styles.addressLine}>
                {city}, {state} {zip}
              </Text>
            </View>

            {deliveryInstructions && (
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsLabel}>Delivery Instructions</Text>
                <Text style={styles.instructionsText}>{deliveryInstructions}</Text>
              </View>
            )}

            <Pressable style={styles.editButton} onPress={() => setStep('details')}>
              <Icon name="edit" size="sm" color={tokens.colors.semantic.brand.primary.default} />
              <Text style={styles.editButtonText}>Edit Address</Text>
            </Pressable>
          </View>

          <View style={styles.bottomActions}>
            <Pressable
              style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
              onPress={handleConfirmAddress}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Confirm & Continue</Text>
              )}
            </Pressable>
          </View>
        </>
      )}

      {/* Cancel Button */}
      {showCancel && onCancel && step === 'search' && (
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
    padding: tokens.spacing[4],
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[2],
    marginBottom: tokens.spacing[2],
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: tokens.colors.semantic.border.default,
  },
  title: {
    textAlign: 'center',
    marginBottom: tokens.spacing[2],
  },
  subtitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[6],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    gap: tokens.spacing[3],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: tokens.colors.semantic.text.primary,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  locationButtonText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
  locationErrorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${tokens.colors.semantic.status.warning.default}15`,
    borderRadius: 12,
    padding: tokens.spacing[3],
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[3],
  },
  locationErrorText: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.semantic.status.warning.default,
    lineHeight: 20,
  },
  suggestionsContainer: {
    maxHeight: 250,
    borderRadius: 12,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing[4],
    gap: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionMain: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  suggestionSecondary: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },
  manualEntryButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[4],
    marginTop: tokens.spacing[4],
  },
  manualEntryText: {
    color: tokens.colors.semantic.text.secondary,
    textDecorationLine: 'underline',
  },

  // Form
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: tokens.spacing[4],
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[2],
  },
  textInput: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    fontSize: 16,
    color: tokens.colors.semantic.text.primary,
  },
  textInputRequired: {
    borderWidth: 2,
    borderColor: tokens.colors.semantic.status.warning.default,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
  },

  // Validation Message
  validationMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: tokens.spacing[4],
    borderRadius: 12,
    marginBottom: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  validationWarning: {
    backgroundColor: `${tokens.colors.semantic.status.warning.default}15`,
  },
  validationError: {
    backgroundColor: `${tokens.colors.semantic.status.error.default}15`,
  },
  validationTextContainer: {
    flex: 1,
  },
  validationTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  validationText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },

  // Verification
  verificationContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: tokens.spacing[8],
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tokens.colors.semantic.status.success.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[4],
  },
  verificationTitle: {
    marginBottom: tokens.spacing[6],
  },
  addressCard: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    width: '100%',
    marginBottom: tokens.spacing[4],
  },
  addressLine: {
    fontSize: 16,
    color: tokens.colors.semantic.text.primary,
    lineHeight: 24,
  },
  instructionsCard: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    width: '100%',
    marginBottom: tokens.spacing[4],
  },
  instructionsLabel: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[1],
  },
  instructionsText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    paddingVertical: tokens.spacing[2],
  },
  editButtonText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },

  // Buttons
  bottomActions: {
    paddingTop: tokens.spacing[4],
  },
  primaryButton: {
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 12,
    paddingVertical: tokens.spacing[4],
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[4],
  },
  cancelButtonText: {
    color: tokens.colors.semantic.text.secondary,
  },
});

export default AddressEntry;
