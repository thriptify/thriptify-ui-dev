import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface BestsellerCategory {
  id: string;
  title: string;
  moreCount: number;
  images: string[];
}

interface BestsellersSectionProps {
  title?: string;
  items: BestsellerCategory[];
  onCategoryPress?: (categoryId: string) => void;
}

export function BestsellersSection({
  title = 'Bestsellers',
  items,
  onCategoryPress,
}: BestsellersSectionProps) {
  return (
    <View style={styles.section}>
      <Text variant="h3" style={styles.sectionTitle}>{title}</Text>
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
            <View style={styles.images}>
              {category.images.map((img, idx) => (
                <View key={idx} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: img }}
                    width={50}
                    height={50}
                    borderRadius={8}
                  />
                </View>
              ))}
            </View>
            <View style={styles.moreBadge}>
              <Text style={styles.moreText}>+{category.moreCount} more</Text>
            </View>
            <Text variant="bodySmall" weight="medium" style={styles.cardTitle}>
              {category.title}
            </Text>
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
  sectionTitle: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  card: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: tokens.spacing[3],
    width: 160,
  },
  images: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[2],
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  moreBadge: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: tokens.spacing[2],
  },
  moreText: {
    fontSize: 11,
    color: tokens.colors.semantic.text.secondary,
  },
  cardTitle: {
    textAlign: 'center',
  },
});
