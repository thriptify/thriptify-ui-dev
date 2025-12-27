/**
 * Categories Section Renderer
 *
 * Renders category grid with configurable size based on displayType.
 * Supports two modes:
 * 1. Flat grid: Simple icon grid when categories have no children
 * 2. Grouped layout: Category titles with subcategory grids when children exist
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { tokens } from '@thriptify/tokens/react-native';

import { SectionHeader, CategoryGrid } from '../../../shared';
import { getCategoryGridSize, getSeeAllUrl } from '../index';

import type { Section, CategorySectionItem } from '@thriptify/api-types';
import type { SectionRendererProps } from '../../types';

// Extended type to include children
interface CategoryWithChildren extends CategorySectionItem {
  children?: CategorySectionItem[];
}

export function renderCategories(
  section: Section,
  props: SectionRendererProps
): React.ReactNode {
  const { onCategoryPress, onSeeAll } = props;

  const items = section.items as CategoryWithChildren[];
  const size = getCategoryGridSize(section.displayType);
  const seeAllUrl = getSeeAllUrl(section);

  // Only use grouped layout when displayType explicitly requests it
  // Other displayTypes use flat grid - drill-down modal handles subcategory selection
  const useGroupedLayout = section.displayType === 'grid_grouped';

  // Grouped layout: Show category title with subcategories underneath
  if (useGroupedLayout) {
    return (
      <View style={styles.container}>
        {items
          .filter((category) => category.children && category.children.length > 0)
          .map((category) => (
            <CategoryGrid
              key={category.id}
              title={category.name}
              items={(category.children || []).map((child) => ({
                id: child.id,
                title: child.name,
                image: child.imageUrl || '',
              }))}
              size={size}
              onCategoryPress={onCategoryPress}
            />
          ))}
      </View>
    );
  }

  // Flat grid: Simple icon grid for parent categories
  // Children data is available in section.items for drill-down modal pattern
  return (
    <View style={styles.container}>
      {section.showViewAll && seeAllUrl ? (
        <SectionHeader
          title={section.title}
          onSeeAll={() => onSeeAll?.(seeAllUrl)}
        />
      ) : null}
      <CategoryGrid
        title={!section.showViewAll ? section.title : undefined}
        items={items.map((item) => ({
          id: item.id,
          title: item.name,
          image: item.imageUrl || '',
        }))}
        size={size}
        onCategoryPress={onCategoryPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing[4],
  },
});

export default renderCategories;
