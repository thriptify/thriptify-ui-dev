import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface RecipeCategoryCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  recipeCount?: number;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: { width: 140, height: 100, titleSize: 'bodySmall' as const },
  md: { width: 160, height: 120, titleSize: 'body' as const },
  lg: { width: 200, height: 140, titleSize: 'bodyLarge' as const },
};

const PLACEHOLDER_COLORS: Record<string, string[]> = {
  breakfast: ['#FFB74D', '#FF9800'],
  lunch: ['#81C784', '#4CAF50'],
  dinner: ['#7986CB', '#3F51B5'],
  snacks: ['#BA68C8', '#9C27B0'],
  desserts: ['#F06292', '#E91E63'],
  beverages: ['#4DD0E1', '#00BCD4'],
  default: ['#90A4AE', '#607D8B'],
};

export function RecipeCategoryCard({
  name,
  slug,
  imageUrl,
  recipeCount,
  onPress,
  size = 'md',
}: RecipeCategoryCardProps) {
  const config = SIZE_CONFIG[size];
  const gradientColors = PLACEHOLDER_COLORS[slug.toLowerCase()] || PLACEHOLDER_COLORS.default;

  return (
    <Pressable
      style={[styles.card, { width: config.width }]}
      onPress={onPress}
    >
      <View style={[styles.imageContainer, { height: config.height }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            width={config.width}
            height={config.height}
            borderRadius={16}
          />
        ) : (
          <LinearGradient
            colors={gradientColors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.placeholder, { borderRadius: 16 }]}
          />
        )}

        {/* Overlay Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />

        {/* Content */}
        <View style={styles.content}>
          <Text
            variant={config.titleSize}
            weight="bold"
            style={styles.title}
            numberOfLines={2}
          >
            {name}
          </Text>
          {recipeCount !== undefined && (
            <Text variant="caption" style={styles.count}>
              {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: tokens.spacing[3],
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeholder: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing[3],
  },
  title: {
    color: tokens.colors.semantic.text.inverse,
    marginBottom: 2,
  },
  count: {
    color: tokens.colors.semantic.glass.border.light,
    opacity: 0.9,
  },
});
