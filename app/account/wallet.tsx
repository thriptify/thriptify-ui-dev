import { ScrollView, StyleSheet, View, Pressable, TextInput, Platform, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

// Mock wallet data
const WALLET_DATA = {
  balance: 24.50,
  pendingCredits: 5.00,
  lifetimeSavings: 156.75,
};

// Transaction types
type TransactionType = 'credit' | 'debit' | 'refund' | 'cashback' | 'promo';

interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  description: string;
  amount: number;
  date: string;
  orderId?: string;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'cashback',
    title: 'Cashback Earned',
    description: 'Order #ORD-2024-001',
    amount: 2.30,
    date: 'Dec 5, 2024',
    orderId: 'ORD-2024-001',
  },
  {
    id: 't2',
    type: 'debit',
    title: 'Applied to Order',
    description: 'Order #ORD-2024-002',
    amount: -10.00,
    date: 'Dec 1, 2024',
    orderId: 'ORD-2024-002',
  },
  {
    id: 't3',
    type: 'credit',
    title: 'Added Money',
    description: 'Via Apple Pay',
    amount: 20.00,
    date: 'Nov 28, 2024',
  },
  {
    id: 't4',
    type: 'refund',
    title: 'Refund Received',
    description: 'Order #ORD-2024-003 cancelled',
    amount: 8.99,
    date: 'Nov 25, 2024',
    orderId: 'ORD-2024-003',
  },
  {
    id: 't5',
    type: 'promo',
    title: 'Welcome Bonus',
    description: 'New user reward',
    amount: 5.00,
    date: 'Nov 20, 2024',
  },
  {
    id: 't6',
    type: 'cashback',
    title: 'Cashback Earned',
    description: 'Order #ORD-2024-004',
    amount: 3.21,
    date: 'Nov 15, 2024',
    orderId: 'ORD-2024-004',
  },
];

const TRANSACTION_ICONS: Record<TransactionType, { icon: string; color: string; bgColor: string }> = {
  credit: {
    icon: 'add-circle',
    color: tokens.colors.semantic.status.success.default,
    bgColor: `${tokens.colors.semantic.status.success.default}15`,
  },
  debit: {
    icon: 'remove-circle',
    color: tokens.colors.semantic.status.error.default,
    bgColor: `${tokens.colors.semantic.status.error.default}15`,
  },
  refund: {
    icon: 'refresh-circle',
    color: tokens.colors.semantic.brand.primary.default,
    bgColor: `${tokens.colors.semantic.brand.primary.default}15`,
  },
  cashback: {
    icon: 'gift',
    color: '#FF9800',
    bgColor: '#FFF3E0',
  },
  promo: {
    icon: 'pricetag',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
  },
};

