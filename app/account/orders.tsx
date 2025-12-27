import { ScrollView, StyleSheet, View, Pressable, FlatList, Platform, ActivityIndicator } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useOrders } from '@/hooks/use-api';

// Helper to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper to format delivery/cancelled date
function formatDeliveryDate(dateString: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const STATUS_STYLES: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: {
    color: tokens.colors.semantic.text.secondary,
    bgColor: tokens.colors.semantic.surface.secondary,
    label: 'Pending',
  },
  confirmed: {
    color: tokens.colors.semantic.brand.primary.default,
    bgColor: `${tokens.colors.semantic.brand.primary.default}15`,
    label: 'Confirmed',
  },
  picking: {
    color: tokens.colors.semantic.brand.primary.default,
    bgColor: `${tokens.colors.semantic.brand.primary.default}15`,
    label: 'Picking',
  },
  packed: {
    color: tokens.colors.semantic.brand.primary.default,
    bgColor: `${tokens.colors.semantic.brand.primary.default}15`,
    label: 'Packed',
  },
  out_for_delivery: {
    color: tokens.colors.semantic.brand.primary.default,
    bgColor: `${tokens.colors.semantic.brand.primary.default}15`,
    label: 'Out for Delivery',
  },
  delivered: {
    color: tokens.colors.semantic.status.success.default,
    bgColor: `${tokens.colors.semantic.status.success.default}15`,
    label: 'Delivered',
  },
  cancelled: {
    color: tokens.colors.semantic.status.error.default,
    bgColor: `${tokens.colors.semantic.status.error.default}15`,
    label: 'Cancelled',
  },
  refunded: {
    color: tokens.colors.semantic.text.secondary,
    bgColor: tokens.colors.semantic.surface.secondary,
    label: 'Refunded',
  },
};

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

