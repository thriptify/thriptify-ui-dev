import { ScrollView, StyleSheet, View, Pressable, Platform, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useCart } from '@/contexts/cart-context';

// Mock saved addresses
const SAVED_ADDRESSES = [
  {
    id: '1',
    type: 'Home',
    name: 'Alex Smith',
    address: '123 Market Street, Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    phone: '(415) 555-0123',
    isDefault: true,
  },
  {
    id: '2',
    type: 'Work',
    name: 'Alex Smith',
    address: '456 Financial District',
    city: 'San Francisco',
    state: 'CA',
    zip: '94111',
    phone: '(415) 555-0124',
    isDefault: false,
  },
];

// Payment methods
const PAYMENT_METHODS = [
  { id: 'apple', label: 'Apple Pay', icon: 'logo-apple' },
  { id: 'google', label: 'Google Pay', icon: 'logo-google' },
  { id: 'card', label: 'Credit/Debit Card', icon: 'card' },
];

// Wallet balance (would come from context/API in real app)
const WALLET_BALANCE = 24.50;

// Delivery time slots
const TIME_SLOTS = [
  { id: '1', time: 'Within 2 hours', label: 'Express', fee: 2.99 },
  { id: '2', time: '2:00 PM - 4:00 PM', label: 'Today', fee: 0 },
  { id: '3', time: '4:00 PM - 6:00 PM', label: 'Today', fee: 0 },
  { id: '4', time: '10:00 AM - 12:00 PM', label: 'Tomorrow', fee: 0 },
];