const QUICK_ADD_AMOUNTS = [10, 20, 50, 100];

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleAddMoney = () => {
    setShowAddMoney(true);
  };

  const handleConfirmAddMoney = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (amount > 0) {
      console.log('Adding money:', amount);
      // In a real app, this would initiate a payment flow
    }
    setShowAddMoney(false);
    setSelectedAmount(null);
    setCustomAmount('');
  };

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const getTransactionStyle = (type: TransactionType) => {
    return TRANSACTION_ICONS[type];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Thriptify Money</Text>
        <Pressable style={styles.infoButton}>
          <Icon name="help-circle" size="md" color={tokens.colors.semantic.text.secondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.walletIconLarge}>
              <Icon name="wallet" size="xl" color={tokens.colors.semantic.surface.primary} />
            </View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>${WALLET_DATA.balance.toFixed(2)}</Text>
            {WALLET_DATA.pendingCredits > 0 && (
              <Text style={styles.pendingCredits}>
                + ${WALLET_DATA.pendingCredits.toFixed(2)} pending
              </Text>
            )}
          </View>
          <Pressable style={styles.addMoneyButton} onPress={handleAddMoney}>
            <Icon name="add" size="sm" color={tokens.colors.semantic.brand.primary.default} />
            <Text style={styles.addMoneyButtonText}>Add Money</Text>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="trending-up" size="md" color={tokens.colors.semantic.status.success.default} />
            <Text style={styles.statValue}>${WALLET_DATA.lifetimeSavings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Lifetime Savings</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="gift" size="md" color="#FF9800" />
            <Text style={styles.statValue}>5%</Text>
            <Text style={styles.statLabel}>Cashback Rate</Text>
          </View>
        </View>

        {/* Promo Section */}
        <Pressable style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Icon name="flash" size="lg" color="#FFD700" />
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>Get 10% Extra</Text>
              <Text style={styles.promoDescription}>Add $50 or more and get 10% bonus</Text>
            </View>
          </View>
          <Icon name="chevron-right" size="md" color="rgba(255,255,255,0.8)" />
        </Pressable>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <Pressable>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.transactionsList}>
            {TRANSACTIONS.map((transaction) => {
              const style = getTransactionStyle(transaction.type);
              return (
                <Pressable key={transaction.id} style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, { backgroundColor: style.bgColor }]}>
                    <Icon name={style.icon} size="md" color={style.color} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.amount > 0
                        ? styles.transactionAmountPositive
                        : styles.transactionAmountNegative,
                    ]}
                  >
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            <Pressable style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I use Thriptify Money?</Text>
              <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.tertiary} />
            </Pressable>
            <Pressable style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What is the cashback policy?</Text>
              <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.tertiary} />
            </Pressable>
            <Pressable style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do refunds work?</Text>
              <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.tertiary} />
            </Pressable>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Money Modal */}
      <Modal
        visible={showAddMoney}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddMoney(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + tokens.spacing[4] }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3" style={styles.modalTitle}>Add Money</Text>
              <Pressable style={styles.modalCloseButton} onPress={() => setShowAddMoney(false)}>
                <Icon name="close" size="md" color={tokens.colors.semantic.text.primary} />
              </Pressable>
            </View>

            {/* Quick Amount Selection */}
            <Text style={styles.quickAmountLabel}>Select Amount</Text>
            <View style={styles.quickAmounts}>
              {QUICK_ADD_AMOUNTS.map((amount) => (
                <Pressable
                  key={amount}
                  style={[
                    styles.quickAmountButton,
                    selectedAmount === amount && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => handleSelectAmount(amount)}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      selectedAmount === amount && styles.quickAmountTextActive,
                    ]}
                  >
                    ${amount}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Custom Amount */}
            <Text style={styles.customAmountLabel}>Or enter custom amount</Text>
            <View style={styles.customAmountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.customAmountInput}
                value={customAmount}
                onChangeText={(text) => {
                  setCustomAmount(text);
                  setSelectedAmount(null);
                }}
                placeholder="0.00"
                placeholderTextColor={tokens.colors.semantic.text.tertiary}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Promo Info */}
            <View style={styles.promoInfo}>
              <Icon name="information-circle" size="sm" color={tokens.colors.semantic.brand.primary.default} />
              <Text style={styles.promoInfoText}>
                Add $50 or more to get 10% bonus credits!
              </Text>
            </View>

            {/* Payment Method */}
            <View style={styles.paymentMethodSection}>
              <Text style={styles.paymentMethodLabel}>Payment Method</Text>
              <Pressable style={styles.paymentMethodCard}>
                <View style={styles.paymentMethodIcon}>
                  <Icon name="logo-apple" size="md" color="#000000" />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>Apple Pay</Text>
                  <Text style={styles.paymentMethodDetail}>Default</Text>
                </View>
                <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.tertiary} />
              </Pressable>
            </View>

            {/* Confirm Button */}
            <Pressable
              style={[
                styles.confirmButton,
                !(selectedAmount || parseFloat(customAmount) > 0) && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmAddMoney}
              disabled={!(selectedAmount || parseFloat(customAmount) > 0)}
            >
              <Text style={styles.confirmButtonText}>
                Add ${(selectedAmount || parseFloat(customAmount) || 0).toFixed(2)}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  infoButton: {
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
  // Balance Card
  balanceCard: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 20,
    padding: tokens.spacing[6],
    alignItems: 'center',
    marginBottom: tokens.spacing[4],
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: tokens.spacing[6],
  },
  walletIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[3],
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: tokens.spacing[1],
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: tokens.colors.semantic.surface.primary,
  },
  pendingCredits: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: tokens.spacing[1],
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
    borderRadius: 12,
    gap: tokens.spacing[2],
  },
  addMoneyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.brand.primary.default,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[4],
  },
  statCard: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
    marginTop: tokens.spacing[2],
  },
  statLabel: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: tokens.spacing[1],
  },
  // Promo Card
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 16,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
  },
  promoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.surface.primary,
    marginBottom: 2,
  },
  promoDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  // Transactions Section
  transactionsSection: {
    marginBottom: tokens.spacing[6],
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
  transactionsList: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionAmountPositive: {
    color: tokens.colors.semantic.status.success.default,
  },
  transactionAmountNegative: {
    color: tokens.colors.semantic.status.error.default,
  },
  // FAQ Section
  faqSection: {
    marginBottom: tokens.spacing[6],
  },
  faqList: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: tokens.spacing[3],
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  faqQuestion: {
    fontSize: 15,
    color: tokens.colors.semantic.text.primary,
    flex: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: tokens.spacing[4],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing[6],
  },
  modalTitle: {
    color: tokens.colors.semantic.text.primary,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmountLabel: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[2],
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[4],
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: tokens.spacing[4],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderColor: tokens.colors.semantic.brand.primary.default,
  },
  quickAmountText: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  quickAmountTextActive: {
    color: tokens.colors.semantic.surface.primary,
  },
  customAmountLabel: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[2],
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: tokens.colors.semantic.text.secondary,
    marginRight: tokens.spacing[2],
  },
  customAmountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    paddingVertical: tokens.spacing[4],
  },
  promoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${tokens.colors.semantic.brand.primary.default}10`,
    borderRadius: 8,
    padding: tokens.spacing[3],
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[4],
  },
  promoInfoText: {
    flex: 1,
    fontSize: 13,
    color: tokens.colors.semantic.brand.primary.default,
  },
  paymentMethodSection: {
    marginBottom: tokens.spacing[4],
  },
  paymentMethodLabel: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[2],
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    padding: tokens.spacing[3],
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  paymentMethodDetail: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  confirmButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 12,
    padding: tokens.spacing[4],
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.surface.primary,
  },
});
