import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppAuth } from '@/contexts/auth-context';
import { ENDPOINTS } from '@thriptify/api-types';
import type { CategoryWithChildren, Product } from '@thriptify/api-types';

// API base URL - public endpoints don't require auth
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Extended product type from API response
interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  unit: string;
  unitSize: string | null;
  imageUrl: string | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  } | null;
  dietaryTags: string[];
  inStock: boolean;
  stockQuantity?: number;
}

interface ProductDetail extends ProductListItem {
  sku: string;
  barcode: string | null;
  description: string | null;
  shortDescription: string | null;
  isActive: boolean;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: Array<{
    id: string;
    url: string;
    cdnUrl: string | null;
    altText: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    color: string | null;
  }>;
  breadcrumbs: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  attributes: Record<string, unknown>;
  nutritionInfo: unknown | null;
}

interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  childCount: number;
  parent: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    productCount: number;
  }>;
}

interface CategoryProductsResponse {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    breadcrumbs: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    productCount: number;
  }>;
  products: ProductListItem[];
  pagination: PaginationInfo;
}

// ============================================================================
// GENERIC FETCH HELPER
// ============================================================================

async function apiFetch<T>(endpoint: string, token?: string | null): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    // Only log unexpected errors in dev mode (not 404s which are often expected)
    if (__DEV__ && response.status !== 404) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[API] ${response.status} ${endpoint}:`, errorText.substring(0, 100));
    }
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// ============================================================================
// CATEGORIES HOOKS
// ============================================================================

/**
 * Fetch category tree (all categories with nested children)
 */
export function useCategories(): ApiResponse<CategoryWithChildren[]> & { refetch: () => void } {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<CategoryWithChildren[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get token if authenticated (for rate limiting)
      let token: string | null = null;
      if (isAuthenticated) {
        try {
          token = await getTokenRef.current();
        } catch {
          // Ignore token errors, proceed without auth
        }
      }

      const response = await apiFetch<{ categories: CategoryWithChildren[] }>(ENDPOINTS.categories.list, token);
      setData(response.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// Helper to detect if a string is a UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Fetch single category by ID or slug with children
 * Automatically detects if the identifier is a UUID (uses byId) or slug (uses bySlug)
 */
export function useCategory(categoryIdOrSlug: string | undefined): ApiResponse<CategoryDetail> & { refetch: () => void } {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<CategoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    if (!categoryIdOrSlug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get token if authenticated (for rate limiting)
      let token: string | null = null;
      if (isAuthenticated) {
        try {
          token = await getTokenRef.current();
        } catch {
          // Ignore token errors, proceed without auth
        }
      }

      // Use byId for UUIDs, bySlug for slugs
      const endpoint = isUUID(categoryIdOrSlug)
        ? ENDPOINTS.categories.byId(categoryIdOrSlug)
        : ENDPOINTS.categories.bySlug(categoryIdOrSlug);

      const response = await apiFetch<{ category: CategoryDetail }>(endpoint, token);
      setData(response.category);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [categoryIdOrSlug, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Fetch products for a category with pagination
 */
export function useCategoryProducts(
  categoryId: string | undefined,
  options?: {
    page?: number;
    limit?: number;
    sort?: 'name' | 'price' | 'newest' | 'popular';
    includeDescendants?: boolean;
  }
): ApiResponse<CategoryProductsResponse> & { refetch: () => void } {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<CategoryProductsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    if (!categoryId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get token if authenticated (for rate limiting)
      let token: string | null = null;
      if (isAuthenticated) {
        try {
          token = await getTokenRef.current();
        } catch {
          // Ignore token errors, proceed without auth
        }
      }

      const params = new URLSearchParams();
      if (options?.page) params.append('page', String(options.page));
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.sort) params.append('sort', options.sort);
      if (options?.includeDescendants) params.append('includeDescendants', 'true');

      const queryString = params.toString();
      const endpoint = `${ENDPOINTS.categories.products(categoryId)}${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch<CategoryProductsResponse>(endpoint, token);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, options?.page, options?.limit, options?.sort, options?.includeDescendants, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ============================================================================
// PRODUCTS HOOKS
// ============================================================================

interface ProductQueryOptions {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  sort?: 'name' | 'price_asc' | 'price_desc' | 'newest';
  inStock?: boolean;
}

/**
 * Fetch products with optional filters
 */
export function useProducts(
  options?: ProductQueryOptions
): ApiResponse<{ products: ProductListItem[]; pagination: PaginationInfo }> & { refetch: () => void } {
  const [data, setData] = useState<{ products: ProductListItem[]; pagination: PaginationInfo } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', String(options.page));
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.categoryId) params.append('categoryId', options.categoryId);
      if (options?.brandId) params.append('brandId', options.brandId);
      if (options?.search) params.append('search', options.search);
      if (options?.minPrice) params.append('minPrice', String(options.minPrice));
      if (options?.maxPrice) params.append('maxPrice', String(options.maxPrice));
      if (options?.tags) params.append('tags', options.tags);
      if (options?.sort) params.append('sort', options.sort);
      if (options?.inStock !== undefined) params.append('inStock', String(options.inStock));

      const queryString = params.toString();
      const endpoint = `${ENDPOINTS.products.list}${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch<{ products: ProductListItem[]; pagination: PaginationInfo }>(endpoint);
      setData(response);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    options?.page,
    options?.limit,
    options?.categoryId,
    options?.brandId,
    options?.search,
    options?.minPrice,
    options?.maxPrice,
    options?.tags,
    options?.sort,
    options?.inStock,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Fetch featured/bestseller products
 */
export function useFeaturedProducts(
  limit: number = 12
): ApiResponse<ProductListItem[]> & { refetch: () => void } {
  const [data, setData] = useState<ProductListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = `${ENDPOINTS.products.list}?limit=${limit}&sort=newest`;
      const response = await apiFetch<{ products: ProductListItem[] }>(endpoint);
      setData(response.products);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Fetch single product by ID
 */
export function useProduct(productId: string | undefined): ApiResponse<ProductDetail> & { refetch: () => void } {
  const [data, setData] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ product: ProductDetail }>(ENDPOINTS.products.byId(productId));
      setData(response.product);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Search products
 */
export function useProductSearch(
  query: string,
  limit: number = 20
): ApiResponse<ProductListItem[]> & { refetch: () => void } {
  const [data, setData] = useState<ProductListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!query || query.length < 1) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = `${ENDPOINTS.products.search}?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await apiFetch<{ products: ProductListItem[] }>(endpoint);
      setData(response.products);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to search products');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [query, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ============================================================================
// STORIES HOOKS
// ============================================================================

// API Story types (from backend)
interface ApiStoryItem {
  id: string;
  type: string; // "image" | "video"
  mediaUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  linkType: string | null; // "product" | "category" | "collection" | "deal" | "recipe" | "url"
  linkId: string | null;
  linkText: string | null;
  sortOrder: number;
  isViewed: boolean;
}

interface ApiStory {
  id: string;
  title: string;
  thumbnailUrl: string;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  hasUnviewed: boolean;
  items: ApiStoryItem[];
}

// UI Story types (for StoryCarousel component)
export interface StorySlide {
  id: string;
  image: string;
  caption?: string;
  link?: {
    text: string;
    url: string;
  };
}

export interface StoryItem {
  id: string;
  title: string;
  image: string;
  isNew?: boolean;
  gradientColors?: [string, string];
  slides?: StorySlide[];
}

/**
 * Build URL from linkType and linkId
 */
function buildLinkUrl(linkType: string | null, linkId: string | null): string {
  if (!linkType || !linkId) return '/';

  switch (linkType) {
    case 'product':
      return `/product/${linkId}`;
    case 'category':
      return `/category/${linkId}`;
    case 'collection':
      return `/collection/${linkId}`;
    case 'deal':
      return `/deals/${linkId}`;
    case 'recipe':
      return `/recipes/${linkId}`;
    case 'url':
      return linkId; // linkId contains the actual URL
    default:
      return '/';
  }
}

/**
 * Transform API story to UI story format
 */
function transformApiStoryToUiStory(apiStory: ApiStory): StoryItem {
  return {
    id: apiStory.id,
    title: apiStory.title,
    image: apiStory.thumbnailUrl,
    isNew: apiStory.hasUnviewed,
    slides: apiStory.items.map((item) => ({
      id: item.id,
      image: item.mediaUrl,
      caption: item.linkText || undefined,
      link: item.linkType && item.linkId ? {
        text: item.linkText || 'Shop Now',
        url: buildLinkUrl(item.linkType, item.linkId),
      } : undefined,
    })),
  };
}

/**
 * Fetch stories from API
 */
export function useStories(): ApiResponse<StoryItem[]> & { refetch: () => void } {
  const [data, setData] = useState<StoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ stories: ApiStory[] }>(ENDPOINTS.content.stories);
      const transformedStories = response.stories.map(transformApiStoryToUiStory);
      setData(transformedStories);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch stories');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ============================================================================
// FAVORITES HOOKS (Requires Auth)
// ============================================================================

interface FavoriteProduct {
  id: string;
  productId: string;
  createdAt: string;
  product: ProductListItem;
}

/**
 * Fetch with auth token
 */
async function apiFetchWithAuth<T>(endpoint: string, token: string | null, options?: RequestInit): Promise<T> {
  if (!token) {
    throw new Error('Authentication required');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');

    // Only log unexpected errors in dev mode
    if (__DEV__ && response.status !== 404) {
      console.warn(`[API] ${response.status} ${endpoint}:`, errorText.substring(0, 100));
    }

    // Try to parse the error response for a user-friendly message
    let message = `API Error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      message = errorJson.error?.message || errorJson.message || message;
    } catch {
      // Keep the default message if parsing fails
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data;
}

/**
 * Fetch user's favorites (requires auth)
 */
export function useFavorites(token: string | null): ApiResponse<FavoriteProduct[]> & { refetch: () => void } {
  const [data, setData] = useState<FavoriteProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) {
      setData(null);
      setIsLoading(false);
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetchWithAuth<{ favorites: FavoriteProduct[] }>(
        ENDPOINTS.customer.favorites.list,
        token
      );
      setData(response.favorites);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Toggle favorite (add/remove) - requires auth
 */
export async function toggleFavorite(productId: string, token: string | null): Promise<{ isFavorite: boolean }> {
  return apiFetchWithAuth<{ isFavorite: boolean }>(
    ENDPOINTS.customer.favorites.toggle(productId),
    token,
    { method: 'POST' }
  );
}

// ============================================================================
// TABS HOOKS
// ============================================================================

// Tab types from API
export interface TabPage {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
  isDefault: boolean;
  categoryId: string | null;
}

export interface TabSectionItem {
  // Common item fields - actual structure depends on sectionType
  id: string;
  name?: string;
  title?: string;
  imageUrl?: string | null;
  [key: string]: unknown;
}

export interface TabSection {
  id: string;
  title: string;
  subtitle: string | null;
  icon: string | null;
  sectionType: string;
  displayType: string;
  showViewAll: boolean;
  viewAllLink: string | null;
  backgroundColor: string | null;
  endsAt?: string | null;
  showCountdown?: boolean;
  items: TabSectionItem[];
}

// API returns page with sections in a flat structure
export interface PageWithSections {
  id: string;
  pageType: string;
  slug: string;
  title: string;
  icon: string | null;
  description: string | null;
  backgroundColor: string | null;
  categoryId: string | null;
  isDefault: boolean;
  sections: TabSection[];
}

// Adapted response for backward compatibility
export interface TabSectionsResponse {
  tab: TabPage;
  sections: TabSection[];
}

// Page/Tab endpoints - defined inline to avoid issues with package linking
const TAB_ENDPOINTS = {
  list: '/api/v1/pages/tabs',
  sections: (slug: string) => `/api/v1/pages/tabs/${slug}/sections`,
};

/**
 * Fetch all active tabs
 */
export function useTabs(): ApiResponse<TabPage[]> & { refetch: () => void } {
  const [data, setData] = useState<TabPage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ data: TabPage[] }>(TAB_ENDPOINTS.list);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tabs');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Fetch sections for a specific tab
 */
export function useTabSections(
  slug: string | undefined
): ApiResponse<TabSectionsResponse> & { refetch: () => void } {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<TabSectionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use ref for getToken to avoid re-renders
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Track if this is initial load vs refetch
  const hasLoadedRef = useRef(false);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    // Only show loading on initial load, not refetch (prevents flashing)
    if (!isRefetch) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Get token if signed in (for personalized content like story views)
      let token: string | null = null;
      if (isAuthenticated) {
        try {
          token = await getTokenRef.current();
        } catch {
          // Ignore token errors, proceed without auth
        }
      }

      // API returns PageWithSections, transform to TabSectionsResponse for compatibility
      const response = await apiFetch<{ data: PageWithSections }>(TAB_ENDPOINTS.sections(slug), token);
      const pageData = response.data;

      // Transform to expected format
      const tabSectionsData: TabSectionsResponse = {
        tab: {
          id: pageData.id,
          slug: pageData.slug,
          title: pageData.title,
          icon: pageData.icon,
          isDefault: pageData.isDefault,
          categoryId: pageData.categoryId,
        },
        sections: pageData.sections,
      };
      setData(tabSectionsData);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tab sections');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug, isAuthenticated]);

  // Initial load when slug or auth changes
  useEffect(() => {
    hasLoadedRef.current = false;
    fetchData(false);
  }, [fetchData]);

  // Refetch function that doesn't show loading
  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { data, error, isLoading, refetch };
}

// ============================================================================
// RECIPES HOOKS
// ============================================================================

// Recipe types from API
interface RecipeTag {
  id: string;
  name: string;
  slug: string;
  type: string;
  color: string | null;
}

interface RecipeCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string | null;
  preparation: string | null;
  isOptional: boolean;
  substituteNotes: string | null;
  sortOrder: number;
  preferredProductId: string | null;
  preferredProduct?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  } | null;
}

interface RecipeStep {
  id: string;
  stepNumber: number;
  title: string | null;
  instruction: string;
  imageUrl: string | null;
  duration: number | null;
  tip: string | null;
}

interface RecipeListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  prepTime: number;
  cookTime: number;
  totalTime?: number;
  servings: number;
  difficulty: string;
  cuisine: string | null;
  dietaryTags?: string[];
  calories: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  isBookmarked?: boolean;
  category?: RecipeCategory | null;
  tags?: RecipeTag[];
  // Full recipe detail fields
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
}

interface RecipeQueryOptions {
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  productSlug?: string; // Filter by product/ingredient
  difficulty?: 'easy' | 'medium' | 'hard';
  maxTime?: number;
  search?: string;
  featured?: boolean;
}

// Recipe endpoints - defined inline
const RECIPE_ENDPOINTS = {
  list: '/api/v1/content/recipes',
  categories: '/api/v1/content/recipes/categories',
  byId: (id: string) => `/api/v1/content/recipes/${id}`,
  bySlug: (slug: string) => `/api/v1/content/recipes/slug/${slug}`,
  shoppable: (id: string) => `/api/v1/content/recipes/${id}/shop`,
};

// Shoppable recipe types (for Add to Cart flow)
interface ShoppableProductOption {
  id: string;
  name: string;
  slug: string;
  price: number;
  unitSize: string | null;
  sortWeight: number | null;
  imageUrl: string | null;
  brandId: string | null;
  brandName: string | null;
  inStock: boolean;
  quantity: number;
}

interface SizeGroup {
  label: string;
  sortWeight: number;
  products: ShoppableProductOption[];
}

interface ShoppableIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string | null;
  preparation: string | null;
  isOptional: boolean;
  substituteNotes: string | null;
  ingredientId: string | null;
  ingredientName: string | null;
  selectedProduct: ShoppableProductOption | null;
  sizeGroups: SizeGroup[];
  totalProducts: number;
}

interface ShoppableRecipe {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  servings: number;
  ingredients: ShoppableIngredient[];
  summary: {
    totalItems: number;
    itemsWithProducts: number;
    estimatedTotal: number;
  };
}

interface RecipesResponse {
  recipes: RecipeListItem[];
  pagination: PaginationInfo;
  productName?: string; // Name of the product when filtering by ingredient
}

/**
 * Fetch recipes with optional filters
 */
export function useRecipes(
  options?: RecipeQueryOptions
): ApiResponse<RecipesResponse> & { refetch: () => void } {
  const [data, setData] = useState<RecipesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', String(options.page));
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.categorySlug) params.append('categorySlug', options.categorySlug);
      if (options?.tagSlug) params.append('tagSlug', options.tagSlug);
      if (options?.productSlug) params.append('productSlug', options.productSlug);
      if (options?.difficulty) params.append('difficulty', options.difficulty);
      if (options?.maxTime) params.append('maxTime', String(options.maxTime));
      if (options?.search) params.append('search', options.search);
      if (options?.featured !== undefined) params.append('featured', String(options.featured));

      const queryString = params.toString();
      const endpoint = `${RECIPE_ENDPOINTS.list}${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch<RecipesResponse>(endpoint);
      setData(response);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    options?.page,
    options?.limit,
    options?.categorySlug,
    options?.tagSlug,
    options?.productSlug,
    options?.difficulty,
    options?.maxTime,
    options?.search,
    options?.featured,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Fetch all recipe categories (meal types)
 */
export function useRecipeCategories(): ApiResponse<RecipeCategory[]> & { refetch: () => void } {
  const [data, setData] = useState<RecipeCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ categories: RecipeCategory[] }>(RECIPE_ENDPOINTS.categories);
      setData(response.categories);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch recipe categories');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Fetch single recipe by ID
 */
export function useRecipe(recipeId: string | undefined): ApiResponse<RecipeListItem> & { refetch: () => void } {
  const [data, setData] = useState<RecipeListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!recipeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ recipe: RecipeListItem }>(RECIPE_ENDPOINTS.byId(recipeId));
      setData(response.recipe);
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to fetch recipe');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Fetch shoppable recipe by ID (includes ingredients with product options for Add to Cart)
 */
export function useShoppableRecipe(
  recipeId: string | undefined,
  options?: { storeId?: string }
): ApiResponse<ShoppableRecipe> & { refetch: () => void } {
  const [data, setData] = useState<ShoppableRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!recipeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let endpoint = RECIPE_ENDPOINTS.shoppable(recipeId);
      if (options?.storeId) {
        endpoint += `?storeId=${options.storeId}`;
      }
      const response = await apiFetch<{ recipe: ShoppableRecipe }>(endpoint);
      setData(response.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shoppable recipe');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId, options?.storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ============================================================================
// RECIPE HOME (Consolidated endpoint for performance)
// ============================================================================

interface RecipeCuisine {
  slug: string;
  name: string;
  imageUrl: string;
  recipeCount: number;
}

interface RecipeHomeSection {
  type: 'trending' | 'new' | 'quick' | 'featured' | 'seasonal';
  title: string;
  icon?: string;
  recipes: RecipeListItem[];
}

interface RecipeHomeResponse {
  cuisines: RecipeCuisine[];
  categories: RecipeCategory[];
  sections: RecipeHomeSection[];
}

/**
 * Fetch consolidated recipe home data (cuisines, categories, sections) in a single request
 * This is optimized for performance - use this instead of multiple separate API calls
 */
export function useRecipeHome(): ApiResponse<RecipeHomeResponse> & { refetch: () => void } {
  const [data, setData] = useState<RecipeHomeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<RecipeHomeResponse>('/api/v1/content/recipes/home');
      setData(response);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch recipe home data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

interface RecipesByCuisineOptions {
  categorySlug?: string;
  page?: number;
  limit?: number;
}

interface RecipesByCuisineResponse {
  cuisineName: string;
  recipes: RecipeListItem[];
  pagination: PaginationInfo;
}

/**
 * Fetch recipes by cuisine with optional meal type (category) filter
 */
export function useRecipesByCuisine(
  cuisineSlug: string | undefined,
  options?: RecipesByCuisineOptions
): ApiResponse<RecipesByCuisineResponse> & { refetch: () => void } {
  const [data, setData] = useState<RecipesByCuisineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!cuisineSlug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.categorySlug) params.append('categorySlug', options.categorySlug);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());

      const queryString = params.toString();
      const endpoint = `/api/v1/content/recipes/cuisine/${cuisineSlug}${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch<RecipesByCuisineResponse>(endpoint);
      setData(response);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes by cuisine');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [cuisineSlug, options?.categorySlug, options?.page, options?.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ============================================================================
// ADDRESSES HOOKS (Requires Auth)
// ============================================================================

interface Address {
  id: string;
  label: string;
  recipientName: string | null;
  recipientPhone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  deliveryInstructions: string | null;
  accessCode: string | null;
  isResidential: boolean;
  isValidated: boolean;
  isDefault: boolean;
  servicingStoreId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateAddressInput {
  label?: string;
  recipientName?: string;
  recipientPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  deliveryInstructions?: string;
  accessCode?: string;
  isResidential?: boolean;
  isDefault?: boolean;
}

// Address endpoints
const ADDRESS_ENDPOINTS = {
  list: '/api/v1/customer/addresses',
  byId: (id: string) => `/api/v1/customer/addresses/${id}`,
  setDefault: (id: string) => `/api/v1/customer/addresses/${id}/set-default`,
};

/**
 * Fetch user's addresses (requires auth)
 */
export function useAddresses(): ApiResponse<Address[]> & {
  refetch: () => void;
  createAddress: (data: CreateAddressInput) => Promise<Address>;
  updateAddress: (id: string, data: Partial<CreateAddressInput>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<Address>;
} {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<Address[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setData(null);
      setIsLoading(false);
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();
      const response = await apiFetchWithAuth<{ addresses: Address[] }>(
        ADDRESS_ENDPOINTS.list,
        token
      );
      setData(response.addresses);
    } catch (err) {
      // 404 means no addresses exist yet - return empty array
      const message = err instanceof Error ? err.message : '';
      if (message.includes('404')) {
        setData([]);
        setError(null);
      } else {
        setError(message || 'Failed to fetch addresses');
        setData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createAddress = useCallback(async (input: CreateAddressInput): Promise<Address> => {
    const token = await getTokenRef.current();
    const response = await apiFetchWithAuth<{ address: Address }>(
      ADDRESS_ENDPOINTS.list,
      token,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
    // Refresh list after creating
    fetchData();
    return response.address;
  }, [fetchData]);

  const updateAddress = useCallback(async (id: string, input: Partial<CreateAddressInput>): Promise<Address> => {
    const token = await getTokenRef.current();
    const response = await apiFetchWithAuth<{ address: Address }>(
      ADDRESS_ENDPOINTS.byId(id),
      token,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    );
    // Refresh list after updating
    fetchData();
    return response.address;
  }, [fetchData]);

  const deleteAddress = useCallback(async (id: string): Promise<void> => {
    const token = await getTokenRef.current();
    await apiFetchWithAuth<{ success: boolean }>(
      ADDRESS_ENDPOINTS.byId(id),
      token,
      { method: 'DELETE' }
    );
    // Refresh list after deleting
    fetchData();
  }, [fetchData]);

  const setDefaultAddress = useCallback(async (id: string): Promise<Address> => {
    const token = await getTokenRef.current();
    const response = await apiFetchWithAuth<{ address: Address }>(
      ADDRESS_ENDPOINTS.setDefault(id),
      token,
      { method: 'POST' }
    );
    // Refresh list after setting default
    fetchData();
    return response.address;
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    refetch: fetchData,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}

// ============================================================================
// ORDERS HOOKS (Requires Auth)
// ============================================================================

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'picking' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  discount: number;
  total: number;
  itemCount: number;
  items: OrderItem[];
  deliveryAddress: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
  };
  deliverySlot: {
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// Order endpoints
const ORDER_ENDPOINTS = {
  list: '/api/v1/orders',
  byId: (id: string) => `/api/v1/orders/${id}`,
};

/**
 * Fetch user's orders (requires auth)
 */
export function useOrders(options?: {
  status?: string;
  page?: number;
  limit?: number;
}): ApiResponse<{ orders: Order[]; pagination: PaginationInfo }> & { refetch: () => void } {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<{ orders: Order[]; pagination: PaginationInfo } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setData(null);
      setIsLoading(false);
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();

      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.page) params.append('page', String(options.page));
      if (options?.limit) params.append('limit', String(options.limit));

      const queryString = params.toString();
      const endpoint = `${ORDER_ENDPOINTS.list}${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetchWithAuth<{ orders: Order[]; pagination: PaginationInfo }>(
        endpoint,
        token
      );
      setData(response);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, options?.status, options?.page, options?.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

/**
 * Fetch single order by ID (requires auth)
 */
export function useOrder(orderId: string | undefined): ApiResponse<Order> & { refetch: () => void } {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    if (!orderId || !isAuthenticated) {
      setData(null);
      setIsLoading(false);
      if (!isAuthenticated) setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();
      const response = await apiFetchWithAuth<{ order: Order }>(
        ORDER_ENDPOINTS.byId(orderId),
        token
      );
      setData(response.order);
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ============================================================================
// CHECKOUT TYPES AND HOOKS
// ============================================================================

interface DeliverySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  isPremium: boolean;
  premiumFee: number;
}

interface CheckoutSession {
  id: string;
  customerId: string;
  addressId: string | null;
  deliverySlotId: string | null;
  paymentMethodId: string | null;
  tipAmount: number;
  promoCode: string | null;
  specialInstructions: string | null;
  addresses: Array<{
    id: string;
    label: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  }>;
  deliverySlots: DeliverySlot[];
  cart: {
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      productImage: string | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
    itemCount: number;
    subtotal: number;
  };
  summary: {
    subtotal: number;
    deliveryFee: number;
    handlingFee: number;
    tax: number;
    tip: number;
    discount: number;
    total: number;
  };
}

interface PlaceOrderResult {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
  };
  paymentStatus: string;
  clientSecret: string | null;
  requiresAction: boolean;
}

/**
 * Hook to manage checkout session
 */
export function useCheckout() {
  const { getToken, isAuthenticated } = useAppAuth();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Create checkout session
  const createSession = useCallback(async (cartItems: Array<{ productId: string; quantity: number }>) => {
    if (!isAuthenticated) {
      setError('Please sign in to checkout');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();
      const response = await fetch(`${API_BASE_URL}/api/v1/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      setSession(data.session);
      return data.session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Update session (address, delivery slot, payment, etc.)
  const updateSession = useCallback(async (
    sessionId: string,
    updates: {
      addressId?: string;
      deliverySlotId?: string;
      paymentMethodId?: string;
      tipAmount?: number;
      promoCode?: string;
      specialInstructions?: string;
    }
  ) => {
    if (!isAuthenticated) return null;

    setIsLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();
      const response = await fetch(`${API_BASE_URL}/api/v1/checkout/session/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to update session');
      }

      const data = await response.json();
      setSession(data.session);
      return data.session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update session';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Place order
  const placeOrder = useCallback(async (sessionId: string): Promise<PlaceOrderResult | null> => {
    if (!isAuthenticated) {
      setError('Please sign in to place order');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();
      const response = await fetch(`${API_BASE_URL}/api/v1/checkout/session/${sessionId}/place-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          acceptTerms: true,
          idempotencyKey: `order_${sessionId}_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to place order');
      }

      const data = await response.json();
      return {
        order: data.order,
        paymentStatus: data.paymentStatus,
        clientSecret: data.clientSecret || null,
        requiresAction: data.requiresAction || false,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Clear session
  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return {
    session,
    isLoading,
    error,
    createSession,
    updateSession,
    placeOrder,
    clearSession,
  };
}

/**
 * Hook to fetch delivery slots
 */
export function useDeliverySlots(storeId?: string): ApiResponse<DeliverySlot[]> & { refetch: () => void } {
  const [data, setData] = useState<DeliverySlot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Delivery slots require storeId - use default store if not provided
      const effectiveStoreId = storeId || 'd49e79c1-2b62-4f43-b8a2-cfb393d4ac20'; // KC Hub Store
      const url = `${API_BASE_URL}/api/v1/delivery/slots?storeId=${effectiveStoreId}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch delivery slots');
      }

      const result = await response.json();
      setData(result.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch delivery slots');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ============================================================================
// PAYMENT METHODS HOOKS (Requires Auth)
// ============================================================================

interface PaymentMethod {
  id: string;
  type: string;
  cardBrand: string | null;
  cardLastFour: string | null;
  cardExpMonth: number | null;
  cardExpYear: number | null;
  isDefault: boolean;
}

// Payment endpoints (mounted at /api/v1/payments in API)
const PAYMENT_ENDPOINTS = {
  list: '/api/v1/payments/payment-methods',
  setupIntent: '/api/v1/payments/payment-methods/setup-intent',
  save: '/api/v1/payments/payment-methods',
  setDefault: '/api/v1/payments/payment-methods/default',
  delete: (id: string) => `/api/v1/payments/payment-methods/${id}`,
};

/**
 * Fetch user's saved payment methods (requires auth)
 */
export function usePaymentMethods(): ApiResponse<PaymentMethod[]> & {
  refetch: () => void;
  createSetupIntent: () => Promise<{ clientSecret: string; setupIntentId: string } | null>;
  savePaymentMethod: (stripePaymentMethodId: string, setAsDefault?: boolean) => Promise<PaymentMethod | null>;
  setDefault: (paymentMethodId: string) => Promise<void>;
  deletePaymentMethod: (paymentMethodId: string) => Promise<void>;
} {
  const { getToken, isAuthenticated } = useAppAuth();
  const [data, setData] = useState<PaymentMethod[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setData(null);
      setIsLoading(false);
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();
      const response = await apiFetchWithAuth<{ paymentMethods: PaymentMethod[] }>(
        PAYMENT_ENDPOINTS.list,
        token
      );
      setData(response.paymentMethods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create SetupIntent for adding new card
  const createSetupIntent = useCallback(async () => {
    if (!isAuthenticated) return null;

    try {
      const token = await getTokenRef.current();
      const response = await apiFetchWithAuth<{ clientSecret: string; setupIntentId: string }>(
        PAYMENT_ENDPOINTS.setupIntent,
        token,
        { method: 'POST' }
      );
      return response;
    } catch {
      return null;
    }
  }, [isAuthenticated]);

  // Save payment method after setup intent confirmation
  const savePaymentMethod = useCallback(async (stripePaymentMethodId: string, setAsDefault = true) => {
    if (!isAuthenticated) return null;

    try {
      const token = await getTokenRef.current();
      const response = await apiFetchWithAuth<{ paymentMethod: PaymentMethod }>(
        PAYMENT_ENDPOINTS.save,
        token,
        {
          method: 'POST',
          body: JSON.stringify({ stripePaymentMethodId, setAsDefault }),
        }
      );
      fetchData(); // Refresh list
      return response.paymentMethod;
    } catch {
      return null;
    }
  }, [isAuthenticated, fetchData]);

  // Set default payment method
  const setDefault = useCallback(async (paymentMethodId: string) => {
    if (!isAuthenticated) return;

    try {
      const token = await getTokenRef.current();
      await apiFetchWithAuth<{ success: boolean }>(
        PAYMENT_ENDPOINTS.setDefault,
        token,
        {
          method: 'PATCH',
          body: JSON.stringify({ paymentMethodId }),
        }
      );
      fetchData(); // Refresh list
    } catch (err) {
      throw err;
    }
  }, [isAuthenticated, fetchData]);

  // Delete payment method
  const deletePaymentMethod = useCallback(async (paymentMethodId: string) => {
    if (!isAuthenticated) return;

    try {
      const token = await getTokenRef.current();
      await apiFetchWithAuth<{ success: boolean }>(
        PAYMENT_ENDPOINTS.delete(paymentMethodId),
        token,
        { method: 'DELETE' }
      );
      fetchData(); // Refresh list
    } catch (err) {
      throw err;
    }
  }, [isAuthenticated, fetchData]);

  return {
    data,
    error,
    isLoading,
    refetch: fetchData,
    createSetupIntent,
    savePaymentMethod,
    setDefault,
    deletePaymentMethod,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  PaymentMethod,
  ProductListItem,
  ProductDetail,
  CategoryDetail,
  CategoryProductsResponse,
  PaginationInfo,
  ApiStory,
  ApiStoryItem,
  FavoriteProduct,
  RecipeListItem,
  RecipeCategory,
  RecipeTag,
  RecipeQueryOptions,
  RecipeCuisine,
  RecipeHomeSection,
  RecipeHomeResponse,
  RecipesByCuisineResponse,
  DeliverySlot,
  CheckoutSession,
  PlaceOrderResult,
  ShoppableRecipe,
  ShoppableIngredient,
  ShoppableProductOption,
  SizeGroup,
};
