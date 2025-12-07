import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@thriptify/ui-elements';
import { CategoryTile } from '@thriptify/components';
import { tokens } from '@thriptify/tokens/react-native';

export interface GroceryCategory {
  id: string;
  title: string;
  image: string;
}

interface GroceriesSectionProps {
  title?: string;
  items: GroceryCategory[];
  onCategoryPress?: (categoryId: string) => void;
}

export function GroceriesSection({
  title = 'Grocery & Kitchen',
  items,
  onCategoryPress,
}: GroceriesSectionProps) {
  return (
    <View style={styles.section}>
      <Text variant="h3" style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map((category) => (
          <CategoryTile
            key={category.id}
            title={category.title}
            image={{ uri: category.image }}
            size="md"
            onPress={() => onCategoryPress?.(category.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: tokens.spacing[6],
  },
  sectionTitle: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
});
