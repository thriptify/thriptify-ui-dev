import { ScrollView, StyleSheet, View, Pressable, Animated, Platform, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '@/contexts/cart-context';
import { useAppAuth } from '@/contexts/auth-context';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { CollapsibleHeader } from '@/components/collapsible-header';
import { useOrders } from '@/hooks/use-api';

// Types for UI display
type DisplayOrderItem = {
  id: string;
  productId: string;
  title: string;
  image: string | null;
  price: number;
  quantity: number;
};

type DisplayOrder = {
  id: string;
  date: string;
  status: string;
  total: number;
  items: DisplayOrderItem[];
};

type FrequentItem = {
  id: string;
  productId: string;
  title: string;
  image: string | null;
  price: number;
  orderCount: number;
};

// Helper to format date
function formatOrderDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ReorderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isGuest, exitGuestMode } = useAppAuth();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [selectedTab, setSelectedTab] = useState<'orders' | 'frequent'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch real orders from API
  const { data: ordersData, isLoading, error, refetch } = useOrders({ limit: 20 });

  // Transform API orders to display format
  const orders: DisplayOrder[] = useMemo(() => {
    if (!ordersData?.orders) return [];
    return ordersData.orders.map((order) => ({
      id: order.id,
      date: formatOrderDate(order.createdAt),
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, ' '),
      total: order.total,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        title: item.productName,
        image: item.productImage,
        price: item.unitPrice,
        quantity: item.quantity,
      })),
    }));
  }, [ordersData]);

  // Calculate frequently bought items from order history
  const frequentItems: FrequentItem[] = useMemo(() => {
    if (!ordersData?.orders) return [];

    // Count occurrences of each product across all orders
    const productCounts: Record<string, { item: FrequentItem; count: number }> = {};

    ordersData.orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = {
            item: {
              id: item.id,
              productId: item.productId,
              title: item.productName,
              image: item.productImage,
              price: item.unitPrice,
              orderCount: 0,
            },
            count: 0,
          };
        }
        productCounts[item.productId].count += 1;
      });
    });

    // Sort by count and return top items
    return Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ item, count }) => ({
        ...item,
        orderCount: count,
      }));
  }, [ordersData]);

  // Show sign-in prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={[styles.signInHeader, { paddingTop: insets.top + tokens.spacing[2] }]}>
          <Text variant="h4" weight="semibold" style={styles.signInHeaderTitle}>Order Again</Text>
        </View>
        <View style={styles.signInContainer}>
          <LinearGradient
            colors={[tokens.colors.semantic.brand.primary.default, tokens.colors.semantic.brand.primary.hover]}
            style={styles.signInIcon}
          >
            <Icon name="time" size="xl" color="#FFF" />
          </LinearGradient>
          <Text variant="h4" weight="semibold" style={styles.signInTitle}>Sign in to reorder</Text>
          <Text style={styles.signInSubtitle}>
            View your order history and quickly reorder your favorite items
          </Text>
          <Pressable
            style={styles.signInButton}
            onPress={() => exitGuestMode()}
          >
            <Text style={styles.signInButtonText}>Sign In or Create Account</Text>
          </Pressable>
          <Pressable style={styles.browseButton} onPress={() => router.push('/')}>
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleAddItem = (item: FrequentItem) => {
    addItem({
      id: item.productId,
      title: item.title,
      image: item.image || '',
      price: item.price,
    });
  };

  const handleReorderAll = (order: DisplayOrder) => {
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.productId,
          title: item.title,
          image: item.image || '',
          price: item.price,
        });
      }
    });
  };

  const handleAddOrderItem = (item: DisplayOrderItem) => {
    addItem({
      id: item.productId,
      title: item.title,
      image: item.image || '',
      price: item.price,
    });
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const currentQty = getItemQuantity(itemId);
    updateQuantity(itemId, currentQty + delta);
  };

  const handleOpenOrderDetails = (order: DisplayOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  const handleReorderAllFromModal = () => {
    if (selectedOrder) {
      handleReorderAll(selectedOrder);
      handleCloseOrderDetails();
    }
  };

  const handleSearch = (text: string) => {
    router.push(`/search?q=${encodeURIComponent(text)}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.signInHeader, { paddingTop: insets.top + tokens.spacing[2] }]}>
          <Text variant="h4" weight="semibold" style={styles.signInHeaderTitle}>Order Again</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={[styles.signInHeader, { paddingTop: insets.top + tokens.spacing[2] }]}>
          <Text variant="h4" weight="semibold" style={styles.signInHeaderTitle}>Order Again</Text>
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="alert-circle" size="xl" color={tokens.colors.semantic.status.error.default} />
          </View>
          <Text variant="h4" weight="semibold" style={styles.emptyTitle}>Oops!</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable style={styles.shopNowButton} onPress={refetch}>
            <Text style={styles.shopNowText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Empty state for new users
  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader
          scrollY={scrollY}
          searchPlaceholder="Search past orders..."
          onSearch={handleSearch}
        >
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="time" size="xl" color={tokens.colors.semantic.text.tertiary} />
            </View>
            <Text variant="h4" weight="semibold" style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Your order history will appear here
            </Text>
            <Pressable style={styles.shopNowButton} onPress={() => router.push('/')}>
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </Pressable>
          </View>
        </CollapsibleHeader>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        scrollY={scrollY}
        searchPlaceholder="Search past orders..."
        onSearch={handleSearch}
      >
        {/* Modern Segmented Tabs */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <Pressable
              style={[styles.tab, selectedTab === 'orders' && styles.tabSelected]}
              onPress={() => setSelectedTab('orders')}
            >
              <Icon
                name="time"
                size="xs"
                color={selectedTab === 'orders' ? tokens.colors.semantic.surface.primary : tokens.colors.semantic.text.secondary}
              />
              <Text style={[styles.tabText, selectedTab === 'orders' && styles.tabTextSelected]}>
                Orders
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, selectedTab === 'frequent' && styles.tabSelected]}
              onPress={() => setSelectedTab('frequent')}
            >
              <Icon
                name="heart"
                size="xs"
                color={selectedTab === 'frequent' ? tokens.colors.semantic.surface.primary : tokens.colors.semantic.text.secondary}
              />
              <Text style={[styles.tabText, selectedTab === 'frequent' && styles.tabTextSelected]}>
                Buy Again
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        {selectedTab === 'orders' ? (
          // Compact Order Cards
          <View style={styles.ordersContainer}>
            {orders.map((order) => (
              <Pressable
                key={order.id}
                style={styles.orderCard}
                onPress={() => handleOpenOrderDetails(order)}
              >
                {/* Left: Product Images Stack */}
                <View style={styles.orderImagesStack}>
                  {order.items.slice(0, 3).map((item, index) => (
                    <View
                      key={item.productId}
                      style={[
                        styles.stackedImage,
                        {
                          top: index * 4,
                          left: index * 4,
                          zIndex: 3 - index,
                        }
                      ]}
                    >
                      <Image
                        source={{ uri: item.image || undefined }}
                        width={40}
                        height={40}
                        borderRadius={6}
                      />
                    </View>
                  ))}
                </View>

                {/* Middle: Order Info */}
                <View style={styles.orderInfo}>
                  <View style={styles.orderTopRow}>
                    <Text variant="bodySmall" weight="semibold" numberOfLines={1}>
                      {order.items.map(i => i.title).slice(0, 2).join(', ')}
                      {order.items.length > 2 ? ` +${order.items.length - 2}` : ''}
                    </Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderDate}>{order.date}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.orderItemCount}>
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Right: Chevron Indicator */}
                <View style={styles.chevronContainer}>
                  <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.tertiary} />
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          // Compact Frequent Items Grid
          <View style={styles.frequentContainer}>
            {frequentItems.map((item) => {
              const cartQty = getItemQuantity(item.productId);
              return (
                <View key={item.productId} style={styles.frequentCard}>
                  <Image
                    source={{ uri: item.image || undefined }}
                    width={56}
                    height={56}
                    borderRadius={8}
                  />
                  <View style={styles.frequentInfo}>
                    <Text variant="caption" weight="medium" numberOfLines={1} style={styles.frequentTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.frequentWeight}>Ordered {item.orderCount}x</Text>
                    <View style={styles.frequentPriceRow}>
                      <Text style={styles.frequentPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                  </View>
                  {cartQty > 0 ? (
                    <View style={styles.frequentQuantityControl}>
                      <Pressable
                        style={styles.frequentQuantityButton}
                        onPress={() => handleQuantityChange(item.productId, -1)}
                      >
                        <Icon name="minus" size="xs" color={tokens.colors.semantic.surface.primary} />
                      </Pressable>
                      <Text style={styles.frequentQuantityText}>{cartQty}</Text>
                      <Pressable
                        style={styles.frequentQuantityButton}
                        onPress={() => handleQuantityChange(item.productId, 1)}
                      >
                        <Icon name="plus" size="xs" color={tokens.colors.semantic.surface.primary} />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.frequentAddButton}
                      onPress={() => handleAddItem(item)}
                    >
                      <Icon name="plus" size="xs" color={tokens.colors.semantic.brand.primary.default} />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </CollapsibleHeader>

      {/* Order Details Modal */}
      <Modal
        visible={selectedOrder !== null}
        transparent
        animationType="slide"
        onRequestClose={handleCloseOrderDetails}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseOrderDetails}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text variant="h5" weight="semibold">Order Details</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedOrder?.date} • ${selectedOrder?.total.toFixed(2)}
                </Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={handleCloseOrderDetails}
              >
                <Icon name="close" size="sm" color={tokens.colors.semantic.text.secondary} />
              </Pressable>
            </View>

            {/* Items List */}
            <ScrollView
              style={styles.modalItemsList}
              showsVerticalScrollIndicator={false}
            >
              {selectedOrder?.items.map((item) => {
                const cartQty = getItemQuantity(item.productId);
                return (
                  <View key={item.productId} style={styles.modalItem}>
                    <Image
                      source={{ uri: item.image || undefined }}
                      width={56}
                      height={56}
                      borderRadius={8}
                    />
                    <View style={styles.modalItemInfo}>
                      <Text variant="bodySmall" weight="medium" numberOfLines={2}>
                        {item.title}
                      </Text>
                      <View style={styles.modalItemPriceRow}>
                        <Text style={styles.modalItemPrice}>${item.price.toFixed(2)}</Text>
                        <Text style={styles.modalItemQty}>Qty: {item.quantity}</Text>
                      </View>
                    </View>
                    {cartQty > 0 ? (
                      <View style={styles.modalQuantityControl}>
                        <Pressable
                          style={styles.modalQuantityButton}
                          onPress={() => handleQuantityChange(item.productId, -1)}
                        >
                          <Icon name="minus" size="xs" color={tokens.colors.semantic.surface.primary} />
                        </Pressable>
                        <Text style={styles.modalQuantityText}>{cartQty}</Text>
                        <Pressable
                          style={styles.modalQuantityButton}
                          onPress={() => handleQuantityChange(item.productId, 1)}
                        >
                          <Icon name="plus" size="xs" color={tokens.colors.semantic.surface.primary} />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        style={styles.modalAddButton}
                        onPress={() => handleAddOrderItem(item)}
                      >
                        <Icon name="plus" size="xs" color={tokens.colors.semantic.brand.primary.default} />
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* Add All Button */}
            <Pressable
              style={styles.addAllButton}
              onPress={handleReorderAllFromModal}
            >
              <Icon name="refresh" size="sm" color={tokens.colors.semantic.surface.primary} />
              <Text style={styles.addAllText}>Add All Items</Text>
            </Pressable>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  // Sign-in prompt
  signInHeader: {
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  signInHeaderTitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
  },
  signInContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[8],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[4],
  },
  loadingText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[8],
  },
  signInIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[6],
  },
  signInTitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[2],
  },
  signInSubtitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: tokens.spacing[6],
  },
  signInButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingVertical: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[6],
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  signInButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  browseButton: {
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[6],
  },
  browseButtonText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontSize: 15,
    fontWeight: '500',
  },
  // Tabs
  tabsWrapper: {
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing[2],
    borderRadius: 8,
    gap: 6,
  },
  tabSelected: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.semantic.text.secondary,
  },
  tabTextSelected: {
    color: tokens.colors.semantic.surface.primary,
  },
  // Orders
  ordersContainer: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[3],
    gap: tokens.spacing[3],
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  orderImagesStack: {
    width: 52,
    height: 52,
    position: 'relative',
  },
  stackedImage: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: tokens.colors.semantic.surface.primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  orderInfo: {
    flex: 1,
    gap: 4,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderDate: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: tokens.colors.semantic.text.tertiary,
  },
  orderItemCount: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
  },
  orderTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  chevronContainer: {
    padding: tokens.spacing[1],
  },
  // Frequent Items
  frequentContainer: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  frequentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[3],
    gap: tokens.spacing[3],
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  frequentInfo: {
    flex: 1,
    gap: 2,
  },
  frequentTitle: {
    lineHeight: 18,
  },
  frequentWeight: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
  },
  frequentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    marginTop: 2,
  },
  frequentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  frequentOriginalPrice: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  frequentAddButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequentQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  frequentQuantityButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequentQuantityText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 13,
    minWidth: 20,
    textAlign: 'center',
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[6],
    paddingTop: tokens.spacing[12],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 14,
    marginBottom: tokens.spacing[5],
  },
  shopNowButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[5],
    borderRadius: 10,
  },
  shopNowText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[2],
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: tokens.colors.semantic.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: tokens.spacing[3],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  modalSubtitle: {
    fontSize: 13,
    color: tokens.colors.semantic.text.tertiary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemsList: {
    maxHeight: 350,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
    gap: tokens.spacing[3],
  },
  modalItemInfo: {
    flex: 1,
    gap: 2,
  },
  modalItemWeight: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
  },
  modalItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    marginTop: 2,
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  modalItemQty: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
  },
  modalAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  modalQuantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalQuantityText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 14,
    minWidth: 24,
    textAlign: 'center',
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingVertical: tokens.spacing[4],
    borderRadius: 12,
    marginTop: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  addAllText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
