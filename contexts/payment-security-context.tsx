import React, { createContext, useContext, useState, useCallback } from 'react';
import { BiometricPrompt } from '@/components/auth';

/**
 * Payment methods that have their own authentication
 * These do NOT require additional biometric auth from our app
 */
export type NativePaymentMethod = 'apple_pay' | 'google_pay' | 'samsung_pay';

/**
 * Payment methods that require our biometric auth
 */
export type CardPaymentMethod = 'saved_card' | 'new_card';

export type PaymentMethod = NativePaymentMethod | CardPaymentMethod;

/**
 * Sensitive actions that require biometric authentication
 */
export type SensitiveAction =
  | 'view_saved_cards'
  | 'add_payment_method'
  | 'delete_payment_method'
  | 'pay_with_saved_card'
  | 'pay_with_new_card'
  | 'change_address'
  | 'view_wallet_balance'
  | 'transfer_wallet_balance';

interface PaymentSecurityContextType {
  /**
   * Request biometric authentication for a sensitive action
   * Returns true if authenticated, false if cancelled/failed
   */
  requireAuth: (
    action: SensitiveAction,
    options?: {
      title?: string;
      subtitle?: string;
    }
  ) => Promise<boolean>;

  /**
   * Check if a payment method requires additional biometric auth
   */
  requiresBiometric: (method: PaymentMethod) => boolean;

  /**
   * Check if user is currently authenticated for sensitive actions
   * (within the grace period)
   */
  isAuthenticated: boolean;

  /**
   * Clear authentication status (e.g., when app goes to background)
   */
  clearAuth: () => void;
}

const PaymentSecurityContext = createContext<PaymentSecurityContextType | null>(null);

// Grace period in milliseconds (5 minutes)
// User won't need to re-authenticate within this window
const AUTH_GRACE_PERIOD = 5 * 60 * 1000;

interface PaymentSecurityProviderProps {
  children: React.ReactNode;
}

export function PaymentSecurityProvider({ children }: PaymentSecurityProviderProps) {
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [lastAuthTime, setLastAuthTime] = useState<number | null>(null);
  const [promptConfig, setPromptConfig] = useState({
    title: 'Authentication Required',
    subtitle: 'Confirm your identity to continue',
  });
  const [pendingResolve, setPendingResolve] = useState<((value: boolean) => void) | null>(null);

  // Check if within grace period
  const isAuthenticated = lastAuthTime
    ? Date.now() - lastAuthTime < AUTH_GRACE_PERIOD
    : false;

  const requiresBiometric = useCallback((method: PaymentMethod): boolean => {
    // Native payment methods handle their own auth
    const nativeMethods: PaymentMethod[] = ['apple_pay', 'google_pay', 'samsung_pay'];
    return !nativeMethods.includes(method);
  }, []);

  const requireAuth = useCallback(
    (
      action: SensitiveAction,
      options?: { title?: string; subtitle?: string }
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        // If already authenticated within grace period, allow immediately
        if (isAuthenticated) {
          console.log('[PaymentSecurity] Within grace period, allowing action:', action);
          resolve(true);
          return;
        }

        // Configure prompt based on action
        const config = getPromptConfig(action, options);
        setPromptConfig(config);

        // Store resolve function for when auth completes
        setPendingResolve(() => resolve);

        // Show biometric prompt
        setShowBiometricPrompt(true);
      });
    },
    [isAuthenticated]
  );

  const handleAuthSuccess = useCallback(() => {
    console.log('[PaymentSecurity] Authentication successful');
    setLastAuthTime(Date.now());
    setShowBiometricPrompt(false);
    pendingResolve?.(true);
    setPendingResolve(null);
  }, [pendingResolve]);

  const handleAuthCancel = useCallback(() => {
    console.log('[PaymentSecurity] Authentication cancelled');
    setShowBiometricPrompt(false);
    pendingResolve?.(false);
    setPendingResolve(null);
  }, [pendingResolve]);

  const handleAuthError = useCallback((error: string) => {
    console.log('[PaymentSecurity] Authentication error:', error);
    // Don't close modal on error - let user retry or cancel
  }, []);

  const clearAuth = useCallback(() => {
    console.log('[PaymentSecurity] Clearing authentication');
    setLastAuthTime(null);
  }, []);

  return (
    <PaymentSecurityContext.Provider
      value={{
        requireAuth,
        requiresBiometric,
        isAuthenticated,
        clearAuth,
      }}
    >
      {children}
      <BiometricPrompt
        visible={showBiometricPrompt}
        title={promptConfig.title}
        subtitle={promptConfig.subtitle}
        onSuccess={handleAuthSuccess}
        onCancel={handleAuthCancel}
        onError={handleAuthError}
      />
    </PaymentSecurityContext.Provider>
  );
}

export function usePaymentSecurity() {
  const context = useContext(PaymentSecurityContext);
  if (!context) {
    throw new Error('usePaymentSecurity must be used within a PaymentSecurityProvider');
  }
  return context;
}

/**
 * Get appropriate prompt configuration for each action
 */
function getPromptConfig(
  action: SensitiveAction,
  options?: { title?: string; subtitle?: string }
): { title: string; subtitle: string } {
  if (options?.title && options?.subtitle) {
    return { title: options.title, subtitle: options.subtitle };
  }

  switch (action) {
    case 'view_saved_cards':
      return {
        title: 'View Saved Cards',
        subtitle: 'Authenticate to view your payment methods',
      };
    case 'add_payment_method':
      return {
        title: 'Add Payment Method',
        subtitle: 'Authenticate to add a new card',
      };
    case 'delete_payment_method':
      return {
        title: 'Remove Card',
        subtitle: 'Authenticate to remove this payment method',
      };
    case 'pay_with_saved_card':
      return {
        title: 'Confirm Payment',
        subtitle: 'Authenticate to complete your purchase',
      };
    case 'pay_with_new_card':
      return {
        title: 'Confirm Payment',
        subtitle: 'Authenticate to complete your purchase',
      };
    case 'change_address':
      return {
        title: 'Change Address',
        subtitle: 'Authenticate to update your address',
      };
    case 'view_wallet_balance':
      return {
        title: 'View Wallet',
        subtitle: 'Authenticate to view your wallet balance',
      };
    case 'transfer_wallet_balance':
      return {
        title: 'Transfer Funds',
        subtitle: 'Authenticate to transfer your balance',
      };
    default:
      return {
        title: options?.title || 'Authentication Required',
        subtitle: options?.subtitle || 'Confirm your identity to continue',
      };
  }
}
