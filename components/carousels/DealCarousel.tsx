import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Image, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { SectionHeader, HorizontalCarousel, PriceDisplay, badgeStyles } from '../shared';

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
      <SectionHeader
        title={title}
        onSeeAll={onSeeAll}
        leftIcon={{ name: 'flash', color: tokens.colors.semantic.status.warning.default }}
      />
      <HorizontalCarousel>
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
              <PriceDisplay
                price={item.salePrice}
                originalPrice={item.originalPrice}
                variant="sale"
              />
              {item.endsIn && (
                <View style={badgeStyles.iconTextRow}>
                  <Icon name="time" size="xs" color={tokens.colors.semantic.status.error.default} />
                  <Text style={styles.timerText}>{item.endsIn}</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </HorizontalCarousel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing[4],
  },
  dealCard: {
    width: 140,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: tokens.radius.xl,
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
    borderRadius: tokens.radius.sm,
    zIndex: 1,
  },
  discountText: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: tokens.typography.fontSize.xs - 1,
    fontWeight: String(tokens.typography.fontWeight.bold) as '700',
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
    fontWeight: String(tokens.typography.fontWeight.medium) as '500',
    lineHeight: tokens.typography.fontSize.base,
  },
  timerText: {
    fontSize: tokens.typography.fontSize.xs - 1,
    color: tokens.colors.semantic.status.error.default,
    fontWeight: String(tokens.typography.fontWeight.medium) as '500',
  },
});
