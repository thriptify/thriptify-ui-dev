import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface BestsellerCardProps {
  id: string;
  title: string;
  moreCount: number;
  images: string[];
  onPress?: () => void;
}

export function BestsellerCard({
  title,
  moreCount,
  images,
  onPress,
}: BestsellerCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.images}>
        {images.map((img, idx) => (
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
        <Text style={styles.moreText}>+{moreCount} more</Text>
      </View>
      <Text variant="bodySmall" weight="medium" style={styles.cardTitle}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: tokens.radius.xl + 2,
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
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
  },
  moreBadge: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: tokens.radius.xl,
    alignSelf: 'center',
    marginBottom: tokens.spacing[2],
  },
  moreText: {
    fontSize: tokens.typography.fontSize.xs - 1,
    color: tokens.colors.semantic.text.secondary,
  },
  cardTitle: {
    textAlign: 'center',
  },
});
