import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface RecipeCategory {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

interface RecipesSectionProps {
  title?: string;
  items: RecipeCategory[];
  onCategoryPress?: (categoryId: string) => void;
  onSeeAll?: () => void;
}

export function RecipesSection({
  title = 'Explore Recipes',
  items,
  onCategoryPress,
  onSeeAll,
}: RecipesSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="h3" style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.brand.primary.default} />
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((category) => (
          <Pressable
            key={category.id}
            style={styles.card}
            onPress={() => onCategoryPress?.(category.id)}
          >
            <Image
              source={{ uri: category.image }}
              width="100%"
              height={100}
              borderRadius={12}
            />
            <View style={styles.overlay}>
              <Text variant="bodySmall" weight="semibold" style={styles.cardTitle}>
                {category.title}
              </Text>
              <Text style={styles.cardSubtitle}>{category.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: tokens.spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  sectionTitle: {},
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  seeAllText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  card: {
    width: 150,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing[3],
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardTitle: {
    color: tokens.colors.semantic.text.inverse,
  },
  cardSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
});
