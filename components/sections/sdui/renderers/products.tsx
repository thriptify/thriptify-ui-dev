/**
 * Products Section Renderer
 *
 * Renders product cards in horizontal scroll or grid layout
 * based on displayType from the backend.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { tokens } from '@thriptify/tokens/react-native';

import {
  SectionHeader,
  HorizontalCarousel,
  ProductCard,
  sectionStyles,
} from '../../../shared';
import { getLayoutConfig, getSeeAllUrl } from '../index';

import type { Section, ProductSectionItem } from '@thriptify/api-types';
import type { SectionRendererProps } from '../../types';

export function renderProducts(
  section: Section,
  props: SectionRendererProps
): React.ReactNode {
  const {
    onProductPress,
    onProductRecipesPress,
    onSeeAll,
    favorites = {},
    getItemQuantity = () => 0,
    onFavoriteToggle,
    onAddToCart,
    onQuantityChange,
  } = props;

  const items = section.items as ProductSectionItem[];
  const layout = getLayoutConfig(section.displayType);
  const seeAllUrl = getSeeAllUrl(section);

  // Grid layout
  if (layout.mode === 'grid') {
    return (
      <View style={sectionStyles.section}>
        <SectionHeader
          title={section.title}
          onSeeAll={section.showViewAll && seeAllUrl
            ? () => onSeeAll?.(seeAllUrl)
            : undefined
          }
        />
        <View style={[styles.grid, { gap: layout.gap }]}>
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={mapProductItem(item)}
              isFavorite={favorites[item.id]}
              quantity={getItemQuantity(item.id)}
              width={layout.itemWidth}
              onPress={() => onProductPress?.(item.id)}
              onFavoriteToggle={() => onFavoriteToggle?.(item.id)}
              onAddToCart={() => onAddToCart?.(item)}
              onQuantityChange={(delta) => onQuantityChange?.(item.id, delta)}
              onRecipesPress={item.slug ? () => onProductRecipesPress?.(item.slug!) : undefined}
            />
          ))}
        </View>
      </View>
    );
  }

  // Horizontal scroll layout (default)
  return (
    <View style={sectionStyles.section}>
      <SectionHeader
        title={section.title}
        onSeeAll={section.showViewAll && seeAllUrl
          ? () => onSeeAll?.(seeAllUrl)
          : undefined
        }
      />
      <HorizontalCarousel>
        {items.map((item) => (
          <ProductCard
            key={item.id}
            product={mapProductItem(item)}
            isFavorite={favorites[item.id]}
            quantity={getItemQuantity(item.id)}
            width={layout.itemWidth}
            onPress={() => onProductPress?.(item.id)}
            onFavoriteToggle={() => onFavoriteToggle?.(item.id)}
            onAddToCart={() => onAddToCart?.(item)}
            onQuantityChange={(delta) => onQuantityChange?.(item.id, delta)}
            onRecipesPress={item.slug ? () => onProductRecipesPress?.(item.slug!) : undefined}
          />
        ))}
      </HorizontalCarousel>
    </View>
  );
}

function mapProductItem(item: ProductSectionItem) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.name,
    price: item.dealPrice || item.price,
    originalPrice: item.compareAtPrice || undefined,
    image: item.imageUrl || '',
    weight: item.unitSize || item.unit,
    isBestseller: false,
    isOrganic: item.dietaryTags?.includes('organic'),
    isOutOfStock: item.inStock === false,
    recipeCount: item.recipeCount,
  };
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
  },
});

export default renderProducts;
