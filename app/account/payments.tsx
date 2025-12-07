import { ScrollView, StyleSheet, View, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

// Mock payment methods data
const INITIAL_PAYMENT_METHODS = [
  {
    id: '1',
    type: 'card',
    brand: 'Visa',
    lastFour: '4242',
    expiryMonth: '12',
    expiryYear: '25',
    isDefault: true,
    icon: 'card',
  },
  {
    id: '2',
    type: 'card',
    brand: 'Mastercard',
    lastFour: '8888',
    expiryMonth: '06',
    expiryYear: '26',
    isDefault: false,
    icon: 'card',
  },
  {
    id: '3',
    type: 'apple_pay',
    brand: 'Apple Pay',
    lastFour: '',
    isDefault: false,
    icon: 'logo-apple',
  },
];

const CARD_BRANDS: Record<string, { color: string; bgColor: string }> = {
  'Visa': { color: '#1A1F71', bgColor: '#F0F4FF' },
  'Mastercard': { color: '#EB001B', bgColor: '#FFF0F0' },
  'Apple Pay': { color: '#000000', bgColor: '#F5F5F5' },
  'Google Pay': { color: '#4285F4', bgColor: '#E8F0FE' },
};

export default function PaymentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [paymentMethods, setPaymentMethods] = useState(INITIAL_PAYMENT_METHODS);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleAddPayment = () => {
    console.log('Add new payment method');
  };

  const handleDeletePayment = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === id,
    })));
  };

  const getCardBrandStyle = (brand: string) => {
    return CARD_BRANDS[brand] || { color: tokens.colors.semantic.text.secondary, bgColor: tokens.colors.semantic.surface.secondary };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Payment Methods</Text>
        <Pressable style={styles.addButton} onPress={handleAddPayment}>
          <Icon name="plus" size="md" color={tokens.colors.semantic.brand.primary.default} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Section */}
        <View style={styles.walletSection}>
          <Text style={styles.sectionTitle}>Thriptify Wallet</Text>
          <Pressable
            style={styles.walletCard}
            onPress={() => router.push('/account/wallet')}
          >
            <View style={styles.walletIconContainer}>
              <Icon name="wallet" size="lg" color={tokens.colors.semantic.surface.primary} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Available Balance</Text>
              <Text variant="h3" style={styles.walletBalance}>$24.50</Text>
            </View>
            <Icon name="chevron-right" size="md" color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>

        {/* Add Payment Methods */}
        <View style={styles.addMethodsSection}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddRow}>
            <Pressable style={styles.quickAddButton}>
              <View style={[styles.quickAddIcon, { backgroundColor: '#F5F5F5' }]}>
                <Icon name="logo-apple" size="md" color="#000000" />
              </View>
              <Text style={styles.quickAddText}>Apple Pay</Text>
            </Pressable>
            <Pressable style={styles.quickAddButton}>
              <View style={[styles.quickAddIcon, { backgroundColor: '#E8F0FE' }]}>
                <Icon name="logo-google" size="md" color="#4285F4" />
              </View>
              <Text style={styles.quickAddText}>Google Pay</Text>
            </Pressable>
            <Pressable style={styles.quickAddButton} onPress={handleAddPayment}>
              <View style={[styles.quickAddIcon, { backgroundColor: tokens.colors.semantic.surface.secondary }]}>
                <Icon name="card" size="md" color={tokens.colors.semantic.text.secondary} />
              </View>
              <Text style={styles.quickAddText}>Card</Text>
            </Pressable>
          </View>
        </View>

        {/* Saved Payment Methods */}
        <View style={styles.savedMethodsSection}>
          <Text style={styles.sectionTitle}>Saved Methods</Text>
          <View style={styles.methodsList}>
            {paymentMethods.map((method) => {
              const brandStyle = getCardBrandStyle(method.brand);
              return (
                <Pressable
                  key={method.id}
                  style={[
                    styles.methodCard,
                    method.isDefault && styles.methodCardDefault,
                  ]}
                  onPress={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
                >
                  <View style={styles.methodHeader}>
                    <View style={[styles.methodIcon, { backgroundColor: brandStyle.bgColor }]}>
                      <Icon name={method.icon} size="md" color={brandStyle.color} />
                    </View>
                    <View style={styles.methodInfo}>
                      <View style={styles.methodTitleRow}>
                        <Text style={styles.methodBrand}>{method.brand}</Text>
                        {method.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      {method.lastFour ? (
                        <Text style={styles.methodDetails}>
                          •••• {method.lastFour} · Expires {method.expiryMonth}/{method.expiryYear}
                        </Text>
                      ) : (
                        <Text style={styles.methodDetails}>Connected</Text>
                      )}
                    </View>
                    <Pressable
                      style={styles.expandButton}
                      onPress={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
                    >
                      <Icon
                        name={selectedMethod === method.id ? 'chevron-up' : 'chevron-down'}
                        size="sm"
                        color={tokens.colors.semantic.text.tertiary}
                      />
                    </Pressable>
                  </View>

                  {/* Expanded Actions */}
                  {selectedMethod === method.id && (
                    <View style={styles.methodActions}>
                      {!method.isDefault && (
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => handleSetDefault(method.id)}
                        >
                          <Icon name="checkmark-circle" size="sm" color={tokens.colors.semantic.text.secondary} />
                          <Text style={styles.actionButtonText}>Set as Default</Text>
                        </Pressable>
                      )}
                      <Pressable
                        style={[styles.actionButton, styles.actionButtonDelete]}
                        onPress={() => handleDeletePayment(method.id)}
                      >
                        <Icon name="trash" size="sm" color={tokens.colors.semantic.status.error.default} />
                        <Text style={[styles.actionButtonText, styles.actionButtonTextDelete]}>Remove</Text>
                      </Pressable>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Icon name="shield-checkmark" size="md" color={tokens.colors.semantic.status.success.default} />
          <Text style={styles.securityText}>
            Your payment information is encrypted and stored securely. We never share your financial data.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
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
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: tokens.spacing[4],
  },
  sectionTitle: {
    fontSize: 13,
    color: tokens.colors.semantic.text.tertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tokens.spacing[3],
  },
  // Wallet Section
  walletSection: {
    marginBottom: tokens.spacing[6],
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 16,
    padding: tokens.spacing[4],
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
    marginLeft: tokens.spacing[3],
  },
  walletLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  walletBalance: {
    color: tokens.colors.semantic.surface.primary,
  },
  // Quick Add Section
  addMethodsSection: {
    marginBottom: tokens.spacing[6],
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
  },
  quickAddButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  quickAddIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[2],
  },
  quickAddText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.primary,
    fontWeight: '500',
  },
  // Saved Methods Section
  savedMethodsSection: {
    marginBottom: tokens.spacing[6],
  },
  methodsList: {
    gap: tokens.spacing[3],
  },
  methodCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  methodCardDefault: {
    borderColor: tokens.colors.semantic.brand.primary.default,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  methodBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  defaultBadge: {
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  methodDetails: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },
  expandButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Method Actions
  methodActions: {
    flexDirection: 'row',
    paddingTop: tokens.spacing[3],
    marginTop: tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    gap: tokens.spacing[2],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 8,
    gap: tokens.spacing[1],
  },
  actionButtonDelete: {
    backgroundColor: `${tokens.colors.semantic.status.error.default}10`,
  },
  actionButtonText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    fontWeight: '500',
  },
  actionButtonTextDelete: {
    color: tokens.colors.semantic.status.error.default,
  },
  // Security Note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${tokens.colors.semantic.status.success.default}10`,
    borderRadius: 12,
    padding: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 18,
  },
});
