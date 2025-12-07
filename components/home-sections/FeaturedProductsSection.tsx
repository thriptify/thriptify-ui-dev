import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface FeaturedProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  image: string;
  isVegetarian?: boolean;
}

interface FeaturedProductsSectionProps {
  title?: string;
  items: FeaturedProduct[];
  favorites?: Record<string, boolean>;
  getItemQuantity?: (id: string) => number;
  onProductPress?: (productId: string) => void;
  onFavoriteToggle?: (productId: string) => void;
  onAddToCart?: (product: FeaturedProduct) => void;
  onQuantityChange?: (productId: string, delta: number) => void;
  onSeeAll?: () => void;
}

export function FeaturedProductsSection({
  title = 'Fresh Picks',
  items,
  favorites = {},
  getItemQuantity = () => 0,
  onProductPress,
  onFavoriteToggle,
  onAddToCart,
  onQuantityChange,
  onSeeAll,
}: FeaturedProductsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="h3" style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.brand.primary.default} />
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((product) => (
          <Pressable
            key={product.id}
            style={styles.productCard}
            onPress={() => onProductPress?.(product.id)}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: product.image }}
                width="100%"
                height={140}
                borderRadius={12}
              />
              <Pressable
                style={styles.favoriteButton}
                onPress={() => onFavoriteToggle?.(product.id)}
              >
                <Icon
                  name={favorites[product.id] ? 'heart-fill' : 'heart'}
                  size="sm"
                  color={favorites[product.id] ? tokens.colors.semantic.status.error.default : tokens.colors.semantic.text.tertiary}
                />
              </Pressable>
              <View style={styles.addButtonContainer}>
                {getItemQuantity(product.id) > 0 ? (
                  <View style={styles.quantityControl}>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() => onQuantityChange?.(product.id, -1)}
                    >
                      <Icon name="minus" size="sm" color={tokens.colors.semantic.surface.primary} />
                    </Pressable>
                    <Text style={styles.quantityText}>{getItemQuantity(product.id)}</Text>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() => onQuantityChange?.(product.id, 1)}
                    >
                      <Icon name="plus" size="sm" color={tokens.colors.semantic.surface.primary} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={styles.addButton}
                    onPress={() => onAddToCart?.(product)}
                  >
                    <Text style={styles.addButtonText}>ADD</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <View style={styles.productInfo}>
              <View style={styles.productBadges}>
                {product.isVegetarian && (
                  <View style={styles.vegBadge}>
                    <View style={styles.vegDot} />
                  </View>
                )}
                <Text style={styles.productCategory}>{product.category}</Text>
              </View>
              <Text variant="bodySmall" weight="medium" numberOfLines={2} style={styles.productTitle}>
                {product.title}
              </Text>
              <View style={styles.ratingRow}>
                <Icon name="star-fill" size="xs" color={tokens.colors.primitives.yellow[400]} />
                <Text style={styles.ratingText}>{product.rating}</Text>
                <Text style={styles.reviewCount}>({product.reviewCount})</Text>
              </View>
              <View style={styles.deliveryBadge}>
                <Icon name="time" size="xs" color={tokens.colors.semantic.status.success.default} />
                <Text style={styles.deliveryText}>{product.deliveryTime}</Text>
              </View>
              {product.originalPrice && (
                <Text style={styles.discountBadge}>
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </Text>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                {product.originalPrice && (
                  <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: tokens.spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  sectionTitle: {},
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  seeAllText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  productCard: {
    width: 160,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: tokens.colors.semantic.surface.tertiary,
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
  addButtonContainer: {
    position: 'absolute',
    bottom: -14,
    left: tokens.spacing[3],
    right: tokens.spacing[3],
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: 8,
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[5],
  },
  addButtonText: {
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '600',
    fontSize: 14,
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
  productInfo: {
    padding: tokens.spacing[3],
    paddingTop: tokens.spacing[5],
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
    borderRadius: 3,
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
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
  },
  productTitle: {
    marginBottom: tokens.spacing[1],
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: tokens.spacing[1],
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  reviewCount: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: tokens.spacing[1],
  },
  deliveryText: {
    fontSize: 11,
    color: tokens.colors.semantic.status.success.default,
  },
  discountBadge: {
    fontSize: 12,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
    marginBottom: tokens.spacing[1],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
});
