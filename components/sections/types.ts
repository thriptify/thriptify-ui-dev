/**
 * Unified section types for home/tab pages
 * Re-exports from @thriptify/api-types with UI-specific extensions
 */

import type {
  Section as ApiSection,
  ProductSectionItem as ApiProductSectionItem,
} from '@thriptify/api-types';

// Re-export all section types from shared package
export type {
  SectionType,
  DisplayType,
  CategorySectionItem,
  ProductSectionItem,
  BrandSectionItem,
  StorySectionItem,
  BannerSectionItem,
  RecipeSectionItem,
  RecipeCategorySectionItem,
  RecipeTagSectionItem,
  RecipeTagItem,
  RecipeCategoryItem,
  SectionItem,
  Section,
  TabPage,
  TabSectionsResponse,
} from '@thriptify/api-types';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface SectionRendererProps {
  section: ApiSection;
  onProductPress?: (productId: string) => void;
  onProductRecipesPress?: (productSlug: string) => void;
  onCategoryPress?: (categoryId: string) => void;
  onBrandPress?: (brandId: string) => void;
  onRecipePress?: (recipeId: string) => void;
  onRecipeCategoryPress?: (categorySlug: string) => void;
  onRecipeTagPress?: (tagSlug: string) => void;
  onBannerPress?: (linkType: string, linkId: string) => void;
  onSeeAll?: (link: string) => void;
  // Cart integration
  favorites?: Record<string, boolean>;
  getItemQuantity?: (productId: string) => number;
  onFavoriteToggle?: (productId: string) => void;
  onAddToCart?: (product: ApiProductSectionItem) => void;
  onQuantityChange?: (productId: string, delta: number) => void;
}
