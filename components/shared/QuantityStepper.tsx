import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface QuantityStepperProps {
  /**
   * Current quantity value
   */
  quantity: number;
  /**
   * Called when increment button is pressed
   */
  onIncrement: () => void;
  /**
   * Called when decrement button is pressed
   */
  onDecrement: () => void;
  /**
   * Minimum allowed quantity (default: 0)
   */
  min?: number;
  /**
   * Maximum allowed quantity (default: 99)
   */
  max?: number;
  /**
   * Visual variant
   * - 'default': Gray background with outlined/filled buttons (for lists)
   * - 'compact': Solid green background (for product cards)
   */
  variant?: 'default' | 'compact';
  /**
   * Size of the control
   * - 'sm': Smaller for tight spaces
   * - 'md': Default size
   */
  size?: 'sm' | 'md';
  /**
   * Whether the control is disabled
   */
  disabled?: boolean;
}

/**
 * Reusable quantity stepper control with +/- buttons
 *
 * @example
 * // Default variant (for lists)
 * <QuantityStepper
 *   quantity={2}
 *   onIncrement={() => setQty(q => q + 1)}
 *   onDecrement={() => setQty(q => q - 1)}
 * />
 *
 * @example
 * // Compact variant (for product cards)
 * <QuantityStepper
 *   quantity={1}
 *   onIncrement={handleIncrement}
 *   onDecrement={handleDecrement}
 *   variant="compact"
 *   size="sm"
 * />
 */
export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  variant = 'default',
  size = 'md',
  disabled = false,
}: QuantityStepperProps) {
  const canDecrement = quantity > min && !disabled;
  const canIncrement = quantity < max && !disabled;

  const isCompact = variant === 'compact';
  const isSmall = size === 'sm';

  const buttonSize = isSmall ? 24 : 28;
  const iconSize = isSmall ? 'xs' : 'xs';

  if (isCompact) {
    // Compact variant: solid green pill (used in ProductCard)
    return (
      <View style={[styles.compactContainer, disabled && styles.disabled]}>
        <Pressable
          style={styles.compactButton}
          onPress={onDecrement}
          disabled={!canDecrement}
          hitSlop={8}
        >
          <Icon
            name="minus"
            size={iconSize}
            color={canDecrement ? tokens.colors.semantic.surface.primary : tokens.colors.semantic.surface.tertiary}
          />
        </Pressable>
        <Text style={styles.compactQuantityText}>{quantity}</Text>
        <Pressable
          style={styles.compactButton}
          onPress={onIncrement}
          disabled={!canIncrement}
          hitSlop={8}
        >
          <Icon
            name="plus"
            size={iconSize}
            color={canIncrement ? tokens.colors.semantic.surface.primary : tokens.colors.semantic.surface.tertiary}
          />
        </Pressable>
      </View>
    );
  }

  // Default variant: gray container with separate buttons
  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Pressable
        style={[
          styles.button,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          !canDecrement && styles.buttonDisabled,
        ]}
        onPress={onDecrement}
        disabled={!canDecrement}
        hitSlop={8}
      >
        <Icon
          name="minus"
          size={iconSize}
          color={canDecrement ? tokens.colors.semantic.text.primary : tokens.colors.semantic.text.tertiary}
        />
      </Pressable>
      <Text style={[styles.quantityText, isSmall && styles.quantityTextSmall]}>
        {quantity}
      </Text>
      <Pressable
        style={[
          styles.button,
          styles.buttonAdd,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          !canIncrement && styles.buttonAddDisabled,
        ]}
        onPress={onIncrement}
        disabled={!canIncrement}
        hitSlop={8}
      >
        <Icon
          name="plus"
          size={iconSize}
          color={tokens.colors.semantic.surface.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Default variant styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 20,
    paddingHorizontal: tokens.spacing[1],
    paddingVertical: tokens.spacing[1],
  },
  button: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonAdd: {
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderColor: tokens.colors.semantic.status.success.default,
  },
  buttonAddDisabled: {
    backgroundColor: tokens.colors.semantic.text.tertiary,
    borderColor: tokens.colors.semantic.text.tertiary,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    minWidth: 20,
    textAlign: 'center',
  },
  quantityTextSmall: {
    fontSize: 12,
    minWidth: 16,
  },

  // Compact variant styles (for ProductCard)
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 16,
    paddingVertical: tokens.spacing[1],
    paddingHorizontal: tokens.spacing[1],
  },
  compactButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactQuantityText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 12,
    minWidth: 20,
    textAlign: 'center',
  },

  // Shared
  disabled: {
    opacity: 0.5,
  },
});

export default QuantityStepper;
