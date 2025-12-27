import { StyleSheet } from 'react-native';
import { tokens } from '@thriptify/tokens/react-native';

/**
 * Shared styles for section components
 */
export const sectionStyles = StyleSheet.create({
  /** Standard section container with bottom margin */
  section: {
    marginBottom: tokens.spacing[6],
  },
  /** Standard horizontal scroll content padding */
  scrollContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
});

/**
 * Shared styles for card components
 */
export const cardStyles = StyleSheet.create({
  /** Standard card with rounded corners */
  card: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: tokens.radius.xl + 2,
    overflow: 'hidden',
  },
  /** Card with padding */
  cardPadded: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: tokens.radius.xl + 2,
    padding: tokens.spacing[3],
    overflow: 'hidden',
  },
});

/**
 * Shared styles for icon + text badge patterns
 */
export const badgeStyles = StyleSheet.create({
  /** Row layout for icon + text */
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  /** Small text for badges */
  badgeText: {
    fontSize: tokens.typography.fontSize.xs - 1,
  },
  /** Badge container with background */
  badgeContainer: {
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
});

/**
 * Common spacing values used across components
 */
export const spacing = {
  sectionMargin: tokens.spacing[6],
  horizontalPadding: tokens.spacing[4],
  itemGap: tokens.spacing[3],
  smallGap: tokens.spacing[2],
  tinyGap: tokens.spacing[1],
};
