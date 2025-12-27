import React from 'react';
import { View, StyleSheet, TextStyle } from 'react-native';
import { Text } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface PriceDisplayProps {
  /** Current/sale price */
  price: number;
  /** Original price (shows strikethrough if provided) */
  originalPrice?: number;
  /** Price display variant */
  variant?: 'default' | 'sale' | 'success';
  /** Size of the price text */
  size?: 'sm' | 'md' | 'lg';
  /** Currency symbol */
  currency?: string;
}

export function PriceDisplay({
  price,
  originalPrice,
  variant = 'default',
  size = 'md',
  currency = '$',
}: PriceDisplayProps) {
  const priceStyle: TextStyle[] = [styles.price, styles[`price_${size}`]];

  if (variant === 'sale' || variant === 'success') {
    priceStyle.push(styles.priceSuccess);
  }

  // Ensure price is a valid number
  const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0;
  const safeOriginalPrice = typeof originalPrice === 'number' && !isNaN(originalPrice) ? originalPrice : undefined;

  return (
    <View style={styles.container}>
      <Text style={priceStyle}>
        {currency}{safePrice.toFixed(2)}
      </Text>
      {safeOriginalPrice && safeOriginalPrice > safePrice && (
        <Text style={[styles.originalPrice, styles[`original_${size}`]]}>
          {currency}{safeOriginalPrice.toFixed(2)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  price: {
    fontWeight: String(tokens.typography.fontWeight.bold) as '700',
    color: tokens.colors.semantic.text.primary,
  },
  price_sm: {
    fontSize: tokens.typography.fontSize.sm,
  },
  price_md: {
    fontSize: tokens.typography.fontSize.base,
  },
  price_lg: {
    fontSize: tokens.typography.fontSize.lg,
  },
  priceSuccess: {
    color: tokens.colors.semantic.status.success.default,
  },
  originalPrice: {
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  original_sm: {
    fontSize: tokens.typography.fontSize.xs,
  },
  original_md: {
    fontSize: tokens.typography.fontSize.xs,
  },
  original_lg: {
    fontSize: tokens.typography.fontSize.sm,
  },
});

export default PriceDisplay;
