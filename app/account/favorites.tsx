import { StyleSheet, View, Pressable, FlatList, Platform, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useFavorites, toggleFavorite, type FavoriteProduct } from '@/hooks/use-api';
import { useCart } from '@/contexts/cart-context';
import { useAppAuth } from '@/contexts/auth-context';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getToken, isAuthenticated, exitGuestMode } = useAppAuth();
  const { addItem } = useCart();
  const [token, setToken] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Get auth token on mount
  useEffect(() => {
    const loadToken = async () => {
      if (isAuthenticated) {
        const t = await getToken();
        setToken(t);
      }
    };
    loadToken();
  }, [isAuthenticated, getToken]);

  const { data: favorites, isLoading, error, refetch } = useFavorites(token);

  const handleBack = () => {
    router.back();
  };

  const handleRemoveFavorite = async (item: FavoriteProduct) => {
    try {
      setRemovingId(item.productId);
      const currentToken = await getToken();
      await toggleFavorite(item.productId, currentToken);
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (item: FavoriteProduct) => {
    addItem({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.imageUrl || '',
      quantity: 1,
      unit: item.product.unit,
    });
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const renderProductCard = ({ item }: { item: FavoriteProduct }) => {
    const product = item.product;
    const isRemoving = removingId === item.productId;
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
    const discountPercent = hasDiscount
      ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
      : 0;

    return (
      <Pressable
        style={styles.productCard}
        onPress={() => handleProductPress(product.id)}
      >
        {/* Favorite Button */}
        <Pressable
          style={styles.favoriteButton}
          onPress={() => handleRemoveFavorite(item)}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color={tokens.colors.semantic.status.error.default} />
          ) : (
            <Icon name="heart" size="sm" color={tokens.colors.semantic.status.error.default} />
          )}
        </Pressable>

        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              width={120}
              height={120}
              borderRadius={8}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size="lg" color={tokens.colors.semantic.text.quaternary} />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {product.brand && (
            <Text style={styles.brandName} numberOfLines={1}>{product.brand.name}</Text>
          )}
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productUnit}>{product.unitSize || product.unit}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>${product.compareAtPrice!.toFixed(2)}</Text>
            )}
          </View>
        </View>

        {/* Add to Cart Button */}
        <Pressable
          style={[
            styles.addButton,
            !product.inStock && styles.addButtonDisabled,
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={!product.inStock}
        >
          {product.inStock ? (
            <>
              <Icon name="add" size="sm" color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </>
          ) : (
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          )}
        </Pressable>
      </Pressable>
    );
  };

  // Not signed in
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
          <Text variant="h3" style={styles.headerTitle}>Favorites</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyState}>
          <Icon name="heart" size="xl" color={tokens.colors.semantic.text.tertiary} />
          <Text variant="h4" style={styles.emptyTitle}>Sign in to see favorites</Text>
          <Text style={styles.emptyText}>
            Sign in to save your favorite products and access them anytime.
          </Text>
          <Pressable style={styles.signInButton} onPress={() => exitGuestMode()}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Favorites</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View style={styles.emptyState}>
          <Icon name="alert-circle" size="xl" color={tokens.colors.semantic.status.error.default} />
          <Text variant="h4" style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!favorites || favorites.length === 0) && (
        <View style={styles.emptyState}>
          <Icon name="heart-outline" size="xl" color={tokens.colors.semantic.text.tertiary} />
          <Text variant="h4" style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart icon on products to save them here for easy access.
          </Text>
          <Pressable style={styles.shopNowButton} onPress={() => router.push('/')}>
            <Text style={styles.shopNowText}>Browse Products</Text>
          </Pressable>
        </View>
      )}

      {/* Favorites Grid */}
      {!isLoading && !error && favorites && favorites.length > 0 && (
        <FlatList
          data={favorites}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[3],
  },
  loadingText: {
    fontSize: 15,
    color: tokens.colors.semantic.text.secondary,
  },

  // Grid
  gridContent: {
    padding: tokens.spacing[4],
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: tokens.spacing[4],
  },

  // Product Card
  productCard: {
    width: '48%',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[3],
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  favoriteButton: {
    position: 'absolute',
    top: tokens.spacing[2],
    right: tokens.spacing[2],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  discountBadge: {
    position: 'absolute',
    top: tokens.spacing[2],
    left: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.status.error.default,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
    marginTop: tokens.spacing[2],
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    gap: 2,
  },
  brandName: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
    lineHeight: 18,
  },
  productUnit: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    marginTop: tokens.spacing[2],
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  originalPrice: {
    fontSize: 13,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 8,
    paddingVertical: tokens.spacing[2],
    marginTop: tokens.spacing[3],
    gap: 4,
  },
  addButtonDisabled: {
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.semantic.text.tertiary,
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
    lineHeight: 22,
  },
  shopNowButton: {
    marginTop: tokens.spacing[6],
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 8,
  },
  shopNowText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  signInButton: {
    marginTop: tokens.spacing[6],
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  retryButton: {
    marginTop: tokens.spacing[6],
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
