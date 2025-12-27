import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useBiometricAuth, getBiometricName } from '@/hooks/use-biometric-auth';

interface BiometricPromptProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onError?: (error: string) => void;
}

/**
 * Modal component that prompts for biometric authentication
 *
 * Usage:
 * ```tsx
 * <BiometricPrompt
 *   visible={showBiometric}
 *   title="Confirm Payment"
 *   subtitle="Use Face ID to confirm this payment"
 *   onSuccess={() => processPayment()}
 *   onCancel={() => setShowBiometric(false)}
 * />
 * ```
 */
export function BiometricPrompt({
  visible,
  title = 'Authentication Required',
  subtitle,
  onSuccess,
  onCancel,
  onError,
}: BiometricPromptProps) {
  const { biometricType, isAvailable, isEnrolled, authenticate, isLoading } = useBiometricAuth();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const biometricName = getBiometricName(biometricType);

  const defaultSubtitle = subtitle || `Use ${biometricName} to continue`;

  // Auto-trigger authentication when modal becomes visible
  useEffect(() => {
    if (visible && !isLoading && isAvailable && isEnrolled) {
      handleAuthenticate();
    } else if (visible && !isLoading && (!isAvailable || !isEnrolled)) {
      // If biometrics aren't available, auto-success (or you could show PIN entry)
      console.log('[BiometricPrompt] Biometrics not available, allowing action');
      onSuccess();
    }
  }, [visible, isLoading]);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    setError(null);

    const result = await authenticate(defaultSubtitle);

    setIsAuthenticating(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Authentication failed');
      onError?.(result.error || 'Authentication failed');
    }
  };

  const getIcon = () => {
    switch (biometricType) {
      case 'facial':
        return 'scan'; // Face scan icon
      case 'fingerprint':
        return 'finger-print';
      default:
        return 'lock';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Icon
                name={getIcon()}
                size="xl"
                color={tokens.colors.semantic.brand.primary.default}
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{defaultSubtitle}</Text>

            {/* Error */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon
                  name="info-circle"
                  size="sm"
                  color={tokens.colors.semantic.status.error.default}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              {error && (
                <Pressable
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleAuthenticate}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  )}
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onCancel}
                disabled={isAuthenticating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 340,
  },
  card: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 20,
    padding: tokens.spacing[6],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[4],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: tokens.colors.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: tokens.spacing[4],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.status.error.subtle,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    borderRadius: 12,
    marginBottom: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  errorText: {
    flex: 1,
    color: tokens.colors.semantic.status.error.default,
    fontSize: 14,
  },
  actions: {
    width: '100%',
    gap: tokens.spacing[3],
  },
  retryButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingVertical: tokens.spacing[4],
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: tokens.spacing[3],
    alignItems: 'center',
  },
  cancelButtonText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
