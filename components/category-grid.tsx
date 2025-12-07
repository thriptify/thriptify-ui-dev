import { StyleSheet, Platform, View, Dimensions } from 'react-native';
import { CategoryTile, Text } from '@thriptify/components';
import { tokens } from '@thriptify/tokens/react-native';
import { useMemo, useState, useEffect } from 'react';

// Sample category data with images
export const categories = [
  {
    id: '1',
    title: 'Fruits',
    icon: 'nutrition' as const,
    image: { uri: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop' }
  },
  {
    id: '2',
    title: 'Vegetables',
    icon: 'leaf' as const,
    image: { uri: 'https://images.unsplash.com/photo-1598170845059-87b585a8af98?w=200&h=200&fit=crop' }
  },
  {
    id: '3',
    title: 'Dairy',
    icon: 'water' as const,
    image: { uri: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop' }
  },
  {
    id: '4',
    title: 'Meat',
    icon: 'cube' as const,
    image: { uri: 'https://images.unsplash.com/photo-1603048297172-c92544744786?w=200&h=200&fit=crop' }
  },
  {
    id: '5',
    title: 'Bakery',
    icon: 'star' as const,
    image: { uri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop' }
  },
  {
    id: '6',
    title: 'Beverages',
    icon: 'water' as const,
    image: { uri: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop' }
  },
  {
    id: '7',
    title: 'Snacks',
    icon: 'heart' as const,
    image: { uri: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&h=200&fit=crop' }
  },
  {
    id: '8',
    title: 'Spices',
    icon: 'tag' as const,
    image: { uri: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=200&fit=crop' }
  },
];

interface CategoryGridProps {
  title: string;
  categories?: typeof categories;
  onCategoryPress?: (categoryId: string, categoryTitle: string) => void;
}

export function CategoryGrid({ 
  title, 
  categories: customCategories = categories,
  onCategoryPress 
}: CategoryGridProps) {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Calculate responsive grid layout
  const { tileWidth, gap, tileSize } = useMemo(() => {
    const isWeb = Platform.OS === 'web';
    const MAX_CONTAINER_WIDTH = 1440;
    const MIN_SCREEN_WIDTH = 375;
    const MIN_COLUMNS = 4;
    const GAP = tokens.spacing[3]; // Gap between tiles
    // Category section has paddingHorizontal: 0, but title has paddingLeft: tokens.spacing[2]
    // For grid alignment, we'll account for the title's left padding
    const HORIZONTAL_PADDING = tokens.spacing[2]; // Left padding from categoryTitle
    
    // Calculate available width (accounting for min width, max width and padding)
    const effectiveWidth = Math.max(screenWidth, MIN_SCREEN_WIDTH);
    const containerWidth = Math.min(effectiveWidth, MAX_CONTAINER_WIDTH);
    const availableWidth = containerWidth - (HORIZONTAL_PADDING * 2); // Account for left padding and right margin
    
    // Determine tile size based on screen width (web only: use "md" for 0-450px, "lg" otherwise)
    const tileSize: 'sm' | 'md' | 'lg' = (isWeb && screenWidth <= 450) ? 'md' : 'lg';
    
    // Minimum tile width based on size
    // CategoryTile sizes: md ~100px (web) / ~85px (mobile), lg ~120px (web) / ~100px (mobile)
    const minTileWidth = isWeb
      ? (tileSize === 'md' ? 100 : 120)
      : (tileSize === 'md' ? 85 : 100);
    
    // Calculate how many columns can fit
    // Formula: (availableWidth + gap) / (minTileWidth + gap)
    const calculatedColumns = Math.floor((availableWidth + GAP) / (minTileWidth + GAP));
    const columns = Math.max(MIN_COLUMNS, calculatedColumns);
    
    // Calculate dynamic tile width to fit exactly N columns
    // Formula: (availableWidth - (gap * (columns - 1))) / columns
    const totalGapWidth = GAP * (columns - 1);
    const tileWidth = (availableWidth - totalGapWidth) / columns;
    
    return {
      tileWidth,
      gap: GAP,
      tileSize,
    };
  }, [screenWidth]);

  const handleCategoryPress = (categoryId: string, categoryTitle: string) => {
    if (onCategoryPress) {
      onCategoryPress(categoryId, categoryTitle);
    } else {
      console.log(`Category pressed: ${categoryTitle} (${categoryId})`);
    }
  };

  return (
    <View style={styles.categorySection}>
      <Text 
        variant="h3" 
        weight="semibold"
        style={styles.categoryTitle}
      >
        {title}
      </Text>
      <View style={[styles.categoriesGrid, { gap }]}>
        {customCategories.map((category) => (
          <CategoryTile
            key={category.id}
            title={category.title}
            image={category.image}
            icon={category.icon}
            size={tileSize}
            containerStyle={{ width: tileWidth }}
            onPress={() => handleCategoryPress(category.id, category.title)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  categorySection: {
    paddingHorizontal: tokens.spacing[0],
    paddingBottom: tokens.spacing[6],
  },
  categoryTitle: {
    marginBottom: tokens.spacing[2],
    color: tokens.colors.semantic.text.primary,
    paddingLeft: tokens.spacing[2],
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    paddingLeft: tokens.spacing[2],
  },
});

