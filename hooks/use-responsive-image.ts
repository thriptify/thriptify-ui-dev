import { useMemo } from "react";
import { PixelRatio } from "react-native";

/**
 * Image variant URLs for responsive images
 * Each variant is optimized for specific use cases
 */
export interface ImageVariants {
  xs: string;      // 100×100 - Cart thumbnails
  sm: string;      // 200×200 - Grid cards (mobile)
  md: string;      // 400×400 - Grid cards (tablet)
  lg: string;      // 600×600 - Product detail (mobile)
  xl: string;      // 800×800 - Product detail (tablet)
  "2xl": string;   // 1200×1200 - Product detail (web)
  original: string; // max 2400×2400 - Zoom/lightbox
}

/**
 * Predefined size presets for common use cases
 */
export type ImageSize = "thumbnail" | "card" | "detail" | "full";

interface UseResponsiveImageOptions {
  /** All variant URLs from API */
  variants?: ImageVariants | null;
  /** Legacy fallback URL */
  fallbackUrl?: string | null;
  /** Preset size for the image */
  size: ImageSize;
  /** Override: explicit display width in logical pixels */
  width?: number;
}

/**
 * Map preset sizes to variants based on screen density
 * For retina displays (2x+), we serve larger variants for sharper images
 */
const SIZE_VARIANT_MAP: Record<ImageSize, { base: keyof ImageVariants; retina: keyof ImageVariants }> = {
  thumbnail: { base: "xs", retina: "sm" },   // 100/200px for cart, search
  card: { base: "sm", retina: "md" },        // 200/400px for product cards
  detail: { base: "lg", retina: "xl" },      // 600/800px for product detail
  full: { base: "xl", retina: "2xl" },       // 800/1200px for fullscreen
};

/**
 * Hook to get the appropriate image URL based on display size and screen density
 *
 * @example
 * // Using preset size
 * const imageUrl = useResponsiveImage({
 *   variants: product.imageVariants,
 *   fallbackUrl: product.image,
 *   size: "card",
 * });
 *
 * @example
 * // Using explicit width
 * const imageUrl = useResponsiveImage({
 *   variants: product.imageVariants,
 *   fallbackUrl: product.image,
 *   size: "card",
 *   width: 160, // Card width in logical pixels
 * });
 */
export function useResponsiveImage(options: UseResponsiveImageOptions): string | null {
  const { variants, fallbackUrl, size, width } = options;

  return useMemo(() => {
    // If no variants available, use fallback
    if (!variants) {
      return fallbackUrl || null;
    }

    const pixelRatio = PixelRatio.get();
    const isRetina = pixelRatio >= 2;

    // If explicit width provided, calculate best variant
    if (width) {
      const targetWidth = width * pixelRatio;
      return getVariantForWidth(variants, targetWidth) || fallbackUrl || null;
    }

    // Use preset size map
    const sizeConfig = SIZE_VARIANT_MAP[size];
    const variant = isRetina ? sizeConfig.retina : sizeConfig.base;

    return variants[variant] || fallbackUrl || null;
  }, [variants, fallbackUrl, size, width]);
}

/**
 * Get the appropriate variant for a target pixel width
 */
function getVariantForWidth(variants: ImageVariants, targetWidth: number): string {
  if (targetWidth <= 100) return variants.xs;
  if (targetWidth <= 200) return variants.sm;
  if (targetWidth <= 400) return variants.md;
  if (targetWidth <= 600) return variants.lg;
  if (targetWidth <= 800) return variants.xl;
  if (targetWidth <= 1200) return variants["2xl"];
  return variants.original;
}

/**
 * Non-hook version for use outside React components
 * Useful for image transforms or list rendering
 *
 * @example
 * const imageUrl = getImageUrlForWidth(product.imageVariants, 160, product.image);
 */
export function getImageUrlForWidth(
  variants: ImageVariants | null | undefined,
  displayWidth: number,
  fallbackUrl?: string | null
): string | null {
  if (!variants) {
    return fallbackUrl || null;
  }

  const pixelRatio = PixelRatio.get();
  const targetWidth = displayWidth * pixelRatio;

  return getVariantForWidth(variants, targetWidth);
}

/**
 * Get all variant URLs as an object (useful for prefetching)
 */
export function getAllVariantUrls(
  variants: ImageVariants | null | undefined,
  fallbackUrl?: string | null
): string[] {
  if (!variants) {
    return fallbackUrl ? [fallbackUrl] : [];
  }

  return [
    variants.xs,
    variants.sm,
    variants.md,
    variants.lg,
    variants.xl,
    variants["2xl"],
    variants.original,
  ].filter(Boolean);
}

/**
 * Check if variants are available
 */
export function hasVariants(variants: ImageVariants | null | undefined): variants is ImageVariants {
  return !!variants && !!variants.sm;
}
