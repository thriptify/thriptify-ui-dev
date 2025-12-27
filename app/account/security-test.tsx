import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useAppAuth } from '@/contexts/auth-context';
import * as SecureStore from 'expo-secure-store';
import { useBiometricAuth, getBiometricName } from '@/hooks/use-biometric-auth';
import { usePaymentSecurity } from '@/contexts/payment-security-context';

export default function SecurityTestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [storedTokens, setStoredTokens] = useState<Record<string, string>>({});

  const { getToken, user, firebaseUser } = useAppAuth();

  const {
    isAvailable,
    biometricType,
    isEnrolled,
    isLoading,
    authenticate,
  } = useBiometricAuth();

  const {
    requireAuth,
    requiresBiometric,
    isAuthenticated,
    clearAuth,
  } = usePaymentSecurity();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Decode JWT without verification (for display purposes only)
  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      // Base64 decode (handle URL-safe base64)
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return null;
    }
  };

  const fetchToken = async () => {
    try {
      addResult('Fetching JWT token...');
      const token = await getToken();
      if (token) {
        setJwtToken(token);
        const decoded = decodeJWT(token);
        setDecodedToken(decoded);
        addResult('✅ JWT token fetched successfully');
        console.log('[JWT] Token:', token);
        console.log('[JWT] Decoded:', decoded);
      } else {
        addResult('❌ No token available (not signed in?)');
      }

      // Fetch stored tokens from SecureStore
      await fetchStoredTokens();
    } catch (error) {
      addResult(`❌ Error fetching token: ${error}`);
    }
  };

  const fetchLongLivedToken = async (templateName?: string) => {
    try {
      const template = templateName || 'long-lived-api';
      addResult(`Fetching token with template: ${template}...`);

      const token = await getToken({ template });

      if (token) {
        setJwtToken(token);
        const decoded = decodeJWT(token);
        setDecodedToken(decoded);

        const lifetime = decoded?.exp && decoded?.iat
          ? Math.round((decoded.exp - decoded.iat) / 60)
          : 'unknown';

        addResult(`✅ Long-lived token fetched (${lifetime} min lifetime)`);
        console.log('='.repeat(60));
        console.log('[JWT] LONG-LIVED TOKEN (copy this):');
        console.log(token);
        console.log('='.repeat(60));
        console.log('[JWT] Decoded:', decoded);
      } else {
        addResult('❌ No token returned. Make sure template exists in Clerk Dashboard.');
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      addResult(`❌ Template "${templateName || 'long-lived-api'}" not found`);
      addResult('ℹ️ Create it in Clerk Dashboard → JWT Templates');
      addResult('ℹ️ Using default token instead...');
      console.error('[JWT] Template error:', errorMsg);

      // Fallback to default token
      const token = await getToken();
      if (token) {
        setJwtToken(token);
        const decoded = decodeJWT(token);
        setDecodedToken(decoded);
        addResult('✅ Default token fetched (use this for testing)');
        console.log('='.repeat(60));
        console.log('[JWT] DEFAULT TOKEN (copy this):');
        console.log(token);
        console.log('='.repeat(60));
      }
    }
  };

  const fetchStoredTokens = async () => {
    try {
      addResult('Fetching stored tokens from SecureStore...');

      // Known Clerk token keys
      const keysToCheck = [
        '__clerk_client_jwt',
        '__clerk_session_jwt',
        'clerk_session_jwt',
        '__clerk_db_jwt',
        'clerk-db-jwt',
        '__clerk_refresh_token',
        'clerk_refresh_token',
      ];

      const tokens: Record<string, string> = {};

      for (const key of keysToCheck) {
        try {
          const value = await SecureStore.getItemAsync(key);
          if (value) {
            tokens[key] = value;
            // Print full token to console
            console.log('='.repeat(60));
            console.log(`[SecureStore] KEY: ${key}`);
            console.log(`[SecureStore] VALUE (full):`);
            console.log(value);
            console.log('='.repeat(60));
            addResult(`✅ Found: ${key}`);
          }
        } catch (e) {
          // Key doesn't exist, continue
        }
      }

      setStoredTokens(tokens);

      if (Object.keys(tokens).length === 0) {
        addResult('ℹ️ No stored tokens found in SecureStore');
      }
    } catch (error) {
      addResult(`❌ Error reading SecureStore: ${error}`);
    }
  };

  // Fetch token on mount
  useEffect(() => {
    fetchToken();
  }, []);

  const testDirectBiometric = async () => {
    addResult('Testing direct biometric...');
    const result = await authenticate('Test authentication');
    addResult(result.success ? '✅ Direct biometric SUCCESS' : `❌ Direct biometric FAILED: ${result.error}`);
  };

  const testViewSavedCards = async () => {
    addResult('Testing view saved cards...');
    const success = await requireAuth('view_saved_cards');
    addResult(success ? '✅ View saved cards AUTHORIZED' : '❌ View saved cards DENIED');
  };

  const testPayWithSavedCard = async () => {
    addResult('Testing pay with saved card...');
    const success = await requireAuth('pay_with_saved_card');
    addResult(success ? '✅ Payment AUTHORIZED' : '❌ Payment DENIED');
  };

  const testAddPaymentMethod = async () => {
    addResult('Testing add payment method...');
    const success = await requireAuth('add_payment_method');
    addResult(success ? '✅ Add payment AUTHORIZED' : '❌ Add payment DENIED');
  };

  const testGracePeriod = async () => {
    addResult('Testing grace period (should NOT prompt if recently authenticated)...');
    const success = await requireAuth('view_saved_cards');
    addResult(success
      ? '✅ Grace period working (no prompt needed)'
      : '❌ Grace period test - user cancelled');
  };

  const testClearAuth = () => {
    clearAuth();
    addResult('🔄 Auth cleared - next action will require biometric');
  };

  const checkPaymentMethods = () => {
    const methods = [
      { name: 'Apple Pay', method: 'apple_pay' as const },
      { name: 'Google Pay', method: 'google_pay' as const },
      { name: 'Samsung Pay', method: 'samsung_pay' as const },
      { name: 'Saved Card', method: 'saved_card' as const },
      { name: 'New Card', method: 'new_card' as const },
    ];

    methods.forEach(({ name, method }) => {
      const needs = requiresBiometric(method);
      addResult(`${name}: ${needs ? '🔐 Requires biometric' : '✅ No biometric needed'}`);
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Security Test</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* JWT Token Card */}
        <View style={styles.card}>
          <View style={styles.resultsHeader}>
            <Text style={styles.cardTitle}>JWT Token</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable onPress={fetchToken}>
                <Text style={styles.clearText}>Default</Text>
              </Pressable>
              <Pressable onPress={() => fetchLongLivedToken()}>
                <Text style={[styles.clearText, { color: tokens.colors.semantic.status.success.default }]}>Long-Lived</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>User ID:</Text>
            <Text style={styles.statusValue} numberOfLines={1}>{user?.id || 'Not signed in'}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Session ID:</Text>
            <Text style={styles.statusValue} numberOfLines={1}>{firebaseUser?.uid || 'No session'}</Text>
          </View>

          {decodedToken && (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Issued At:</Text>
                <Text style={styles.statusValue}>
                  {decodedToken.iat ? new Date(decodedToken.iat * 1000).toLocaleString() : 'N/A'}
                </Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Expires:</Text>
                <Text style={styles.statusValue}>
                  {decodedToken.exp ? new Date(decodedToken.exp * 1000).toLocaleString() : 'N/A'}
                </Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Token Lifetime:</Text>
                <Text style={styles.statusValue}>
                  {decodedToken.exp && decodedToken.iat
                    ? `${Math.round((decodedToken.exp - decodedToken.iat) / 60)} minutes`
                    : 'N/A'}
                </Text>
              </View>
            </>
          )}

          {jwtToken && (
            <View style={styles.tokenContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.tokenLabel}>Raw JWT Token:</Text>
                <Pressable
                  onPress={async () => {
                    await Clipboard.setStringAsync(jwtToken);
                    addResult('✅ Token copied to clipboard!');
                    Alert.alert('Copied!', 'JWT token copied to clipboard');
                  }}
                  style={styles.copyButton}
                >
                  <Icon name="copy" size="sm" color={tokens.colors.semantic.brand.primary.default} />
                  <Text style={styles.clearText}>Copy</Text>
                </Pressable>
              </View>
              <Text style={styles.tokenValue} selectable>{jwtToken}</Text>
            </View>
          )}

          {decodedToken && (
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenLabel}>Decoded Payload:</Text>
              <Text style={styles.tokenValue} selectable>
                {JSON.stringify(decodedToken, null, 2)}
              </Text>
            </View>
          )}

          {Object.keys(storedTokens).length > 0 && (
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenLabel}>Stored Tokens (SecureStore):</Text>
              {Object.entries(storedTokens).map(([key, value]) => (
                <View key={key} style={styles.storedTokenItem}>
                  <View style={styles.resultsHeader}>
                    <Text style={styles.storedTokenKey}>{key}</Text>
                    <Pressable
                      onPress={async () => {
                        await Clipboard.setStringAsync(value);
                        addResult(`✅ ${key} copied to clipboard!`);
                        Alert.alert('Copied!', `${key} copied to clipboard`);
                      }}
                      style={styles.copyButton}
                    >
                      <Icon name="copy" size="sm" color={tokens.colors.semantic.brand.primary.default} />
                      <Text style={styles.clearText}>Copy</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.tokenValue} selectable>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Biometric Status</Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Loading:</Text>
            <Text style={styles.statusValue}>{isLoading ? 'Yes' : 'No'}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Hardware Available:</Text>
            <Text style={[styles.statusValue, { color: isAvailable ? 'green' : 'red' }]}>
              {isAvailable ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Biometric Type:</Text>
            <Text style={styles.statusValue}>{getBiometricName(biometricType)}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Enrolled:</Text>
            <Text style={[styles.statusValue, { color: isEnrolled ? 'green' : 'orange' }]}>
              {isEnrolled ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Session Authenticated:</Text>
            <Text style={[styles.statusValue, { color: isAuthenticated ? 'green' : 'gray' }]}>
              {isAuthenticated ? 'Yes (in grace period)' : 'No'}
            </Text>
          </View>
        </View>

        {/* Test Buttons */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test Actions</Text>

          <Pressable style={styles.testButton} onPress={testDirectBiometric}>
            <Icon name="finger-print" size="sm" color={tokens.colors.semantic.brand.primary.default} />
            <Text style={styles.testButtonText}>Test Direct Biometric</Text>
          </Pressable>

          <Pressable style={styles.testButton} onPress={testViewSavedCards}>
            <Icon name="card" size="sm" color={tokens.colors.semantic.brand.primary.default} />
            <Text style={styles.testButtonText}>Test: View Saved Cards</Text>
          </Pressable>

          <Pressable style={styles.testButton} onPress={testPayWithSavedCard}>
            <Icon name="bag" size="sm" color={tokens.colors.semantic.brand.primary.default} />
            <Text style={styles.testButtonText}>Test: Pay with Saved Card</Text>
          </Pressable>

          <Pressable style={styles.testButton} onPress={testAddPaymentMethod}>
            <Icon name="add-circle" size="sm" color={tokens.colors.semantic.brand.primary.default} />
            <Text style={styles.testButtonText}>Test: Add Payment Method</Text>
          </Pressable>

          <Pressable style={styles.testButton} onPress={testGracePeriod}>
            <Icon name="time" size="sm" color={tokens.colors.semantic.brand.primary.default} />
            <Text style={styles.testButtonText}>Test: Grace Period (5 min)</Text>
          </Pressable>

          <Pressable style={styles.testButton} onPress={checkPaymentMethods}>
            <Icon name="list" size="sm" color={tokens.colors.semantic.brand.primary.default} />
            <Text style={styles.testButtonText}>Check Payment Method Rules</Text>
          </Pressable>

          <Pressable style={[styles.testButton, styles.dangerButton]} onPress={testClearAuth}>
            <Icon name="close-circle" size="sm" color={tokens.colors.semantic.status.error.default} />
            <Text style={[styles.testButtonText, styles.dangerText]}>Clear Auth (Reset Grace Period)</Text>
          </Pressable>
        </View>

        {/* Results */}
        <View style={styles.card}>
          <View style={styles.resultsHeader}>
            <Text style={styles.cardTitle}>Test Results</Text>
            <Pressable onPress={() => setTestResults([])}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          </View>

          {testResults.length === 0 ? (
            <Text style={styles.noResults}>No tests run yet. Tap a button above.</Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} style={styles.resultItem}>{result}</Text>
            ))
          )}
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Testing Instructions</Text>
          <Text style={styles.instructions}>
            <Text style={styles.bold}>iOS Simulator:</Text>{'\n'}
            Features → Face ID → Enrolled{'\n'}
            Features → Face ID → Matching/Non-matching Face{'\n\n'}

            <Text style={styles.bold}>Android Emulator:</Text>{'\n'}
            Extended Controls → Fingerprint → Touch Sensor{'\n\n'}

            <Text style={styles.bold}>Physical Device:</Text>{'\n'}
            Use your actual Face ID / Touch ID / Fingerprint
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing[4],
    gap: tokens.spacing[4],
    paddingBottom: tokens.spacing[8],
  },
  card: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[3],
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  statusLabel: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    marginBottom: tokens.spacing[2],
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  dangerButton: {
    backgroundColor: tokens.colors.semantic.status.error.subtle,
  },
  dangerText: {
    color: tokens.colors.semantic.status.error.default,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
  },
  clearText: {
    fontSize: 14,
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
  noResults: {
    fontSize: 14,
    color: tokens.colors.semantic.text.tertiary,
    fontStyle: 'italic',
  },
  resultItem: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    paddingVertical: tokens.spacing[1],
    fontFamily: 'monospace',
  },
  instructions: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  tokenContainer: {
    marginTop: tokens.spacing[3],
    padding: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 8,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[2],
  },
  tokenValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: tokens.colors.semantic.text.primary,
    lineHeight: 16,
  },
  storedTokenItem: {
    marginTop: tokens.spacing[2],
    paddingTop: tokens.spacing[2],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  storedTokenKey: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.semantic.brand.primary.default,
    marginBottom: tokens.spacing[1],
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
