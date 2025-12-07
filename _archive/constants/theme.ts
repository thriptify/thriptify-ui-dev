/**
 * Thriptify UI Demo Theme
 * 
 * This theme uses @thriptify/tokens as the single source of truth for design tokens.
 * All colors, spacing, typography, and other design values come from the tokens package.
 */

import { Platform } from 'react-native';
import { tokens } from '@thriptify/tokens/react-native';

// Extract commonly used tokens for convenience
const { colors, spacing, typography, radius, opacity } = tokens;

// Light mode colors using tokens
const tintColorLight = colors.semantic.brand.primary.default;
const tintColorDark = colors.semantic.text.inverse;

export const Colors = {
  light: {
    text: colors.semantic.text.primary,
    background: colors.semantic.surface.primary,
    tint: tintColorLight,
    icon: colors.semantic.text.secondary,
    tabIconDefault: colors.semantic.text.secondary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: colors.dark.semantic.text.primary,
    background: colors.dark.semantic.surface.primary,
    tint: colors.dark.semantic.brand.primary.default,
    icon: colors.dark.semantic.text.secondary,
    tabIconDefault: colors.dark.semantic.text.secondary,
    tabIconSelected: colors.dark.semantic.brand.primary.default,
  },
};

// Typography using tokens
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: typography.fontFamily.sans,
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: typography.fontFamily.mono,
  },
  default: {
    sans: typography.fontFamily.sans,
    serif: 'serif',
    rounded: 'normal',
    mono: typography.fontFamily.mono,
  },
  web: {
    sans: typography.fontFamily.sans,
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: typography.fontFamily.mono,
  },
});

// Export tokens for direct use in components
export { tokens };
export { spacing, typography, radius, opacity };
