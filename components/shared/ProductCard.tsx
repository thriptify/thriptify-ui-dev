import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { PriceDisplay } from './PriceDisplay';
import { QuantityStepper } from './QuantityStepper';
import { useCanAddToCart } from '@/contexts/location-context';
import { useResponsiveImage, type ImageVariants } from '@/hooks/use-responsive-image';

// ============================================
// FEATURE FLAGS
// ============================================
/**
 * Feature flags for controlling product card UI features
 * TODO: Move to a centralized feature flag system
 */
export const PRODUCT_CARD_FEATURE_FLAGS = {
  /**
   * Show vegetarian badge on products
   * Disabled for US market as it's not commonly used
   */
  SHOW_VEGETARIAN_BADGE: false,

  /**
   * Show delivery time on product cards
   * Disabled as delivery time is shown globally on home page
   */
  SHOW_DELIVERY_TIME: false,

  /**
   * Show rating and review count
   * Enabled by default
   */
  SHOW_RATING: true,
};

export interface Product {
  id: string;
  slug?: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;                     // Legacy fallback URL
  imageVariants?: ImageVariants;     // Responsive image variants
  weight?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  isVegetarian?: boolean;
  isBestseller?: boolean;
  isOrganic?: boolean;
  isOutOfStock?: boolean;
  recipeCount?: number;
}

export interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  quantity?: number;
  width?: number;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  onAddToCart?: () => void;
  onQuantityChange?: (delta: number) => void;
  onNotify?: () => void;
  onRecipesPress?: () => void;
}

