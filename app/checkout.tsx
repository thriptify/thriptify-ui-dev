import { ScrollView, StyleSheet, View, Pressable, Platform, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useCart } from '@/contexts/cart-context';
import { useLocation } from '@/contexts/location-context';
import { useCheckout, useAddresses, useDeliverySlots, usePaymentMethods } from '@/hooks/use-api';
import { DeliverySlotPicker } from '@/components/checkout';
import {
  CardField,
  useStripe,
  useConfirmSetupIntent,
  useConfirmPayment,
} from '@stripe/stripe-react-native';
import type { CardFieldInput } from '@stripe/stripe-react-native';

type Step = 'address' | 'delivery' | 'payment' | 'confirmation';

// Helper to get address icon
function getAddressIcon(label: string): string {
  const lower = label?.toLowerCase() || '';
  if (lower.includes('home')) return 'home';
  if (lower.includes('work') || lower.includes('office')) return 'briefcase';
  return 'location';
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, itemCount, subtotal, deliveryFee, handlingFee, total, clearCart } = useCart();
  const { deliveryAddress } = useLocation();

  // API hooks
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { data: deliverySlots, isLoading: slotsLoading } = useDeliverySlots();
  const {
    data: paymentMethods,
    isLoading: paymentMethodsLoading,
    createSetupIntent,
    savePaymentMethod,
    refetch: refetchPaymentMethods,
  } = usePaymentMethods();
  const {
    session,
    isLoading: checkoutLoading,
    error: checkoutError,
    createSession,
    updateSession,
    placeOrder,
    clearSession,
  } = useCheckout();

  // Stripe hooks
  const { confirmSetupIntent } = useConfirmSetupIntent();
  const { confirmPayment } = useConfirmPayment();

  // Local state
  const [step, setStep] = useState<Step>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; orderId: string } | null>(null);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);

  // Initialize checkout session when component mounts
  useEffect(() => {
    if (items.length > 0 && !session) {
      const cartItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));
      createSession(cartItems);
    }
  }, [items, session, createSession]);

  // Set default address when addresses load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Set default delivery slot when slots load
  useEffect(() => {
    if (deliverySlots && deliverySlots.length > 0 && !selectedSlotId) {
      const availableSlot = deliverySlots.find(s => s.available);
      if (availableSlot) {
        setSelectedSlotId(availableSlot.id);
      }
    }
  }, [deliverySlots, selectedSlotId]);

  // Set default payment method when payment methods load
  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && !selectedPaymentId) {
      const defaultPm = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
      setSelectedPaymentId(defaultPm.id);
    }
  }, [paymentMethods, selectedPaymentId]);

  // Calculate totals from session or local cart
  const summary = useMemo(() => {
    if (session?.summary) {
      return session.summary;
    }
    // Fallback to local cart values
    const selectedSlot = deliverySlots?.find(s => s.id === selectedSlotId);
    const expressFee = selectedSlot?.isPremium ? selectedSlot.premiumFee : 0;
    return {
      subtotal,
      deliveryFee,
      handlingFee,
      tax: 0,
      tip: 0,
      discount: 0,
      total: total + expressFee,
    };
  }, [session, subtotal, deliveryFee, handlingFee, total, deliverySlots, selectedSlotId]);

  const selectedSlot = deliverySlots?.find(s => s.id === selectedSlotId);
  const selectedAddress = addresses?.find(a => a.id === selectedAddressId);

  const handleContinue = async () => {
    if (step === 'address') {
      // Update session with selected address
      if (session && selectedAddressId) {
        await updateSession(session.id, { addressId: selectedAddressId });
      }
      setStep('delivery');
    } else if (step === 'delivery') {
      // Update session with selected delivery slot
      if (session && selectedSlotId) {
        await updateSession(session.id, { deliverySlotId: selectedSlotId });
      }
      setStep('payment');
    } else if (step === 'payment') {
      // If adding a new card, save it first
      if (isAddingCard) {
        await handleAddCard();
      } else {
        await handlePlaceOrder();
      }
    }
  };

  // Handle adding a new card using Stripe SDK
  const handleAddCard = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create a SetupIntent on the backend
      const setupIntent = await createSetupIntent();
      if (!setupIntent) {
        Alert.alert('Error', 'Failed to initialize card setup');
        return;
      }

      // 2. Confirm the SetupIntent with Stripe SDK
      const { setupIntent: confirmedSetupIntent, error } = await confirmSetupIntent(
        setupIntent.clientSecret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      if (confirmedSetupIntent?.paymentMethodId) {
        // 3. Save the payment method to our backend
        const savedPaymentMethod = await savePaymentMethod(confirmedSetupIntent.paymentMethodId, true);

        if (savedPaymentMethod) {
          // 4. Select the new payment method
          setSelectedPaymentId(savedPaymentMethod.id);
          setIsAddingCard(false);
          setCardDetails(null);

          // Refresh payment methods list
          refetchPaymentMethods();

          Alert.alert('Success', 'Card added successfully!');
        } else {
          Alert.alert('Error', 'Failed to save card. Please try again.');
        }
      }
    } catch (err) {
      console.error('[Checkout] Add card error:', err);
      Alert.alert('Error', 'Failed to add card. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!session) {
      Alert.alert('Error', 'No checkout session found');
      return;
    }

    if (!selectedPaymentId && !isAddingCard) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      // Update session with payment method
      if (selectedPaymentId) {
        await updateSession(session.id, { paymentMethodId: selectedPaymentId });
      }

      // Place the order
      const result = await placeOrder(session.id);

      if (result) {
        // Check if payment requires additional action (3D Secure)
        if (result.requiresAction && result.clientSecret) {
          // Use Stripe SDK to handle 3D Secure
          const { paymentIntent, error } = await confirmPayment(result.clientSecret, {
            paymentMethodType: 'Card',
          });

          if (error) {
            Alert.alert('Payment Failed', error.message);
            return;
          }

          if (paymentIntent?.status !== 'Succeeded') {
            Alert.alert('Payment Failed', 'Payment was not completed. Please try again.');
            return;
          }
        }

        setOrderResult({
          orderNumber: result.order.orderNumber,
          orderId: result.order.id,
        });
        setStep('confirmation');
        clearCart();
        clearSession();
      } else {
        Alert.alert('Error', checkoutError || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('[Checkout] Place order error:', err);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueShopping = () => {
    // Dismiss all modals and navigate to home
    router.dismissAll();
    router.replace('/(tabs)');
  };

  // Loading state
  const isInitializing = addressesLoading || slotsLoading || paymentMethodsLoading || (items.length > 0 && !session && checkoutLoading);

  if (isInitializing) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
        <Text style={styles.loadingText}>Preparing checkout...</Text>
      </View>
    );
  }

  // Empty cart
  if (items.length === 0 && step !== 'confirmation') {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <Icon name="cart" size="xl" color={tokens.colors.semantic.text.tertiary} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Pressable style={styles.shopButton} onPress={() => {
          router.dismissAll();
          router.replace('/(tabs)');
        }}>
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </Pressable>
      </View>
    );
  }

  // Order Confirmation Screen
  if (step === 'confirmation' && orderResult) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.confirmationContainer}>
          <View style={styles.successIcon}>
            <Icon name="checkmark" size="xl" color={tokens.colors.semantic.surface.primary} />
          </View>
          <Text variant="h2" style={styles.confirmationTitle}>Order Placed!</Text>
          <Text style={styles.confirmationSubtitle}>
            Your order has been placed successfully and will be delivered soon.
          </Text>

          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text variant="body" weight="semibold">#{orderResult.orderNumber}</Text>
          </View>

          {selectedAddress && (
            <View style={styles.confirmationCard}>
              <Text variant="bodySmall" weight="semibold" style={styles.confirmationCardTitle}>
                Delivery Address
              </Text>
              <Text style={styles.confirmationCardText}>{selectedAddress.addressLine1}</Text>
              <Text style={styles.confirmationCardText}>
                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
              </Text>
            </View>
          )}

          <View style={styles.confirmationActions}>
            <Pressable style={styles.trackOrderButton} onPress={() => router.push('/account/orders')}>
              <Text style={styles.trackOrderText}>View Orders</Text>
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
            {addresses && addresses.length > 0 ? (
              addresses.map((address) => (
                <Pressable
                  key={address.id}
                  style={[
                    styles.addressCard,
                    selectedAddressId === address.id && styles.addressCardSelected,
                  ]}
                  onPress={() => setSelectedAddressId(address.id)}
                >
                  <View style={styles.addressHeader}>
                    <View style={styles.addressTypeContainer}>
                      <Icon
                        name={getAddressIcon(address.label)}
                        size="sm"
                        color={tokens.colors.semantic.text.primary}
                      />
                      <Text variant="bodySmall" weight="semibold">{address.label || 'Address'}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <View style={[
                      styles.radioButton,
                      selectedAddressId === address.id && styles.radioButtonSelected,
                    ]}>
                      {selectedAddressId === address.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                  {address.recipientName && (
                    <Text style={styles.addressName}>{address.recipientName}</Text>
                  )}
                  <Text style={styles.addressText}>{address.addressLine1}</Text>
                  {address.addressLine2 && (
                    <Text style={styles.addressText}>{address.addressLine2}</Text>
                  )}
                  <Text style={styles.addressText}>
                    {address.city}, {address.state} {address.postalCode}
                  </Text>
                  {address.recipientPhone && (
                    <Text style={styles.addressPhone}>{address.recipientPhone}</Text>
                  )}
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyAddresses}>
                <Text style={styles.emptyAddressesText}>No saved addresses</Text>
              </View>
            )}

            <Pressable style={styles.addNewButton} onPress={() => router.push('/account/addresses')}>
              <Icon name="plus" size="sm" color={tokens.colors.semantic.status.success.default} />
              <Text style={styles.addNewText}>Add New Address</Text>
            </Pressable>
          </>
        )}

        {/* Delivery Time Step */}
        {step === 'delivery' && (
          <DeliverySlotPicker
            slots={deliverySlots || []}
            selectedSlotId={selectedSlotId}
            onSlotSelect={setSelectedSlotId}
            isLoading={slotsLoading}
          />
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <>
            <Text variant="body" weight="semibold" style={styles.sectionTitle}>
              Select Payment Method
            </Text>

            {/* Saved Payment Methods */}
            {paymentMethods && paymentMethods.length > 0 && !isAddingCard && (
              paymentMethods.map((pm) => (
                <Pressable
                  key={pm.id}
                  style={[
                    styles.paymentCard,
                    selectedPaymentId === pm.id && styles.paymentCardSelected,
                  ]}
                  onPress={() => setSelectedPaymentId(pm.id)}
                >
                  <View style={styles.paymentInfo}>
                    <Icon name="card" size="md" color={tokens.colors.semantic.text.primary} />
                    <View>
                      <Text variant="bodySmall" weight="medium" style={styles.paymentLabel}>
                        {pm.cardBrand ? pm.cardBrand.charAt(0).toUpperCase() + pm.cardBrand.slice(1) : 'Card'} •••• {pm.cardLastFour}
                      </Text>
                      {pm.cardExpMonth && pm.cardExpYear && (
                        <Text style={styles.paymentSubtext}>
                          Expires {pm.cardExpMonth}/{pm.cardExpYear.toString().slice(-2)}
                        </Text>
                      )}
                    </View>
                    {pm.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedPaymentId === pm.id && styles.radioButtonSelected,
                  ]}>
                    {selectedPaymentId === pm.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </Pressable>
              ))
            )}

            {/* Add New Card Button */}
            {!isAddingCard && (
              <Pressable
                style={styles.addNewButton}
                onPress={() => {
                  setIsAddingCard(true);
                  setSelectedPaymentId(null);
                }}
              >
                <Icon name="add" size="sm" color={tokens.colors.semantic.status.success.default} />
                <Text style={styles.addNewText}>Add New Card</Text>
              </Pressable>
            )}

            {/* Card Input Form */}
            {isAddingCard && (
              <View style={styles.cardFormContainer}>
                <View style={styles.cardFormHeader}>
                  <Text variant="bodySmall" weight="semibold">Enter Card Details</Text>
                  <Pressable onPress={() => {
                    setIsAddingCard(false);
                    setCardDetails(null);
                    if (paymentMethods && paymentMethods.length > 0) {
                      const defaultPm = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
                      setSelectedPaymentId(defaultPm.id);
                    }
                  }}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                </View>
                <CardField
                  postalCodeEnabled={true}
                  placeholders={{
                    number: '4242 4242 4242 4242',
                  }}
                  cardStyle={{
                    backgroundColor: tokens.colors.semantic.surface.secondary,
                    textColor: tokens.colors.semantic.text.primary,
                    borderWidth: 1,
                    borderColor: tokens.colors.semantic.border.default,
                    borderRadius: 8,
                    fontSize: 16,
                    placeholderColor: tokens.colors.semantic.text.tertiary,
                  }}
                  style={styles.cardField}
                  onCardChange={(details) => {
                    setCardDetails(details);
                  }}
                />
                <Pressable
                  style={[
                    styles.addCardButton,
                    (!cardDetails?.complete || isProcessing) && styles.addCardButtonDisabled,
                  ]}
                  onPress={handleAddCard}
                  disabled={!cardDetails?.complete || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color={tokens.colors.semantic.surface.primary} />
                  ) : (
                    <Text style={styles.addCardButtonText}>Add Card</Text>
                  )}
                </Pressable>
                <View style={styles.cardSecurityNote}>
                  <Icon name="lock-closed" size="xs" color={tokens.colors.semantic.text.tertiary} />
                  <Text style={styles.cardSecurityText}>
                    Your card information is encrypted and secure
                  </Text>
                </View>
              </View>
            )}

            {/* No Payment Methods */}
            {(!paymentMethods || paymentMethods.length === 0) && !isAddingCard && (
              <View style={styles.emptyAddresses}>
                <Text style={styles.emptyAddressesText}>No saved payment methods</Text>
              </View>
            )}

            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <Text variant="body" weight="semibold" style={styles.orderSummaryTitle}>
                Order Summary
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
                <Text style={styles.summaryValue}>${summary.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  {summary.deliveryFee === 0 ? 'FREE' : `$${summary.deliveryFee.toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Handling Fee</Text>
                <Text style={styles.summaryValue}>${summary.handlingFee.toFixed(2)}</Text>
              </View>
              {selectedSlot?.isPremium && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Express Delivery</Text>
                  <Text style={styles.summaryValue}>${selectedSlot.premiumFee.toFixed(2)}</Text>
                </View>
              )}
              {summary.tax > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>${summary.tax.toFixed(2)}</Text>
                </View>
              )}
              {summary.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount</Text>
                  <Text style={styles.discountValue}>-${summary.discount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text variant="body" weight="bold">Total</Text>
                <Text variant="body" weight="bold">${summary.total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + tokens.spacing[3] }]}>
        <Pressable
          style={[
            styles.continueButton,
            (isProcessing || checkoutLoading) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={
            isProcessing ||
            checkoutLoading ||
            !selectedAddressId ||
            (step === 'payment' && !selectedPaymentId)
          }
        >
          {isProcessing || checkoutLoading ? (
            <ActivityIndicator size="small" color={tokens.colors.semantic.surface.primary} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                {step === 'payment' ? `Pay $${summary.total.toFixed(2)}` : 'Continue'}
              </Text>
              <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.surface.primary} />
            </>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: tokens.spacing[4],
    color: tokens.colors.semantic.text.secondary,
  },
  emptyText: {
    marginTop: tokens.spacing[4],
    color: tokens.colors.semantic.text.secondary,
    fontSize: 16,
  },
  shopButton: {
    marginTop: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 12,
  },
  shopButtonText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
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
  emptyAddresses: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[6],
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  emptyAddressesText: {
    color: tokens.colors.semantic.text.tertiary,
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
  paymentSubtext: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    marginLeft: tokens.spacing[1],
  },
  cancelText: {
    fontSize: 14,
    color: tokens.colors.semantic.status.error.default,
    fontWeight: '500',
  },
  cardFormContainer: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  cardFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  cardSecurityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    marginTop: tokens.spacing[3],
  },
  cardSecurityText: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: tokens.spacing[3],
  },
  addCardButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingVertical: tokens.spacing[3],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardButtonDisabled: {
    opacity: 0.5,
  },
  addCardButtonText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 14,
    fontWeight: '600',
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
  discountLabel: {
    color: tokens.colors.semantic.status.success.default,
  },
  discountValue: {
    fontSize: 14,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
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
});
