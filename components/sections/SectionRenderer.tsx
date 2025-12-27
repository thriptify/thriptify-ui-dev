/**
 * SectionRenderer - SDUI-powered section renderer
 *
 * This component uses the component registry to render sections based on their
 * sectionType. The backend controls what sections appear and how they're displayed.
 *
 * Features:
 * - Component registry pattern (easy to add new section types)
 * - Dynamic layout based on displayType
 * - Dynamic "See All" actions
 * - Graceful fallback for unknown section types
 */

import React from 'react';

// Initialize the component registry with all renderers
import './sdui/renderers';

// Import the registry
import { renderSection } from './sdui/registry';

// Types
import type { SectionRendererProps } from './types';

/**
 * SectionRenderer - Renders a section using the SDUI component registry
 *
 * The component registry maps sectionType to render functions:
 * - stories -> StoryCarousel
 * - banner -> BannerCarousel
 * - deal_section -> DealCarousel
 * - collection -> ProductCard horizontal scroll
 * - products -> ProductCard horizontal scroll or grid
 * - categories -> CategoryGrid
 * - brands -> BrandCard horizontal scroll
 * - recipes -> RecipeCard horizontal scroll
 * - recipe_categories -> RecipeCategoryCard horizontal scroll
 * - recipe_tags -> RecipeTagChip chips or cuisine grid
 *
 * @param props.section - The section data from the API
 * @param props.onProductPress - Callback when a product is pressed
 * @param props.onCategoryPress - Callback when a category is pressed
 * @param props.onSeeAll - Callback when "See All" is pressed
 * @param props.favorites - Map of product IDs to favorite status
 * @param props.getItemQuantity - Function to get cart quantity for a product
 * @param props.onFavoriteToggle - Callback to toggle favorite status
 * @param props.onAddToCart - Callback to add product to cart
 * @param props.onQuantityChange - Callback to change cart quantity
 */
export function SectionRenderer(props: SectionRendererProps): React.ReactNode {
  return renderSection(props.section, props);
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Export types
export type { SectionRendererProps } from './types';

// Export SDUI utilities for advanced usage
export { ComponentRegistry, registerComponent, hasComponent } from './sdui/registry';
export { SDUIActions, getSeeAllUrl, buildActionFromSection } from './sdui/actions';
export { SDUILayout, getLayoutConfig, getCategoryGridSize } from './sdui/layout';

export default SectionRenderer;
