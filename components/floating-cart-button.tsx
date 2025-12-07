import React from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingCartButton as BaseFloatingCartButton } from '@thriptify/components';
import { useCart } from '@/contexts/cart-context';

interface FloatingCartButtonProps {
  /** Custom bottom offset. Defaults to insets.bottom + 70 (for pages with bottom nav) */
  bottomOffset?: number;
}

/**
 * FloatingCartButton wrapper
 *
 * Wraps the shared FloatingCartButton component with app-specific
 * cart context and navigation.
 */
export function FloatingCartButton({ bottomOffset }: FloatingCartButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, itemCount } = useCart();

  // Default offset accounts for bottom nav bar (70px)
  const defaultOffset = insets.bottom + 70;

  return (
    <BaseFloatingCartButton
      itemCount={itemCount}
      previewImage={items[0] ? { uri: items[0].image } : undefined}
      onPress={() => router.push('/cart')}
      bottomOffset={bottomOffset ?? defaultOffset}
    />
  );
}
