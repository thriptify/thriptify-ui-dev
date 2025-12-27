/**
 * Recipe Categories Section Renderer
 *
 * Renders recipe category/meal type cards.
 */

import React from 'react';
import { View } from 'react-native';

import {
  SectionHeader,
  HorizontalCarousel,
  RecipeCategoryCard,
  sectionStyles,
} from '../../../shared';
import { getSeeAllUrl } from '../index';

import type { Section, RecipeCategorySectionItem } from '@thriptify/api-types';
import type { SectionRendererProps } from '../../types';

export function renderRecipeCategories(
  section: Section,
  props: SectionRendererProps
): React.ReactNode {
  const { onRecipeCategoryPress, onSeeAll } = props;

  const items = section.items as RecipeCategorySectionItem[];
  const seeAllUrl = getSeeAllUrl(section);

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
          <RecipeCategoryCard
            key={item.id}
            id={item.id}
            name={item.name}
            slug={item.slug}
            description={item.description}
            imageUrl={item.imageUrl}
            recipeCount={item.recipeCount}
            onPress={() => onRecipeCategoryPress?.(item.slug)}
          />
        ))}
      </HorizontalCarousel>
    </View>
  );
}

export default renderRecipeCategories;