export function ProductCard({
  product,
  isFavorite = false,
  quantity = 0,
  width = 160,
  onPress,
  onFavoriteToggle,
  onAddToCart,
  onQuantityChange,
  onNotify,
  onRecipesPress,
}: ProductCardProps) {
  const canAddToCart = useCanAddToCart();
  const [showBrowseModeTooltip, setShowBrowseModeTooltip] = useState(false);

  // Get responsive image URL based on card width
  const imageUrl = useResponsiveImage({
    variants: product.imageVariants,
    fallbackUrl: product.image,
    size: 'card',
    width,
  });

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!canAddToCart) {
      // Show tooltip briefly
      setShowBrowseModeTooltip(true);
      setTimeout(() => setShowBrowseModeTooltip(false), 2000);
      return;
    }
    onAddToCart?.();
  };

  const handleQuantityChange = (delta: number) => {
    if (!canAddToCart && delta > 0) {
      setShowBrowseModeTooltip(true);
      setTimeout(() => setShowBrowseModeTooltip(false), 2000);
      return;
    }
    onQuantityChange?.(delta);
  };

  return (
    <Pressable
      style={[styles.productCard, { width }]}
      onPress={onPress}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl || undefined }}
          style={{ width: '100%', height: 140 }}
          borderRadius={12}
        />

        {/* Out of stock overlay */}
        {product.isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of stock</Text>
          </View>
        )}

        {/* Favorite button */}
        <Pressable
          style={styles.favoriteButton}
          onPress={onFavoriteToggle}
        >
          <Icon
            name={isFavorite ? 'heart-fill' : 'heart'}
            size="sm"
            color={isFavorite ? tokens.colors.semantic.status.error.default : tokens.colors.semantic.text.tertiary}
          />
        </Pressable>

        {/* Discount badge - Blue theme */}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discount}% OFF</Text>
          </View>
        )}

        {/* Bestseller badge */}
        {product.isBestseller && !discount && (
          <View style={styles.bestsellerBadge}>
            <Text style={styles.bestsellerText}>Bestseller</Text>
          </View>
        )}

        {/* Add button - Smaller, positioned bottom-right */}
        <View style={styles.addButtonContainer}>
          {/* Browse mode tooltip */}
          {showBrowseModeTooltip && (
            <View style={styles.browseTooltip}>
              <Text style={styles.browseTooltipText}>Not available in your area</Text>
            </View>
          )}

          {product.isOutOfStock ? (
            <Pressable
              style={styles.notifyButton}
              onPress={onNotify}
            >
              <Text style={styles.notifyButtonText}>Notify</Text>
            </Pressable>
          ) : quantity > 0 ? (
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => handleQuantityChange(1)}
              onDecrement={() => handleQuantityChange(-1)}
              variant="compact"
              size="sm"
            />
          ) : (
            <Pressable
              style={[
                styles.addButton,
                !canAddToCart && styles.addButtonDisabled,
              ]}
              onPress={handleAddToCart}
            >
              {canAddToCart ? (
                <Icon name="plus" size="sm" color={tokens.colors.semantic.surface.primary} />
              ) : (
                <Icon name="lock-closed" size="sm" color={tokens.colors.semantic.surface.primary} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        {/* Category and Veg badge */}
        {((product.category && product.category !== '') || (PRODUCT_CARD_FEATURE_FLAGS.SHOW_VEGETARIAN_BADGE && product.isVegetarian)) && (
          <View style={styles.productBadges}>
            {PRODUCT_CARD_FEATURE_FLAGS.SHOW_VEGETARIAN_BADGE && product.isVegetarian && (
              <View style={styles.vegBadge}>
                <View style={styles.vegDot} />
              </View>
            )}
            {product.category && product.category !== '' && (
              <Text style={styles.productCategory}>{product.category}</Text>
            )}
          </View>
        )}

        {/* Title */}
        <Text variant="bodySmall" weight="medium" numberOfLines={2} style={styles.productTitle}>
          {product.title}
        </Text>

        {/* Weight/Quantity */}
        {product.weight ? (
          <Text style={styles.weightText}>{product.weight}</Text>
        ) : null}

        {/* Rating */}
        {PRODUCT_CARD_FEATURE_FLAGS.SHOW_RATING && product.rating !== undefined && product.rating > 0 && (
          <View style={styles.ratingRow}>
            <Icon name="star-fill" size="xs" color={tokens.colors.primitives.yellow[400]} />
            <Text style={styles.ratingText}>{product.rating}</Text>
            {product.reviewCount !== undefined && product.reviewCount > 0 && (
              <Text style={styles.reviewCount}>({product.reviewCount})</Text>
            )}
          </View>
        )}

        {/* Delivery time */}
        {PRODUCT_CARD_FEATURE_FLAGS.SHOW_DELIVERY_TIME && product.deliveryTime && (
          <View style={styles.deliveryRow}>
            <Icon name="time" size="xs" color={tokens.colors.semantic.status.success.default} />
            <Text style={styles.deliveryText}>{product.deliveryTime}</Text>
          </View>
        )}

        {/* Price */}
        <PriceDisplay
          price={product.price}
          originalPrice={product.originalPrice}
          size="sm"
        />

        {/* Recipe link */}
        {product.recipeCount !== undefined && product.recipeCount > 0 && (
          <Pressable
            style={styles.recipeLink}
            onPress={(e) => {
              e.stopPropagation();
              onRecipesPress?.();
            }}
          >
            <Text style={styles.recipeLinkText}>See {product.recipeCount} recipes</Text>
            <Icon name="chevron-right" size="xs" color={tokens.colors.semantic.brand.primary.default} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  outOfStockText: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: String(tokens.typography.fontWeight.medium) as '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: tokens.spacing[2],
    right: tokens.spacing[2],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  discountBadge: {
    position: 'absolute',
    top: tokens.spacing[2],
    left: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  discountBadgeText: {
    fontSize: tokens.typography.fontSize.xs - 1,
    fontWeight: String(tokens.typography.fontWeight.semibold) as '600',
    color: tokens.colors.semantic.text.inverse,
  },
  bestsellerBadge: {
    position: 'absolute',
    top: tokens.spacing[2],
    left: tokens.spacing[2],
    backgroundColor: tokens.colors.primitives.yellow[100],
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  bestsellerText: {
    fontSize: tokens.typography.fontSize.xs - 1,
    fontWeight: String(tokens.typography.fontWeight.semibold) as '600',
    color: tokens.colors.primitives.yellow[700],
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: tokens.spacing[2],
    right: tokens.spacing[2],
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  addButtonDisabled: {
    backgroundColor: tokens.colors.semantic.text.tertiary,
  },
  browseTooltip: {
    position: 'absolute',
    bottom: 40,
    right: 0,
    backgroundColor: tokens.colors.semantic.text.primary,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: 8,
    minWidth: 140,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    }),
  },
  browseTooltipText: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: String(tokens.typography.fontWeight.medium) as '500',
    textAlign: 'center',
  },
  notifyButton: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    borderRadius: 16,
    paddingVertical: tokens.spacing[1],
    paddingHorizontal: tokens.spacing[3],
  },
  notifyButtonText: {
    color: tokens.colors.semantic.text.secondary,
    fontWeight: String(tokens.typography.fontWeight.medium) as '500',
    fontSize: tokens.typography.fontSize.xs - 1,
  },
  productInfo: {
    padding: tokens.spacing[3],
  },
  productBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[1],
  },
  vegBadge: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: tokens.radius.sm - 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  productCategory: {
    fontSize: tokens.typography.fontSize.xs - 1,
    color: tokens.colors.semantic.text.tertiary,
  },
  productTitle: {
    marginBottom: tokens.spacing[1],
    lineHeight: tokens.typography.fontSize.lg,
  },
  weightText: {
    fontSize: tokens.typography.fontSize.xs - 1,
    color: tokens.colors.semantic.text.tertiary,
    marginBottom: tokens.spacing[1],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    marginBottom: tokens.spacing[1],
  },
  ratingText: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: String(tokens.typography.fontWeight.medium) as '500',
    color: tokens.colors.semantic.text.primary,
  },
  reviewCount: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.semantic.text.tertiary,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    marginBottom: tokens.spacing[1],
  },
  deliveryText: {
    fontSize: tokens.typography.fontSize.xs - 1,
    color: tokens.colors.semantic.status.success.default,
  },
  recipeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing[2],
    paddingTop: tokens.spacing[2],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  recipeLinkText: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: String(tokens.typography.fontWeight.medium) as '500',
  },
});
