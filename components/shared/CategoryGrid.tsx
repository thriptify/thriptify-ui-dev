import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@thriptify/ui-elements';
import { CategoryTile } from '@thriptify/components';
import { tokens } from '@thriptify/tokens/react-native';

export interface CategoryItem {
  id: string;
  title: string;
  image: string;
}

interface CategoryGridProps {
  title?: string;
  items: CategoryItem[];
  size?: 'sm' | 'md' | 'lg';
  onCategoryPress?: (categoryId: string) => void;
}

// CategoryTile sizes on mobile
const TILE_SIZES = {
  sm: 80,
  md: 85,
  lg: 100,
};

const COLUMNS = 4;

export function CategoryGrid({
  title,
  items,
  size = 'md',
  onCategoryPress,
}: CategoryGridProps) {
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);

  const tileWidth = TILE_SIZES[size];

  // Calculate equal spacing: left padding = gaps = right padding
  // Remaining space divided into 5 equal parts (left, 3 gaps, right)
  const totalTileWidth = COLUMNS * tileWidth;
  const remainingSpace = Math.max(0, containerWidth - totalTileWidth);
  const spacing = remainingSpace / 5;
  const gap = Math.max(spacing, tokens.spacing[1]);
  const horizontalPadding = Math.max(spacing, tokens.spacing[2]);

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {title && (
        <Text
          variant="h3"
          style={[styles.title, { paddingHorizontal: horizontalPadding }]}
        >
          {title}
        </Text>
      )}
      <View style={[styles.grid, { paddingHorizontal: horizontalPadding, gap }]}>
        {items.map((item) => (
          <CategoryTile
            key={item.id}
            title={item.title}
            image={{ uri: item.image }}
            size={size}
            onPress={() => onCategoryPress?.(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing[6],
  },
  title: {
    marginBottom: tokens.spacing[3],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
