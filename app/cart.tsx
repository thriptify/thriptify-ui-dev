import { ScrollView, StyleSheet, View, Pressable, Platform, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useCart, getCartSavings } from '@/contexts/cart-context';
import { useAppAuth } from '@/contexts/auth-context';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, itemCount, subtotal, deliveryFee, handlingFee, total, updateQuantity, removeItem, addItem } = useCart();
  const { isGuest, isAuthenticated, exitGuestMode } = useAppAuth();
  const [promoCode, setPromoCode] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  // Show login prompt for guest users with items in cart (only once per session)
  useEffect(() => {
    if (isGuest && items.length > 0 && !hasShownPrompt) {
      setShowLoginPrompt(true);
      setHasShownPrompt(true);
    }
  }, [isGuest, items.length, hasShownPrompt]);

  const handleSignIn = () => {
    setShowLoginPrompt(false);
    // Exit guest mode - _layout.tsx will show login screen
    exitGuestMode();
  };

  const handleCancel = () => {
    setShowLoginPrompt(false);
    // Just go back - no fancy navigation
    router.back();
  };

  const savings = getCartSavings(items);
  const freeDeliveryThreshold = 35;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleQuantityChange = (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + delta);
    }
  };

  const renderCartItem = ({ item }: { item: typeof items[0] }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image }}
        width={70}
        height={70}
        borderRadius={8}
      />
      <View style={styles.cartItemInfo}>
        <Text variant="bodySmall" weight="medium" numberOfLines={2} style={styles.cartItemTitle}>
          {item.title}
        </Text>
        <Text style={styles.cartItemWeight}>{item.weight}</Text>
        <Pressable onPress={() => removeItem(item.id)}>
          <Text style={styles.moveToWishlist}>Remove</Text>
        </Pressable>
      </View>
      <View style={styles.cartItemRight}>
        <View style={styles.quantityControl}>
          <Pressable
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, -1)}
          >
            <Icon name="minus" size="sm" color={tokens.colors.semantic.surface.primary} />
          </Pressable>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <Pressable
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, 1)}
          >
            <Icon name="plus" size="sm" color={tokens.colors.semantic.surface.primary} />
          </Pressable>
        </View>
        <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
    </View>
  );

  // Empty cart state
  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
          <Text variant="h3" style={styles.headerTitle}>Cart</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="bag" size="xl" color={tokens.colors.semantic.text.tertiary} />
          </View>
          <Text variant="h3" style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added anything to your cart yet
          </Text>
          <Pressable style={styles.shopNowButton} onPress={() => router.back()}>
            <Text style={styles.shopNowText}>Start Shopping</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Checkout</Text>
        <Pressable style={styles.shareButton}>
          <Icon name="share" size="sm" color={tokens.colors.semantic.text.primary} />
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Info */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryIcon}>
            <Icon name="time" size="md" color={tokens.colors.semantic.status.success.default} />
          </View>
          <View style={styles.deliveryInfo}>
            <Text variant="body" weight="semibold">Delivery in 2 hours</Text>
            <Text style={styles.deliverySubtext}>Shipment of {itemCount} item{itemCount > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.cartItemsContainer}>
          {items.map((item, index) => (
            <View key={item.id}>
              {renderCartItem({ item })}
              {index < items.length - 1 && <View style={styles.itemDivider} />}
            </View>
          ))}
        </View>

        {/* TODO: Add "You might also like" suggestions section later */}

        {/* Bill Details */}
        <View style={styles.billCard}>
          <Text variant="h4" style={styles.billTitle}>Bill details</Text>

          <View style={styles.billRow}>
            <View style={styles.billLabelRow}>
              <Icon name="list" size="xs" color={tokens.colors.semantic.text.secondary} />
              <Text style={styles.billLabel}>Items total</Text>
            </View>
            <Text style={styles.billValue}>${subtotal.toFixed(2)}</Text>
          </View>

          {savings > 0 && (
            <View style={styles.billRow}>
              <View style={styles.billLabelRow}>
                <Icon name="tag" size="xs" color={tokens.colors.semantic.status.success.default} />
                <Text style={[styles.billLabel, styles.savingsLabel]}>You saved</Text>
              </View>
              <Text style={styles.savingsValue}>-${savings.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.billRow}>
            <View style={styles.billLabelRow}>
              <Icon name="bag" size="xs" color={tokens.colors.semantic.text.secondary} />
              <Text style={styles.billLabel}>Handling charge</Text>
            </View>
            <Text style={styles.billValue}>${handlingFee.toFixed(2)}</Text>
          </View>

          <View style={styles.billRow}>
            <View style={styles.billLabelRow}>
              <Icon name="car" size="xs" color={tokens.colors.semantic.text.secondary} />
              <Text style={styles.billLabel}>Delivery charge</Text>
            </View>
            <View style={styles.deliveryChargeValue}>
              {deliveryFee === 0 ? (
                <>
                  <Text style={styles.freeDelivery}>FREE</Text>
                  <Text style={styles.strikethrough}>${2.99}</Text>
                </>
              ) : (
                <Text style={styles.billValue}>${deliveryFee.toFixed(2)}</Text>
              )}
            </View>
          </View>

          {amountToFreeDelivery > 0 && (
            <Text style={styles.freeDeliveryHint}>
              Add ${amountToFreeDelivery.toFixed(2)} more for free delivery
            </Text>
          )}

          <View style={styles.totalRow}>
            <Text variant="body" weight="bold">Grand total</Text>
            <Text variant="body" weight="bold">${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Tip Section */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Text variant="body" weight="semibold">Tip your delivery partner</Text>
            <Text style={styles.tipSubtext}>
              Your kindness means a lot! 100% of your tip goes to your delivery partner.
            </Text>
          </View>
          <View style={styles.tipOptions}>
            {['$1', '$2', '$3', 'Custom'].map((tip, index) => (
              <Pressable key={tip} style={styles.tipButton}>
                <Text style={styles.tipButtonText}>{tip}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.policyCard}>
          <Text variant="bodySmall" weight="semibold">Cancellation Policy</Text>
          <Text style={styles.policyText}>
            Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + tokens.spacing[3] }]}>
        <Pressable
          style={styles.checkoutButton}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutButtonText}>Select address at next step</Text>
          <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.surface.primary} />
        </Pressable>
      </View>

      {/* Login Prompt Modal for Guest Users */}
      <Modal
        visible={showLoginPrompt}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Icon name="user" size="xl" color={tokens.colors.semantic.status.success.default} />
            </View>
            <Text variant="h3" style={styles.modalTitle}>Sign in to continue</Text>
            <Text style={styles.modalSubtitle}>
              Create an account or sign in to view your cart and checkout.
            </Text>

            <Pressable style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInButtonText}>Sign In or Create Account</Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  shareText: {
    color: tokens.colors.semantic.text.primary,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: tokens.spacing[3],
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    marginHorizontal: tokens.spacing[4],
    padding: tokens.spacing[4],
    borderRadius: 12,
    marginBottom: tokens.spacing[3],
  },
  deliveryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.semantic.status.success.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  deliveryInfo: {
    flex: 1,
  },
  deliverySubtext: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 13,
    marginTop: 2,
  },
  cartItemsContainer: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    marginHorizontal: tokens.spacing[4],
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: tokens.spacing[2],
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: tokens.spacing[3],
    justifyContent: 'center',
  },
  cartItemTitle: {
    marginBottom: 2,
  },
  cartItemWeight: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[1],
  },
  moveToWishlist: {
    fontSize: 12,
    color: tokens.colors.semantic.status.error.default,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
  },
  cartItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: tokens.spacing[2],
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 8,
    paddingVertical: tokens.spacing[1],
    paddingHorizontal: tokens.spacing[2],
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 14,
    minWidth: 24,
    textAlign: 'center',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  itemDivider: {
    height: 1,
    backgroundColor: tokens.colors.semantic.border.subtle,
    marginVertical: tokens.spacing[2],
  },
  // NOTE: "You might also like" section removed - will add back later
  billCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    marginHorizontal: tokens.spacing[4],
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  billTitle: {
    marginBottom: tokens.spacing[3],
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
  },
  billLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  billLabel: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },
  billValue: {
    fontSize: 14,
    color: tokens.colors.semantic.text.primary,
  },
  savingsLabel: {
    color: tokens.colors.semantic.status.success.default,
  },
  savingsValue: {
    fontSize: 14,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
  },
  deliveryChargeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  freeDelivery: {
    fontSize: 14,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
  },
  strikethrough: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  freeDeliveryHint: {
    fontSize: 12,
    color: tokens.colors.semantic.status.success.default,
    marginBottom: tokens.spacing[2],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    paddingTop: tokens.spacing[3],
    marginTop: tokens.spacing[2],
  },
  tipCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    marginHorizontal: tokens.spacing[4],
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  tipHeader: {
    marginBottom: tokens.spacing[3],
  },
  tipSubtext: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: tokens.spacing[1],
  },
  tipOptions: {
    flexDirection: 'row',
    gap: tokens.spacing[2],
  },
  tipButton: {
    flex: 1,
    paddingVertical: tokens.spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    alignItems: 'center',
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  policyCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    marginHorizontal: tokens.spacing[4],
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  policyText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: tokens.spacing[2],
    lineHeight: 18,
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
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    paddingVertical: tokens.spacing[4],
    borderRadius: 12,
    gap: tokens.spacing[2],
  },
  checkoutButtonText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[6],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[4],
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: tokens.spacing[2],
  },
  emptySubtitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[6],
  },
  shopNowButton: {
    backgroundColor: tokens.colors.semantic.status.success.default,
    paddingVertical: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[6],
    borderRadius: 12,
  },
  shopNowText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Login Prompt Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing[4],
  },
  modalContent: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 20,
    padding: tokens.spacing[6],
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tokens.colors.semantic.status.success.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[4],
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: tokens.spacing[2],
  },
  modalSubtitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: tokens.spacing[5],
  },
  signInButton: {
    backgroundColor: tokens.colors.semantic.status.success.default,
    paddingVertical: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[6],
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  signInButtonText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: tokens.spacing[3],
  },
  cancelButtonText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
