/**
 * SDUI Layout Configuration
 *
 * Handles displayType to determine how sections are laid out.
 * The backend sends displayType like "horizontal_scroll", "grid_2x2", etc.
 * This module translates that into concrete layout values.
 */

import { Dimensions } from 'react-native';
import { tokens } from '@thriptify/tokens/react-native';
import type { DisplayType } from '@thriptify/api-types';

// =============================================================================
// TYPES
// =============================================================================

export interface LayoutConfig {
  /** Layout mode: horizontal scroll or grid */
  mode: 'horizontal' | 'grid';
  /** Number of columns (for grid mode) */
  columns: number;
  /** Item width (calculated or fixed) */
  itemWidth: number;
  /** Gap between items */
  gap: number;
  /** Horizontal padding for the container */
  horizontalPadding: number;
  /** Whether to show as a carousel with snap behavior */
  isCarousel: boolean;
  /** Card size variant */
  cardSize: 'sm' | 'md' | 'lg';
}

export interface LayoutContext {
  /** Screen width */
  screenWidth: number;
  /** Container width (screen - padding) */
  containerWidth: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = tokens.spacing[4]; // 16px
const CONTAINER_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2);
const DEFAULT_GAP = tokens.spacing[3]; // 12px

// =============================================================================
// LAYOUT CALCULATIONS
// =============================================================================

/**
 * Get layout configuration based on displayType
 */
export function getLayoutConfig(
  displayType: DisplayType | string = 'horizontal_scroll',
  context?: Partial<LayoutContext>
): LayoutConfig {
  const screenWidth = context?.screenWidth || SCREEN_WIDTH;
  const containerWidth = context?.containerWidth || (screenWidth - (HORIZONTAL_PADDING * 2));

  switch (displayType) {
    // Horizontal scrolling layouts
    case 'horizontal_scroll':
      return {
        mode: 'horizontal',
        columns: 1,
        itemWidth: 160, // Standard product card width
        gap: DEFAULT_GAP,
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: false,
        cardSize: 'md',
      };

    case 'carousel':
      return {
        mode: 'horizontal',
        columns: 1,
        itemWidth: containerWidth * 0.85, // Almost full width cards
        gap: DEFAULT_GAP,
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: true,
        cardSize: 'lg',
      };

    // Grid layouts
    case 'grid_2x2':
      return {
        mode: 'grid',
        columns: 2,
        itemWidth: (containerWidth - DEFAULT_GAP) / 2,
        gap: DEFAULT_GAP,
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: false,
        cardSize: 'lg',
      };

    case 'grid_3x3':
      return {
        mode: 'grid',
        columns: 3,
        itemWidth: (containerWidth - (DEFAULT_GAP * 2)) / 3,
        gap: DEFAULT_GAP,
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: false,
        cardSize: 'sm',
      };

    case 'grid_4x4':
      return {
        mode: 'grid',
        columns: 4,
        itemWidth: (containerWidth - (DEFAULT_GAP * 3)) / 4,
        gap: DEFAULT_GAP,
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: false,
        cardSize: 'sm',
      };

    // Banner layouts
    case 'banner_full':
      return {
        mode: 'horizontal',
        columns: 1,
        itemWidth: containerWidth,
        gap: 0,
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: true,
        cardSize: 'lg',
      };

    case 'banner_card':
      return {
        mode: 'horizontal',
        columns: 1,
        itemWidth: containerWidth * 0.9,
        gap: DEFAULT_GAP,
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: true,
        cardSize: 'lg',
      };

    // List layouts
    case 'list':
      return {
        mode: 'grid',
        columns: 1,
        itemWidth: containerWidth,
        gap: tokens.spacing[2],
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: false,
        cardSize: 'md',
      };

    // Chip/tag layouts
    case 'chips':
      return {
        mode: 'horizontal',
        columns: 1,
        itemWidth: 0, // Auto-width based on content
        gap: tokens.spacing[2],
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: false,
        cardSize: 'sm',
      };

    case 'wrap':
      return {
        mode: 'grid',
        columns: 0, // Flex wrap, no fixed columns
        itemWidth: 0, // Auto-width based on content
        gap: tokens.spacing[2],
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: false,
        cardSize: 'sm',
      };

    // Default fallback
    default:
      return {
        mode: 'horizontal',
        columns: 1,
        itemWidth: 160,
        gap: DEFAULT_GAP,
        horizontalPadding: HORIZONTAL_PADDING,
        isCarousel: false,
        cardSize: 'md',
      };
  }
}

/**
 * Get the number of visible items based on displayType
 */
export function getVisibleItemCount(displayType: DisplayType | string): number {
  const config = getLayoutConfig(displayType);

  if (config.mode === 'horizontal') {
    // For horizontal scroll, calculate how many fit
    const visibleWidth = CONTAINER_WIDTH;
    return Math.floor((visibleWidth + config.gap) / (config.itemWidth + config.gap));
  }

  // For grid, it depends on number of rows shown
  return config.columns * 2; // Assume 2 rows visible
}

/**
 * Calculate item width for a given number of columns
 */
export function calculateItemWidth(columns: number, gap: number = DEFAULT_GAP): number {
  return (CONTAINER_WIDTH - (gap * (columns - 1))) / columns;
}

/**
 * Get category grid size based on displayType
 */
export function getCategoryGridSize(displayType: DisplayType | string): 'sm' | 'md' {
  if (displayType === 'grid_3x3' || displayType === 'grid_4x4') {
    return 'sm';
  }
  return 'md';
}

/**
 * Get product card width based on displayType
 */
export function getProductCardWidth(displayType: DisplayType | string): number {
  const config = getLayoutConfig(displayType);
  return config.itemWidth;
}

// =============================================================================
// STYLE HELPERS
// =============================================================================

/**
 * Get container style based on layout config
 */
export function getContainerStyle(config: LayoutConfig) {
  if (config.mode === 'horizontal') {
    return {
      paddingHorizontal: config.horizontalPadding,
    };
  }

  return {
    paddingHorizontal: config.horizontalPadding,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: config.gap,
  };
}

/**
 * Get item style based on layout config
 */
export function getItemStyle(config: LayoutConfig, index: number) {
  if (config.mode === 'horizontal') {
    return {
      width: config.itemWidth,
      marginRight: config.gap,
    };
  }

  return {
    width: config.itemWidth,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const SDUILayout = {
  getConfig: getLayoutConfig,
  getVisibleCount: getVisibleItemCount,
  calculateWidth: calculateItemWidth,
  getCategorySize: getCategoryGridSize,
  getCardWidth: getProductCardWidth,
  getContainerStyle,
  getItemStyle,
};

export default SDUILayout;