// Active statuses for filtering
const ACTIVE_STATUSES = ['pending', 'confirmed', 'picking', 'packed', 'out_for_delivery'];

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Fetch orders from API
  const { data: ordersData, isLoading, error, refetch } = useOrders();

  const handleBack = () => {
    router.back();
  };

  const handleReorder = (orderId: string) => {
    console.log('Reorder:', orderId);
    router.push('/cart');
  };

  const handleViewDetails = (orderId: string) => {
    // TODO: Navigate to order detail screen
    console.log('View details:', orderId);
  };

  // Filter orders based on active filter
  const filteredOrders = useMemo(() => {
    const orders = ordersData?.orders || [];
    if (activeFilter === 'all') return orders;
    if (activeFilter === 'active') {
      return orders.filter(order => ACTIVE_STATUSES.includes(order.status));
    }
    return orders.filter(order => order.status === activeFilter);
  }, [ordersData?.orders, activeFilter]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={{ color: tokens.colors.semantic.text.secondary }}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Define order type from API
  type OrderType = NonNullable<typeof ordersData>['orders'][number];

  const renderOrderCard = ({ item: order }: { item: OrderType }) => {
    const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
    const isExpanded = expandedOrder === order.id;
    const deliveredAtFormatted = formatDeliveryDate(order.deliveredAt);
    const cancelledAtFormatted = formatDeliveryDate(order.cancelledAt);

    return (
      <Pressable
        style={styles.orderCard}
        onPress={() => setExpandedOrder(isExpanded ? null : order.id)}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>{order.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bgColor }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {statusStyle.label}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>

        {/* Order Items Preview */}
        <View style={styles.orderItems}>
          <View style={styles.itemImagesRow}>
            {order.items.slice(0, 3).map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.itemImageWrapper,
                  { marginLeft: index > 0 ? -12 : 0, zIndex: 3 - index },
                ]}
              >
                {item.productImage ? (
                  <Image
                    source={{ uri: item.productImage }}
                    width={40}
                    height={40}
                    borderRadius={8}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Icon name="cube" size="sm" color={tokens.colors.semantic.text.tertiary} />
                  </View>
                )}
              </View>
            ))}
            {order.itemCount > 3 && (
              <View style={[styles.moreItemsBadge, { marginLeft: -12 }]}>
                <Text style={styles.moreItemsText}>+{order.itemCount - 3}</Text>
              </View>
            )}
          </View>
          <View style={styles.orderSummary}>
            <Text style={styles.itemCountText}>{order.itemCount} items</Text>
            <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery/Cancellation Info */}
        {order.status === 'delivered' && deliveredAtFormatted && (
          <View style={styles.deliveryInfo}>
            <Icon name="checkmark-circle" size="sm" color={tokens.colors.semantic.status.success.default} />
            <Text style={styles.deliveryText}>Delivered on {deliveredAtFormatted}</Text>
          </View>
        )}
        {order.status === 'cancelled' && (
          <View style={styles.cancelledInfo}>
            <Icon name="close-circle" size="sm" color={tokens.colors.semantic.status.error.default} />
            <Text style={styles.cancelledText}>
              {order.cancellationReason || 'Order cancelled'}
              {cancelledAtFormatted && ` on ${cancelledAtFormatted}`}
            </Text>
          </View>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedTitle}>Order Items</Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.expandedItem}>
                {item.productImage ? (
                  <Image
                    source={{ uri: item.productImage }}
                    width={48}
                    height={48}
                    borderRadius={8}
                  />
                ) : (
                  <View style={[styles.placeholderImage, { width: 48, height: 48 }]}>
                    <Icon name="cube" size="md" color={tokens.colors.semantic.text.tertiary} />
                  </View>
                )}
                <View style={styles.expandedItemInfo}>
                  <Text style={styles.expandedItemTitle}>{item.productName}</Text>
                  <Text style={styles.expandedItemQty}>
                    Qty: {item.quantity} · ${item.subtotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.orderActions}>
          <Pressable
            style={styles.viewDetailsButton}
            onPress={() => handleViewDetails(order.id)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </Pressable>
          {order.status === 'delivered' && (
            <Pressable
              style={styles.reorderButton}
              onPress={() => handleReorder(order.id)}
            >
              <Icon name="refresh" size="sm" color={tokens.colors.semantic.surface.primary} />
              <Text style={styles.reorderText}>Reorder</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Order History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_OPTIONS.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="document-text" size="xl" color={tokens.colors.semantic.text.tertiary} />
          <Text variant="h4" style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptyText}>
            {activeFilter === 'all'
              ? "You haven't placed any orders yet."
              : `No ${activeFilter} orders found.`}
          </Text>
          <Pressable style={styles.shopNowButton} onPress={() => router.push('/')}>
            <Text style={styles.shopNowText}>Start Shopping</Text>
          </Pressable>
        </View>
      )}
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
  retryButton: {
    marginTop: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 8,
  },
  retryButtonText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
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
  headerSpacer: {
    width: 40,
  },
  // Filters
  filtersContainer: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingVertical: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  filtersContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  filterChip: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderColor: tokens.colors.semantic.brand.primary.default,
  },
  filterChipText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },
  filterChipTextActive: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '500',
  },
  // Orders List
  ordersContent: {
    padding: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  orderCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[4],
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  orderHeader: {
    marginBottom: tokens.spacing[3],
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  statusBadge: {
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  // Order Items Preview
  orderItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  itemImagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageWrapper: {
    borderWidth: 2,
    borderColor: tokens.colors.semantic.surface.primary,
    borderRadius: 10,
    overflow: 'hidden',
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreItemsBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: tokens.colors.semantic.surface.primary,
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.semantic.text.secondary,
  },
  orderSummary: {
    alignItems: 'flex-end',
  },
  itemCountText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  // Delivery Info
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    paddingTop: tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    marginBottom: tokens.spacing[3],
  },
  deliveryText: {
    fontSize: 13,
    color: tokens.colors.semantic.status.success.default,
  },
  cancelledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    paddingTop: tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    marginBottom: tokens.spacing[3],
  },
  cancelledText: {
    fontSize: 13,
    color: tokens.colors.semantic.status.error.default,
  },
  // Expanded Content
  expandedContent: {
    paddingTop: tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    marginBottom: tokens.spacing[3],
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[2],
  },
  expandedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing[2],
    gap: tokens.spacing[3],
  },
  expandedItemInfo: {
    flex: 1,
  },
  expandedItemTitle: {
    fontSize: 14,
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  expandedItemQty: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
  },
  // Actions
  orderActions: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: tokens.spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  reorderButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: tokens.spacing[3],
    borderRadius: 8,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[1],
  },
  reorderText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.semantic.surface.primary,
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[8],
  },
  emptyTitle: {
    marginTop: tokens.spacing[4],
    color: tokens.colors.semantic.text.primary,
  },
  emptyText: {
    marginTop: tokens.spacing[2],
    textAlign: 'center',
    fontSize: 15,
    color: tokens.colors.semantic.text.secondary,
  },
  shopNowButton: {
    marginTop: tokens.spacing[6],
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 8,
  },
  shopNowText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});
