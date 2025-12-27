/**
 * SDUI Action Handling
 *
 * Handles "See All" and other navigation actions from sections.
 * The backend can send either:
 * 1. A static link: "/category/fruits"
 * 2. A dynamic action: { route: "ProductList", params: { filter: "deals" } }
 *
 * This module normalizes both into executable navigation.
 */

import type { Section } from '@thriptify/api-types';

// =============================================================================
// TYPES
// =============================================================================

export interface SDUIAction {
  /** Route name (maps to Expo Router path) */
  route: string;
  /** Query parameters to pass to the route */
  params?: Record<string, string | number | boolean>;
}

export interface ParsedAction {
  /** The final URL path to navigate to */
  path: string;
  /** Query string (if any params) */
  queryString?: string;
  /** Full URL with query string */
  fullUrl: string;
}

// =============================================================================
// ROUTE MAPPINGS
// =============================================================================

/**
 * Maps logical route names to Expo Router paths
 */
const ROUTE_MAP: Record<string, string> = {
  // Product routes
  ProductList: '/search',
  ProductDetail: '/product',

  // Category routes
  CategoryList: '/categories',
  CategoryDetail: '/category',

  // Deal routes
  DealList: '/deals',
  DealDetail: '/deals',

  // Recipe routes
  RecipeList: '/recipes',
  RecipeDetail: '/recipes',
  RecipeCuisine: '/recipes/cuisine',

  // Collection routes
  Collection: '/collection',

  // Brand routes
  BrandList: '/brands',
  BrandDetail: '/brand',
};

// =============================================================================
// ACTION BUILDERS
// =============================================================================

/**
 * Build action params based on section type and context
 * This is where we add dynamic params based on section data
 *
 * Note: The frontend Section type only has viewAllLink (not referenceSlug/referenceId).
 * The backend computes viewAllLink from referenceSlug. If viewAllLink is null,
 * we fall back to a generic route based on sectionType.
 */
export function buildActionFromSection(section: Section): SDUIAction | null {
  const { sectionType, viewAllLink } = section;

  // If viewAllLink is already a full path, parse it
  if (viewAllLink) {
    return parseStaticLink(viewAllLink);
  }

  // Build dynamic action based on section type (fallback when no viewAllLink)
  switch (sectionType) {
    case 'deal_section':
      return {
        route: 'ProductList',
        params: {
          filter: 'deals',
          sort: 'discount_desc',
        },
      };

    case 'collection':
    case 'products':
      return {
        route: 'ProductList',
        params: {},
      };

    case 'categories':
      return {
        route: 'CategoryList',
        params: {},
      };

    case 'brands':
      return {
        route: 'BrandList',
        params: {},
      };

    case 'recipes':
      return {
        route: 'RecipeList',
        params: {},
      };

    case 'recipe_categories':
      return {
        route: 'RecipeList',
        params: {},
      };

    case 'recipe_tags':
      return {
        route: 'RecipeList',
        params: {},
      };

    default:
      return null;
  }
}

/**
 * Parse a static link into an SDUIAction
 * e.g., "/category/fruits?sort=name" -> { route: "CategoryDetail", params: { id: "fruits", sort: "name" } }
 */
function parseStaticLink(link: string): SDUIAction {
  // Handle external URLs
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return { route: 'External', params: { url: link } };
  }

  // Parse the path and query string
  const [path, queryString] = link.split('?');
  const segments = path.split('/').filter(Boolean);

  // Parse query params
  const params: Record<string, string> = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  // Map common paths to logical routes
  if (segments[0] === 'category' && segments[1]) {
    return { route: 'CategoryDetail', params: { id: segments[1], ...params } };
  }
  if (segments[0] === 'product' && segments[1]) {
    return { route: 'ProductDetail', params: { id: segments[1], ...params } };
  }
  if (segments[0] === 'recipes') {
    if (segments[1] === 'cuisine' && segments[2]) {
      return { route: 'RecipeCuisine', params: { slug: segments[2], ...params } };
    }
    if (segments[1]) {
      return { route: 'RecipeDetail', params: { id: segments[1], ...params } };
    }
    return { route: 'RecipeList', params };
  }
  if (segments[0] === 'collection' && segments[1]) {
    return { route: 'Collection', params: { slug: segments[1], ...params } };
  }
  if (segments[0] === 'deals') {
    return { route: 'DealList', params: { slug: segments[1] || 'all', ...params } };
  }
  if (segments[0] === 'search') {
    return { route: 'ProductList', params };
  }
  if (segments[0] === 'categories') {
    return { route: 'CategoryList', params };
  }
  if (segments[0] === 'brands') {
    if (segments[1]) {
      return { route: 'BrandDetail', params: { id: segments[1], ...params } };
    }
    return { route: 'BrandList', params };
  }

  // Fallback: return the path as-is
  return { route: 'Raw', params: { path: link } };
}

// =============================================================================
// ACTION EXECUTION
// =============================================================================

/**
 * Convert an SDUIAction to a navigable URL
 */
export function actionToUrl(action: SDUIAction): ParsedAction {
  const { route, params = {} } = action;

  // Handle raw paths
  if (route === 'Raw' && params.path) {
    return {
      path: params.path as string,
      fullUrl: params.path as string,
    };
  }

  // Handle external URLs
  if (route === 'External' && params.url) {
    return {
      path: params.url as string,
      fullUrl: params.url as string,
    };
  }

  // Get the base path from route map
  let basePath = ROUTE_MAP[route] || `/${route.toLowerCase()}`;

  // Handle routes with ID in path
  if (params.id && ['ProductDetail', 'CategoryDetail', 'RecipeDetail', 'BrandDetail'].includes(route)) {
    basePath = `${basePath}/${params.id}`;
    delete params.id;
  }
  if (params.slug && ['RecipeCuisine', 'Collection'].includes(route)) {
    basePath = `${basePath}/${params.slug}`;
    delete params.slug;
  }

  // Build query string from remaining params
  const remainingParams = Object.entries(params).filter(([_, v]) => v !== undefined && v !== '');
  const queryString = remainingParams.length > 0
    ? remainingParams.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : undefined;

  return {
    path: basePath,
    queryString,
    fullUrl: queryString ? `${basePath}?${queryString}` : basePath,
  };
}

/**
 * Get the navigation URL for a section's "See All" action
 */
export function getSeeAllUrl(section: Section): string | null {
  // First try the static viewAllLink
  if (section.viewAllLink) {
    return section.viewAllLink;
  }

  // Build dynamic action
  const action = buildActionFromSection(section);
  if (!action) return null;

  return actionToUrl(action).fullUrl;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const SDUIActions = {
  buildFromSection: buildActionFromSection,
  parseLink: parseStaticLink,
  toUrl: actionToUrl,
  getSeeAllUrl,
};

export default SDUIActions;
