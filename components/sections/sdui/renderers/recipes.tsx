/**
 * Recipes Section Renderer
 *
 * Renders recipe cards in horizontal scroll.
 */

import React from 'react';
import { View } from 'react-native';

import {
  SectionHeader,
  HorizontalCarousel,
  RecipeCard,
  sectionStyles,
} from '../../../shared';
import { getSeeAllUrl } from '../index';

import type { Section, RecipeSectionItem } from '@thriptify/api-types';
import type { SectionRendererProps } from '../../types';

export function renderRecipes(
  section: Section,
  props: SectionRendererProps
): React.ReactNode {
  const { onRecipePress, onSeeAll } = props;

  const items = section.items as RecipeSectionItem[];
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
          <RecipeCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.thumbnailUrl || item.imageUrl || ''}
            prepTime={item.prepTime}
            cookTime={item.cookTime}
            totalTime={item.totalTime}
            servings={item.servings}
            difficulty={item.difficulty}
            cuisine={item.cuisine}
            rating={item.rating}
            ratingCount={item.ratingCount}
            tags={item.tags}
            onPress={() => onRecipePress?.(item.id)}
          />
        ))}
      </HorizontalCarousel>
    </View>
  );
}

export default renderRecipes;
