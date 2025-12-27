import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Image, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import type { RecipeTagItem } from '@thriptify/api-types';

export interface RecipeCardProps {
  id: string;
  title: string;
  imageUrl: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  difficulty?: string;
  cuisine?: string | null;
  rating?: number | null;
  ratingCount?: number;
  tags?: RecipeTagItem[];
  onPress?: () => void;
  width?: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: tokens.colors.semantic.status.success.default,
  medium: tokens.colors.semantic.status.warning.default,
  hard: tokens.colors.semantic.status.error.default,
};

export function RecipeCard({
  title,
  imageUrl,
  prepTime,
  cookTime,
  totalTime,
  difficulty,
  cuisine,
  rating,
  tags,
  onPress,
  width = 180,
}: RecipeCardProps) {
  const displayTime = totalTime || (prepTime && cookTime ? prepTime + cookTime : prepTime || cookTime);
  const cuisineTag = tags?.find(t => t.type === 'cuisine') || (cuisine ? { name: cuisine, color: null } : null);
  const difficultyColor = difficulty ? DIFFICULTY_COLORS[difficulty.toLowerCase()] || tokens.colors.semantic.text.secondary : undefined;

  return (
    <Pressable style={[styles.card, { width }]} onPress={onPress}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          width={width}
          height={width * 0.7}
          borderRadius={16}
        />

        {/* Time Badge */}
        {displayTime && (
          <View style={styles.timeBadge}>
            <Icon name="time-outline" size={12} color={tokens.colors.semantic.text.inverse} />
            <Text variant="caption" weight="medium" style={styles.timeText}>
              {displayTime} min
            </Text>
          </View>
        )}

        {/* Rating Badge */}
        {rating && rating > 0 && (
          <View style={styles.ratingBadge}>
            <Icon name="star" size={12} color={tokens.colors.semantic.status.warning.default} />
            <Text variant="caption" weight="semibold" style={styles.ratingText}>
              {rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text
          variant="bodySmall"
          weight="semibold"
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </Text>

        {/* Meta Row: Cuisine + Difficulty */}
        <View style={styles.metaRow}>
          {cuisineTag && (
            <View style={[
              styles.cuisineChip,
              cuisineTag.color ? { backgroundColor: cuisineTag.color + '20' } : {}
            ]}>
              <Text
                variant="caption"
                style={[
                  styles.cuisineText,
                  cuisineTag.color ? { color: cuisineTag.color } : {}
                ]}
              >
                {cuisineTag.name}
              </Text>
            </View>
          )}

          {difficulty && (
            <View style={styles.difficultyContainer}>
              <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
              <Text variant="caption" style={styles.difficultyText}>
                {difficulty}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: tokens.colors.semantic.surface.primary,
    overflow: 'hidden',
    marginRight: tokens.spacing[3],
  },
  imageContainer: {
    position: 'relative',
  },
  timeBadge: {
    position: 'absolute',
    top: tokens.spacing[2],
    left: tokens.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.overlay.heavy,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: tokens.radius.full,
    gap: 4,
  },
  timeText: {
    color: tokens.colors.semantic.text.inverse,
  },
  ratingBadge: {
    position: 'absolute',
    top: tokens.spacing[2],
    right: tokens.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: tokens.radius.full,
    gap: 2,
  },
  ratingText: {
    color: tokens.colors.semantic.text.primary,
  },
  content: {
    padding: tokens.spacing[3],
    gap: tokens.spacing[2],
  },
  title: {
    color: tokens.colors.semantic.text.primary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    flexWrap: 'wrap',
  },
  cuisineChip: {
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  cuisineText: {
    fontSize: 10,
    color: tokens.colors.semantic.brand.primary.default,
    textTransform: 'capitalize',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: 10,
    color: tokens.colors.semantic.text.secondary,
    textTransform: 'capitalize',
  },
});