type Step = 'address' | 'delivery' | 'payment' | 'confirmation';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, itemCount, subtotal, deliveryFee, handlingFee, total, clearCart } = useCart();

  const [step, setStep] = useState<Step>('address');
  const [selectedAddress, setSelectedAddress] = useState(SAVED_ADDRESSES[0].id);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0].id);
  const [selectedPayment, setSelectedPayment] = useState('apple');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  const selectedSlot = TIME_SLOTS.find(s => s.id === selectedTimeSlot);
  const expressDeliveryFee = selectedSlot?.fee || 0;
  const walletDiscount = useWalletBalance ? Math.min(WALLET_BALANCE, total + expressDeliveryFee) : 0;
  const finalTotal = total + expressDeliveryFee - walletDiscount;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep('confirmation');
    setIsProcessing(false);
  };

  const handleContinueShopping = () => {
    clearCart();
    router.replace('/');
  };

  // Order Confirmation Screen
  if (step === 'confirmation') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.confirmationContainer}>
          <View style={styles.successIcon}>
            <Icon name="checkmark" size="xl" color={tokens.colors.semantic.surface.primary} />
          </View>
          <Text variant="h2" style={styles.confirmationTitle}>Order Placed!</Text>
          <Text style={styles.confirmationSubtitle}>
            Your order has been placed successfully and will be delivered within 2 hours.
          </Text>

          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text variant="body" weight="semibold">#ORD{Date.now().toString().slice(-8)}</Text>
          </View>

          <View style={styles.confirmationCard}>
            <Text variant="bodySmall" weight="semibold" style={styles.confirmationCardTitle}>
              Delivery Address
            </Text>
            <Text style={styles.confirmationCardText}>
              {SAVED_ADDRESSES.find(a => a.id === selectedAddress)?.address}
            </Text>
            <Text style={styles.confirmationCardText}>
              {SAVED_ADDRESSES.find(a => a.id === selectedAddress)?.city}, {SAVED_ADDRESSES.find(a => a.id === selectedAddress)?.state} {SAVED_ADDRESSES.find(a => a.id === selectedAddress)?.zip}
            </Text>
          </View>

          <View style={styles.confirmationCard}>
            <Text variant="bodySmall" weight="semibold" style={styles.confirmationCardTitle}>
              {itemCount} item{itemCount > 1 ? 's' : ''} ordered
            </Text>
            <View style={styles.orderItemsRow}>
              {items.slice(0, 4).map((item, index) => (
                <View key={item.id} style={[styles.orderItemImage, { marginLeft: index > 0 ? -10 : 0 }]}>
                  <Image
                    source={{ uri: item.image }}
                    width={40}
                    height={40}
                    borderRadius={8}
                  />
                </View>
              ))}
              {items.length > 4 && (
                <View style={styles.moreItemsBadge}>
                  <Text style={styles.moreItemsText}>+{items.length - 4}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.confirmationActions}>
            <Pressable style={styles.trackOrderButton} onPress={() => router.push('/')}>
              <Text style={styles.trackOrderText}>Track Order</Text>
            </Pressable>
            <Pressable style={styles.continueShoppingButton} onPress={handleContinueShopping}>
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => {
          if (step === 'address') {
            router.back();
          } else if (step === 'delivery') {
            setStep('address');
          } else if (step === 'payment') {
            setStep('delivery');
          }
        }}>
          <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>
          {step === 'address' ? 'Select Address' : step === 'delivery' ? 'Delivery Time' : 'Payment'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <Text style={[styles.progressLabel, styles.progressLabelActive]}>Address</Text>
        </View>
        <View style={[styles.progressLine, step !== 'address' && styles.progressLineActive]} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, (step === 'delivery' || step === 'payment') && styles.progressDotActive]} />
          <Text style={[styles.progressLabel, (step === 'delivery' || step === 'payment') && styles.progressLabelActive]}>Delivery</Text>
        </View>
        <View style={[styles.progressLine, step === 'payment' && styles.progressLineActive]} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, step === 'payment' && styles.progressDotActive]} />
          <Text style={[styles.progressLabel, step === 'payment' && styles.progressLabelActive]}>Payment</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Address Selection Step */}
        {step === 'address' && (
          <>
            <Text variant="body" weight="semibold" style={styles.sectionTitle}>
              Saved Addresses
            </Text>
            {SAVED_ADDRESSES.map((address) => (
              <Pressable
                key={address.id}
                style={[
                  styles.addressCard,
                  selectedAddress === address.id && styles.addressCardSelected,
                ]}
                onPress={() => setSelectedAddress(address.id)}
              >
                <View style={styles.addressHeader}>
                  <View style={styles.addressTypeContainer}>
                    <Icon
                      name={address.type === 'Home' ? 'home' : 'briefcase'}
                      size="sm"
                      color={tokens.colors.semantic.text.primary}
                    />
                    <Text variant="bodySmall" weight="semibold">{address.type}</Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedAddress === address.id && styles.radioButtonSelected,
                  ]}>
                    {selectedAddress === address.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
                <Text style={styles.addressName}>{address.name}</Text>
                <Text style={styles.addressText}>{address.address}</Text>
                <Text style={styles.addressText}>
                  {address.city}, {address.state} {address.zip}
                </Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
              </Pressable>
            ))}

            <Pressable style={styles.addNewButton}>
              <Icon name="plus" size="sm" color={tokens.colors.semantic.status.success.default} />
              <Text style={styles.addNewText}>Add New Address</Text>
            </Pressable>
          </>
        )}

        {/* Delivery Time Step */}
        {step === 'delivery' && (
          <>
            <Text variant="body" weight="semibold" style={styles.sectionTitle}>
              Select Delivery Time
            </Text>
            {TIME_SLOTS.map((slot) => (
              <Pressable
                key={slot.id}
                style={[
                  styles.timeSlotCard,
                  selectedTimeSlot === slot.id && styles.timeSlotCardSelected,
                ]}
                onPress={() => setSelectedTimeSlot(slot.id)}
              >
                <View style={styles.timeSlotInfo}>
                  <Text variant="bodySmall" weight="semibold">{slot.time}</Text>
                  <View style={styles.timeSlotLabelContainer}>
                    <Text style={styles.timeSlotLabel}>{slot.label}</Text>
                    {slot.fee > 0 && (
                      <Text style={styles.timeSlotFee}>+${slot.fee.toFixed(2)}</Text>
                    )}
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedTimeSlot === slot.id && styles.radioButtonSelected,
                ]}>
                  {selectedTimeSlot === slot.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </Pressable>
            ))}

            <View style={styles.deliveryNote}>
              <Icon name="info" size="sm" color={tokens.colors.semantic.text.tertiary} />
              <Text style={styles.deliveryNoteText}>
                Delivery times are estimated and may vary based on traffic and weather conditions.
              </Text>
            </View>
          </>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <>
            {/* Wallet Balance Section */}
            {WALLET_BALANCE > 0 && (
              <View style={styles.walletSection}>
                <Pressable
                  style={[
                    styles.walletCard,
                    useWalletBalance && styles.walletCardActive,
                  ]}
                  onPress={() => setUseWalletBalance(!useWalletBalance)}
                >
                  <View style={styles.walletIconContainer}>
                    <Icon name="wallet" size="md" color={tokens.colors.semantic.surface.primary} />
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletTitle}>Thriptify Money</Text>
                    <Text style={styles.walletBalance}>Available: ${WALLET_BALANCE.toFixed(2)}</Text>
                  </View>
                  <View style={styles.walletToggle}>
                    <View style={[
                      styles.checkbox,
                      useWalletBalance && styles.checkboxChecked,
                    ]}>
                      {useWalletBalance && (
                        <Icon name="checkmark" size="xs" color={tokens.colors.semantic.surface.primary} />
                      )}
                    </View>
                  </View>
                </Pressable>
                {useWalletBalance && (
                  <View style={styles.walletAppliedNote}>
                    <Icon name="checkmark-circle" size="sm" color={tokens.colors.semantic.status.success.default} />
                    <Text style={styles.walletAppliedText}>
                      ${walletDiscount.toFixed(2)} will be applied from your wallet
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Text variant="body" weight="semibold" style={styles.sectionTitle}>
              {finalTotal > 0 ? 'Select Payment Method' : 'Confirm Payment'}
            </Text>
            {finalTotal > 0 ? (
              <>
                {PAYMENT_METHODS.map((method) => (
                  <Pressable
                    key={method.id}
                    style={[
                      styles.paymentCard,
                      selectedPayment === method.id && styles.paymentCardSelected,
                    ]}
                    onPress={() => setSelectedPayment(method.id)}
                  >
                    <View style={styles.paymentInfo}>
                      <Icon name={method.icon} size="md" color={tokens.colors.semantic.text.primary} />
                      <Text variant="bodySmall" weight="medium" style={styles.paymentLabel}>
                        {method.label}
                      </Text>
                    </View>
                    <View style={[
                      styles.radioButton,
                      selectedPayment === method.id && styles.radioButtonSelected,
                    ]}>
                      {selectedPayment === method.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </Pressable>
                ))}
              </>
            ) : (
              <View style={styles.fullWalletPayment}>
                <Icon name="checkmark-circle" size="lg" color={tokens.colors.semantic.status.success.default} />
                <Text style={styles.fullWalletText}>
                  Your entire order will be paid using Thriptify Money
                </Text>
              </View>
            )}

            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <Text variant="body" weight="semibold" style={styles.orderSummaryTitle}>
                Order Summary
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Handling Fee</Text>
                <Text style={styles.summaryValue}>${handlingFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                </Text>
              </View>
              {selectedSlot && selectedSlot.fee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Express Delivery</Text>
                  <Text style={styles.summaryValue}>${selectedSlot.fee.toFixed(2)}</Text>
                </View>
              )}
              {useWalletBalance && walletDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, styles.walletDiscountLabel]}>Thriptify Money</Text>
                  <Text style={styles.walletDiscountValue}>-${walletDiscount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text variant="body" weight="bold">Total</Text>
                <Text variant="body" weight="bold">${finalTotal.toFixed(2)}</Text>
              </View>
              {useWalletBalance && walletDiscount > 0 && (
                <View style={styles.savingsNote}>
                  <Icon name="pricetag" size="xs" color={tokens.colors.semantic.status.success.default} />
                  <Text style={styles.savingsNoteText}>
                    You're saving ${walletDiscount.toFixed(2)} with Thriptify Money!
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + tokens.spacing[3] }]}>
        <Pressable
          style={[styles.continueButton, isProcessing && styles.continueButtonDisabled]}
          onPress={() => {
            if (step === 'address') {
              setStep('delivery');
            } else if (step === 'delivery') {
              setStep('payment');
            } else if (step === 'payment') {
              handlePlaceOrder();
            }
          }}
          disabled={isProcessing}
        >
          <Text style={styles.continueButtonText}>
            {isProcessing ? 'Processing...' : step === 'payment' ? `Pay $${finalTotal.toFixed(2)}` : 'Continue'}
          </Text>
          {!isProcessing && (
            <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.surface.primary} />
          )}
        </Pressable>
      </View>
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[6],
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.semantic.border.default,
    marginBottom: tokens.spacing[1],
  },
  progressDotActive: {
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: tokens.colors.semantic.border.default,
    marginHorizontal: tokens.spacing[2],
    marginBottom: tokens.spacing[4],
  },
  progressLineActive: {
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  progressLabel: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
  },
  progressLabelActive: {
    color: tokens.colors.semantic.text.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: tokens.spacing[4],
  },
  sectionTitle: {
    marginBottom: tokens.spacing[3],
  },
  addressCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addressCardSelected: {
    borderColor: tokens.colors.semantic.status.success.default,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  defaultBadge: {
    backgroundColor: tokens.colors.semantic.status.success.subtle,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: tokens.colors.semantic.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: tokens.colors.semantic.status.success.default,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 18,
  },
  addressPhone: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: tokens.spacing[1],
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    gap: tokens.spacing[2],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tokens.colors.semantic.status.success.default,
  },
  addNewText: {
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
  },
  timeSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeSlotCardSelected: {
    borderColor: tokens.colors.semantic.status.success.default,
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    marginTop: 2,
  },
  timeSlotLabel: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  timeSlotFee: {
    fontSize: 13,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
  },
  deliveryNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    padding: tokens.spacing[3],
    borderRadius: 8,
    marginTop: tokens.spacing[2],
  },
  deliveryNoteText: {
    flex: 1,
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    lineHeight: 16,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentCardSelected: {
    borderColor: tokens.colors.semantic.status.success.default,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
  },
  paymentLabel: {
    marginLeft: tokens.spacing[1],
  },
  orderSummary: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginTop: tokens.spacing[3],
  },
  orderSummaryTitle: {
    marginBottom: tokens.spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
  },
  summaryLabel: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    color: tokens.colors.semantic.text.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: tokens.colors.semantic.border.subtle,
    marginVertical: tokens.spacing[2],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingTop: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    }),
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    paddingVertical: tokens.spacing[4],
    borderRadius: 12,
    gap: tokens.spacing[2],
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Confirmation Screen
  confirmationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[6],
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
  confirmationTitle: {
    textAlign: 'center',
    marginBottom: tokens.spacing[2],
  },
  confirmationSubtitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[4],
  },
  orderIdContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing[4],
  },
  orderIdLabel: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    marginBottom: 2,
  },
  confirmationCard: {
    width: '100%',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  confirmationCardTitle: {
    marginBottom: tokens.spacing[2],
  },
  confirmationCardText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 18,
  },
  orderItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing[2],
  },
  orderItemImage: {
    borderWidth: 2,
    borderColor: tokens.colors.semantic.surface.primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  moreItemsBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.semantic.text.secondary,
  },
  confirmationActions: {
    width: '100%',
    gap: tokens.spacing[3],
    marginTop: tokens.spacing[3],
  },
  trackOrderButton: {
    backgroundColor: tokens.colors.semantic.status.success.default,
    paddingVertical: tokens.spacing[4],
    borderRadius: 12,
    alignItems: 'center',
  },
  trackOrderText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingButton: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingVertical: tokens.spacing[4],
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
  },
  continueShoppingText: {
    color: tokens.colors.semantic.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  // Wallet Section
  walletSection: {
    marginBottom: tokens.spacing[6],
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 12,
    padding: tokens.spacing[4],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  walletCardActive: {
    borderColor: tokens.colors.semantic.status.success.default,
  },
  walletIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.semantic.surface.primary,
    marginBottom: 2,
  },
  walletBalance: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  walletToggle: {},
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderColor: tokens.colors.semantic.status.success.default,
  },
  walletAppliedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    marginTop: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[2],
  },
  walletAppliedText: {
    fontSize: 13,
    color: tokens.colors.semantic.status.success.default,
  },
  fullWalletPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
    backgroundColor: `${tokens.colors.semantic.status.success.default}15`,
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  fullWalletText: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.semantic.status.success.default,
    lineHeight: 20,
  },
  walletDiscountLabel: {
    color: tokens.colors.semantic.brand.primary.default,
  },
  walletDiscountValue: {
    fontSize: 14,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
  },
  savingsNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    marginTop: tokens.spacing[2],
    paddingTop: tokens.spacing[2],
  },
  savingsNoteText: {
    fontSize: 12,
    color: tokens.colors.semantic.status.success.default,
  },
});
