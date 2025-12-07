import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Text, Image, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface DealItem {
  id: string;
  title: string;
  discount: string;
  originalPrice: number;
  salePrice: number;
  image: string;
  endsIn?: string;
  onPress?: () => void;
}

export interface DealCarouselProps {
  title?: string;
  items: DealItem[];
  onSeeAll?: () => void;
}

export function DealCarousel({
  title = 'Flash Deals',
  items,
  onSeeAll,
}: DealCarouselProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="flash" size="md" color={tokens.colors.semantic.status.warning.default} />
          <Text variant="h3" style={styles.title}>{title}</Text>
        </View>
        {onSeeAll && (
          <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.brand.primary.default} />
          </Pressable>
        )}
      </View>

      {/* Deals Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.dealCard}
            onPress={item.onPress}
          >
            {/* Discount Badge */}
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>

            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image }}
                width={100}
                height={100}
                borderRadius={8}
              />
            </View>

            {/* Info */}
            <View style={styles.dealInfo}>
              <Text variant="caption" numberOfLines={2} style={styles.dealTitle}>
                {item.title}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.salePrice}>${item.salePrice.toFixed(2)}</Text>
                <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
              </View>
              {item.endsIn && (
                <View style={styles.timerRow}>
                  <Icon name="time" size="xs" color={tokens.colors.semantic.status.error.default} />
                  <Text style={styles.timerText}>{item.endsIn}</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  title: {
    color: tokens.colors.semantic.text.primary,
  },
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
  dealCard: {
    width: 140,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[2],
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: tokens.spacing[2],
    left: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.status.error.default,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
  },
  dealInfo: {
    gap: tokens.spacing[1],
  },
  dealTitle: {
    color: tokens.colors.semantic.text.primary,
    fontWeight: '500',
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.semantic.status.success.default,
  },
  originalPrice: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  timerText: {
    fontSize: 11,
    color: tokens.colors.semantic.status.error.default,
    fontWeight: '500',
  },
});
