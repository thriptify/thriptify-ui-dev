import { ScrollView, StyleSheet, View, Pressable, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useCart } from '@/contexts/cart-context';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { CollapsibleHeader } from '@/components/collapsible-header';

// Mock previous orders
const PREVIOUS_ORDERS = [
  {
    id: 'order1',
    date: 'Dec 4, 2025',
    status: 'Delivered',
    total: 45.99,
    items: [
      { id: 'p1', title: 'Organic Avocados', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop', price: 4.99, quantity: 2, weight: '1 unit' },
      { id: 'p2', title: 'Fresh Strawberries', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop', price: 5.49, quantity: 1, weight: '1 lb' },
      { id: 'p3', title: 'Artisan Sourdough', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop', price: 6.99, quantity: 1, weight: '1 loaf' },
    ],
  },
  {
    id: 'order2',
    date: 'Nov 28, 2025',
    status: 'Delivered',
    total: 32.47,
    items: [
      { id: 'p4', title: 'Greek Yogurt', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop', price: 5.49, quantity: 2, weight: '32 oz' },
      { id: 'p5', title: 'Organic Bananas', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop', price: 2.99, quantity: 1, weight: '1 bunch' },
    ],
  },
  {
    id: 'order3',
    date: 'Nov 20, 2025',
    status: 'Delivered',
    total: 58.23,
    items: [
      { id: 'p6', title: 'Fresh Orange Juice', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&fit=crop', price: 6.99, quantity: 2, weight: '64 oz' },
      { id: 'p7', title: 'Whole Wheat Bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop', price: 4.49, quantity: 1, weight: '24 oz' },
      { id: 'p8', title: 'Farm Fresh Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop', price: 5.99, quantity: 2, weight: '12 count' },
    ],
  },
];

// Frequently bought items (extracted from orders)
const FREQUENT_ITEMS = [
  { id: 'f1', title: 'Organic Avocados', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop', price: 4.99, originalPrice: 6.99, weight: '1 unit', orderCount: 8 },
  { id: 'f2', title: 'Fresh Strawberries', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop', price: 5.49, weight: '1 lb', orderCount: 6 },
  { id: 'f3', title: 'Greek Yogurt', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop', price: 5.49, weight: '32 oz', orderCount: 5 },
  { id: 'f4', title: 'Artisan Sourdough', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop', price: 6.99, weight: '1 loaf', orderCount: 4 },
  { id: 'f5', title: 'Organic Bananas', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop', price: 2.99, weight: '1 bunch', orderCount: 4 },
];

export default function ReorderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const [selectedTab, setSelectedTab] = useState<'orders' | 'frequent'>('orders');
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleAddItem = (item: typeof FREQUENT_ITEMS[0]) => {
    addItem({
      id: item.id,
      title: item.title,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      weight: item.weight,
      isVegetarian: true,
    });
  };

  const handleReorderAll = (order: typeof PREVIOUS_ORDERS[0]) => {
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.id,
          title: item.title,
          image: item.image,
          price: item.price,
          weight: item.weight,
          isVegetarian: true,
        });
      }
    });
  };

  const renderFrequentItem = ({ item }: { item: typeof FREQUENT_ITEMS[0] }) => (
    <Pressable style={styles.frequentItemCard}>
      <View style={styles.frequentItemImageContainer}>
        <Image
          source={{ uri: item.image }}
          width="100%"
          height={100}
          borderRadius={8}
        />
        <Pressable
          style={styles.frequentAddButton}
          onPress={() => handleAddItem(item)}
        >
          <Text style={styles.frequentAddText}>ADD</Text>
        </Pressable>
      </View>
      <View style={styles.frequentItemInfo}>
        <Text style={styles.frequentItemWeight}>{item.weight}</Text>
        <Text variant="caption" weight="medium" numberOfLines={2} style={styles.frequentItemTitle}>
          {item.title}
        </Text>
        <Text style={styles.frequentOrderCount}>Ordered {item.orderCount} times</Text>
        <View style={styles.frequentPriceRow}>
          <Text style={styles.frequentPrice}>${item.price.toFixed(2)}</Text>
          {item.originalPrice && (
            <Text style={styles.frequentOriginalPrice}>${item.originalPrice.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  const handleSearch = (text: string) => {
    router.push(`/search?q=${encodeURIComponent(text)}`);
  };

  // Empty state for new users
  if (PREVIOUS_ORDERS.length === 0) {
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
            <Text variant="h3" style={styles.emptyTitle}>No previous orders</Text>
            <Text style={styles.emptySubtitle}>
              Your order history will appear here once you place your first order
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
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, selectedTab === 'orders' && styles.tabSelected]}
            onPress={() => setSelectedTab('orders')}
          >
            <Text style={[styles.tabText, selectedTab === 'orders' && styles.tabTextSelected]}>
              Previous Orders
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedTab === 'frequent' && styles.tabSelected]}
            onPress={() => setSelectedTab('frequent')}
          >
            <Text style={[styles.tabText, selectedTab === 'frequent' && styles.tabTextSelected]}>
              Frequently Bought
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        {selectedTab === 'orders' ? (
          // Previous Orders
          <>
            {PREVIOUS_ORDERS.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text variant="bodySmall" weight="semibold">{order.date}</Text>
                    <Text style={styles.orderStatus}>{order.status}</Text>
                  </View>
                  <Text variant="body" weight="bold">${order.total.toFixed(2)}</Text>
                </View>

                <View style={styles.orderItems}>
                  <View style={styles.orderItemsRow}>
                    {order.items.slice(0, 4).map((item, index) => (
                      <View key={item.id} style={[styles.orderItemImage, { marginLeft: index > 0 ? -8 : 0, zIndex: 4 - index }]}>
                        <Image
                          source={{ uri: item.image }}
                          width={48}
                          height={48}
                          borderRadius={8}
                        />
                      </View>
                    ))}
                    {order.items.length > 4 && (
                      <View style={styles.moreItemsBadge}>
                        <Text style={styles.moreItemsText}>+{order.items.length - 4}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.orderItemsCount}>
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                  </Text>
                </View>

                <View style={styles.orderActions}>
                  <Pressable
                    style={styles.viewDetailsButton}
                    onPress={() => router.push('/')}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </Pressable>
                  <Pressable
                    style={styles.reorderButton}
                    onPress={() => handleReorderAll(order)}
                  >
                    <Icon name="refresh" size="sm" color={tokens.colors.semantic.surface.primary} />
                    <Text style={styles.reorderText}>Reorder All</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        ) : (
          // Frequently Bought Items
          <View style={styles.frequentGrid}>
            {FREQUENT_ITEMS.map((item) => (
              <View key={item.id} style={styles.frequentItemWrapper}>
                {renderFrequentItem({ item })}
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </CollapsibleHeader>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
    gap: tokens.spacing[2],
  },
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing[3],
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  tabSelected: {
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.text.secondary,
  },
  tabTextSelected: {
    color: tokens.colors.semantic.surface.primary,
  },
  orderCard: {
    marginHorizontal: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing[3],
  },
  orderStatus: {
    fontSize: 13,
    color: tokens.colors.semantic.status.success.default,
    marginTop: 2,
  },
  orderItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  orderItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemImage: {
    borderWidth: 2,
    borderColor: tokens.colors.semantic.surface.primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  moreItemsBadge: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.semantic.text.secondary,
  },
  orderItemsCount: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
    marginTop: tokens.spacing[3],
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: tokens.spacing[3],
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  reorderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing[3],
    borderRadius: 8,
    backgroundColor: tokens.colors.semantic.status.success.default,
    gap: tokens.spacing[2],
  },
  reorderText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.semantic.surface.primary,
  },
  frequentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[3],
  },
  frequentItemWrapper: {
    width: '48%',
  },
  frequentItemCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  frequentItemImageContainer: {
    position: 'relative',
  },
  frequentAddButton: {
    position: 'absolute',
    bottom: -12,
    left: tokens.spacing[3],
    right: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: 6,
    paddingVertical: tokens.spacing[1],
    alignItems: 'center',
  },
  frequentAddText: {
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '600',
    fontSize: 12,
  },
  frequentItemInfo: {
    padding: tokens.spacing[3],
    paddingTop: tokens.spacing[4],
  },
  frequentItemWeight: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
    marginBottom: 2,
  },
  frequentItemTitle: {
    marginBottom: tokens.spacing[1],
    lineHeight: 16,
  },
  frequentOrderCount: {
    fontSize: 11,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[1],
  },
  frequentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  frequentPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  frequentOriginalPrice: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
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
});
