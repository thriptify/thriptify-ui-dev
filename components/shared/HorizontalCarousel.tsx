import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { tokens } from '@thriptify/tokens/react-native';

export interface HorizontalCarouselProps {
  /** Content to render inside the carousel */
  children: ReactNode;
  /** Additional content container style */
  contentContainerStyle?: ViewStyle;
  /** Whether to show the scroll indicator */
  showsScrollIndicator?: boolean;
}

export function HorizontalCarousel({
  children,
  contentContainerStyle,
  showsScrollIndicator = false,
}: HorizontalCarouselProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsScrollIndicator}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
});

export default HorizontalCarousel;
