/**
 * SDUI Renderers Index
 *
 * Registers all section type renderers with the component registry.
 * Import this file to initialize the registry with all available components.
 */

import { registerComponent } from '../registry';

// Import all renderers
import { renderStories } from './stories';
import { renderBanners } from './banners';
import { renderDeals } from './deals';
import { renderProducts } from './products';
import { renderCategories } from './categories';
import { renderBrands } from './brands';
import { renderRecipes } from './recipes';
import { renderRecipeCategories } from './recipe-categories';
import { renderRecipeTags } from './recipe-tags';

// =============================================================================
// REGISTER ALL COMPONENTS
// =============================================================================

/**
 * Initialize the component registry with all section type renderers.
 * Call this once at app startup.
 */
export function initializeRegistry(): void {
  // Stories (Instagram-style)
  registerComponent('stories', {
    component: renderStories,
  });

  // Banners (promotional carousel)
  registerComponent('banner', {
    component: renderBanners,
  });

  // Deals (products with discounts + countdown)
  registerComponent('deal_section', {
    component: renderDeals,
    fallback: 'products', // Fall back to regular products if deals fail
  });

  // Products (horizontal scroll or grid)
  registerComponent('products', {
    component: renderProducts,
  });

  // Collections (curated products - same as products)
  registerComponent('collection', {
    component: renderProducts,
  });

  // Categories (grid layout)
  registerComponent('categories', {
    component: renderCategories,
  });

  // Brands
  registerComponent('brands', {
    component: renderBrands,
  });

  // Recipes
  registerComponent('recipes', {
    component: renderRecipes,
  });

  // Recipe categories (meal types)
  registerComponent('recipe_categories', {
    component: renderRecipeCategories,
  });

  // Recipe tags (dietary, cuisine, style)
  registerComponent('recipe_tags', {
    component: renderRecipeTags,
  });
}

// Auto-initialize on import
initializeRegistry();

// =============================================================================
// EXPORTS
// =============================================================================

export { renderStories } from './stories';
export { renderBanners } from './banners';
export { renderDeals } from './deals';
export { renderProducts } from './products';
export { renderCategories } from './categories';
export { renderBrands } from './brands';
export { renderRecipes } from './recipes';
export { renderRecipeCategories } from './recipe-categories';
export { renderRecipeTags } from './recipe-tags';
