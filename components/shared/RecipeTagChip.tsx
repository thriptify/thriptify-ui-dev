import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface RecipeTagChipProps {
  id: string;
  name: string;
  slug: string;
  type: string;
  color?: string | null;
  icon?: string | null;
  recipeCount?: number;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
}

// Default colors by tag type
const TYPE_COLORS: Record<string, string> = {
  cuisine: '#FF6B35',      // Orange
  dietary: '#4CAF50',      // Green
  style: '#9C27B0',        // Purple
  occasion: '#2196F3',     // Blue
  dish: '#E91E63',         // Pink
  default: '#607D8B',      // Blue Grey
};

// Icon mapping by tag type
const TYPE_ICONS: Record<string, string> = {
  cuisine: 'earth-outline',
  dietary: 'leaf-outline',
  style: 'flash-outline',
  occasion: 'calendar-outline',
  dish: 'restaurant-outline',
};

const SIZE_CONFIG = {
  sm: { paddingH: tokens.spacing[2], paddingV: tokens.spacing[1], fontSize: 11, iconSize: 12 },
  md: { paddingH: tokens.spacing[3], paddingV: tokens.spacing[2], fontSize: 13, iconSize: 14 },
  lg: { paddingH: tokens.spacing[4], paddingV: tokens.spacing[2] + 2, fontSize: 14, iconSize: 16 },
};

export function RecipeTagChip({
  name,
  type,
  color,
  icon,
  recipeCount,
  onPress,
  size = 'md',
  selected = false,
}: RecipeTagChipProps) {
  const config = SIZE_CONFIG[size];
  const tagColor = color || TYPE_COLORS[type] || TYPE_COLORS.default;
  const tagIcon = icon || TYPE_ICONS[type];

  const backgroundColor = selected
    ? tagColor
    : `${tagColor}15`;

  const textColor = selected
    ? tokens.colors.semantic.text.inverse
    : tagColor;

  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor,
          paddingHorizontal: config.paddingH,
          paddingVertical: config.paddingV,
          borderColor: selected ? tagColor : `${tagColor}30`,
        },
      ]}
      onPress={onPress}
    >
      {tagIcon && (
        <Icon
          name={tagIcon as any}
          size={config.iconSize}
          color={textColor}
        />
      )}
      <Text
        style={[
          styles.text,
          { fontSize: config.fontSize, color: textColor },
        ]}
        weight={selected ? 'semibold' : 'medium'}
      >
        {name}
      </Text>
      {recipeCount !== undefined && recipeCount > 0 && (
        <Text
          style={[
            styles.count,
            { fontSize: config.fontSize - 2, color: textColor },
          ]}
        >
          ({recipeCount})
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    marginRight: tokens.spacing[2],
    marginBottom: tokens.spacing[2],
  },
  text: {
    textTransform: 'capitalize',
  },
  count: {
    opacity: 0.7,
  },
});
