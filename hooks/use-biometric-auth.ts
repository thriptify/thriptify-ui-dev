import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

interface UseBiometricAuthReturn {
  // State
  isAvailable: boolean;
  biometricType: BiometricType;
  isEnrolled: boolean;
  isLoading: boolean;

  // Methods
  authenticate: (reason?: string) => Promise<BiometricAuthResult>;
  checkAvailability: () => Promise<void>;
}

/**
 * Hook for biometric authentication (Face ID, Touch ID, Fingerprint)
 *
 * Usage:
 * ```tsx
 * const { isAvailable, biometricType, authenticate } = useBiometricAuth();
 *
 * const handleSensitiveAction = async () => {
 *   const result = await authenticate('Confirm your identity to view saved cards');
 *   if (result.success) {
 *     // Proceed with sensitive action
 *   }
 * };
 * ```
 */
export function useBiometricAuth(): UseBiometricAuthReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAvailability = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if hardware supports biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(compatible);

      if (!compatible) {
        setBiometricType('none');
        setIsEnrolled(false);
        return;
      }

      // Check if biometrics are enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsEnrolled(enrolled);

      // Get supported authentication types
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('facial');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType('iris');
      } else {
        setBiometricType('none');
      }
    } catch (error) {
      console.error('[BiometricAuth] Error checking availability:', error);
      setIsAvailable(false);
      setBiometricType('none');
      setIsEnrolled(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const authenticate = useCallback(
    async (reason?: string): Promise<BiometricAuthResult> => {
      try {
        console.log('[BiometricAuth] Starting authentication...');

        // Check if biometrics are available and enrolled
        if (!isAvailable || !isEnrolled) {
          console.log('[BiometricAuth] Biometrics not available or not enrolled');
          // Fall back to allowing the action if biometrics aren't set up
          // In production, you might want to require a PIN/password instead
          return { success: true };
        }

        const defaultReason = biometricType === 'facial'
          ? 'Confirm with Face ID'
          : 'Confirm with Touch ID';

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: reason || defaultReason,
          cancelLabel: 'Cancel',
          disableDeviceFallback: false, // Allow PIN/password fallback
          fallbackLabel: 'Use Passcode',
        });

        console.log('[BiometricAuth] Result:', result);

        if (result.success) {
          return { success: true };
        }

        // Handle different error cases
        let errorMessage = 'Authentication failed';

        if (result.error === 'user_cancel') {
          errorMessage = 'Authentication cancelled';
        } else if (result.error === 'user_fallback') {
          // User chose to use passcode - this is still handled by the system
          errorMessage = 'Please try again';
        } else if (result.error === 'lockout') {
          errorMessage = 'Too many attempts. Please try again later.';
        } else if (result.error === 'not_enrolled') {
          errorMessage = 'Biometrics not set up on this device';
        }

        return { success: false, error: errorMessage };
      } catch (error) {
        console.error('[BiometricAuth] Error:', error);
        return {
          success: false,
          error: 'Authentication error. Please try again.'
        };
      }
    },
    [isAvailable, isEnrolled, biometricType]
  );

  return {
    isAvailable,
    biometricType,
    isEnrolled,
    isLoading,
    authenticate,
    checkAvailability,
  };
}

/**
 * Get user-friendly name for biometric type
 */
export function getBiometricName(type: BiometricType): string {
  switch (type) {
    case 'facial':
      return 'Face ID';
    case 'fingerprint':
      return 'Touch ID';
    case 'iris':
      return 'Iris Scan';
    default:
      return 'Biometrics';
  }
}
