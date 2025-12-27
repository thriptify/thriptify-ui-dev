/**
 * Recipe Tags Section Renderer
 *
 * Renders recipe tags as chips or cuisine grid based on content.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

import {
  SectionHeader,
  RecipeTagChip,
  sectionStyles,
} from '../../../shared';
import { getSeeAllUrl } from '../index';

import type { Section, RecipeTagSectionItem } from '@thriptify/api-types';
import type { SectionRendererProps } from '../../types';

export function renderRecipeTags(
  section: Section,
  props: SectionRendererProps
): React.ReactNode {
  const { onRecipeTagPress, onSeeAll } = props;

  const items = section.items as RecipeTagSectionItem[];
  const seeAllUrl = getSeeAllUrl(section);

  // Check if this is a cuisine section (all items have type 'cuisine')
  const isCuisineSection = items.length > 0 && items.every(item => item.type === 'cuisine');

  // Render cuisine tags as image grid
  if (isCuisineSection) {
    return (
      <View style={sectionStyles.section}>
        <SectionHeader
          title={section.title}
          onSeeAll={section.showViewAll && seeAllUrl
            ? () => onSeeAll?.(seeAllUrl)
            : undefined
          }
        />
        <View style={styles.cuisineGrid}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.cuisineGridCard}
              onPress={() => onRecipeTagPress?.(item.slug)}
            >
              <Image
                source={{ uri: item.imageUrl || getCuisineImage(item.slug) }}
                width={undefined}
                height={100}
                style={[styles.cuisineGridImage, { width: '100%' }]}
              />
              <View style={styles.cuisineGridOverlay}>
                <Text variant="body" weight="semibold" style={styles.cuisineGridName}>
                  {item.name}
                </Text>
                {item.recipeCount !== undefined && item.recipeCount > 0 && (
                  <Text variant="caption" style={styles.cuisineGridCount}>
                    {item.recipeCount} recipes
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  // Render other tags as chips (dietary, style, etc.)
  return (
    <View style={sectionStyles.section}>
      <SectionHeader
        title={section.title}
        onSeeAll={section.showViewAll && seeAllUrl
          ? () => onSeeAll?.(seeAllUrl)
          : undefined
        }
      />
      <View style={styles.tagsContainer}>
        {items.map((item) => (
          <RecipeTagChip
            key={item.id}
            id={item.id}
            name={item.name}
            slug={item.slug}
            type={item.type}
            color={item.color}
            icon={item.icon}
            recipeCount={item.recipeCount}
            onPress={() => onRecipeTagPress?.(item.slug)}
          />
        ))}
      </View>
    </View>
  );
}

// Helper to get default cuisine images
function getCuisineImage(slug: string): string {
  const cuisineImages: Record<string, string> = {
    'indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    'south-asian': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop',
    'pakistani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
    'bangladeshi': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop',
    'sri-lankan': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
    'middle-eastern': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    'lebanese': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop',
    'turkish': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&h=300&fit=crop',
    'persian': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
    'egyptian': 'https://images.unsplash.com/photo-1575329378698-3c38f4e0f777?w=400&h=300&fit=crop',
    'moroccan': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&h=300&fit=crop',
    'italian': 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400&h=300&fit=crop',
    'mexican': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
    'thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop',
    'chinese': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
    'japanese': 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&h=300&fit=crop',
    'korean': 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop',
    'american': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
    'mediterranean': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    'french': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
  };
  return cuisineImages[slug] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop';
}

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  cuisineGridCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  cuisineGridImage: {
    borderRadius: 0,
  },
  cuisineGridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[3],
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cuisineGridName: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 14,
  },
  cuisineGridCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },
});

export default renderRecipeTags;
