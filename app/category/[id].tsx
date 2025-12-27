import { ScrollView, StyleSheet, View, Pressable, FlatList, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { useState, useCallback, useRef, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { ProductCard } from '../../components/shared';
import { useCategory, useCategoryProducts, type ProductListItem } from '@/hooks/use-api';
import { useCart } from '@/contexts/cart-context';
import { FloatingCartButton } from '@/components/floating-cart-button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 80;
const CONTENT_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
// Available width = content width - left padding - right padding - gap between cards
const GRID_PADDING = tokens.spacing[3];
const PRODUCT_CARD_WIDTH = (CONTENT_WIDTH - GRID_PADDING * 2 - GRID_PADDING) / 2;

// ============================================
// FEATURE FLAGS
// ============================================
/**
 * Feature flags for controlling UI features on this page
 * Product card feature flags are in components/shared/ProductCard.tsx
 * TODO: Move to a centralized feature flag system
 */
const FEATURE_FLAGS = {
  /**
   * Enable/disable filter functionality
   * Currently disabled - will be implemented in future sprint
   * @see https://linear.app/thriptify/issue/TP-XXX
   */
  ENABLE_FILTERS: false,
};

// NOTE: Subcategories are now fetched from the API via useCategory hook
// The API returns category.children which populates the sidebar

// Category titles mapping
const CATEGORY_TITLES: Record<string, string> = {
  veggies: 'Vegetables & Fruits',
  vegetables: 'Vegetables & Fruits',
  rice: 'Rice & Grains',
  oil: 'Oil & Spices',
  dairy: 'Dairy & Eggs',
  bakery: 'Bakery & Bread',
  meat: 'Meat & Seafood',
  frozen: 'Frozen Foods',
  pantry: 'Pantry Staples',
  snacks: 'Snacks & Beverages',
};

// Quick filters
const QUICK_FILTERS = [
  { id: 'organic', label: 'Organic', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=50&h=50&fit=crop' },
  { id: 'bestseller', label: 'Bestseller', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=50&h=50&fit=crop' },
  { id: 'new', label: 'New', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=50&h=50&fit=crop' },
];

// NOTE: Products are now fetched from the API via useCategoryProducts hook
// No hardcoded fallback - shows empty state if API fails

// Transform API product to component format
function transformApiProduct(product: ProductListItem) {
  // Ensure weight is a valid string or undefined (not 0 or empty)
  const rawWeight = product.unitSize || product.unit;
  const weight = rawWeight && String(rawWeight).trim() !== '' ? String(rawWeight) : undefined;

  return {
    id: product.id,
    title: product.name,
    weight,
    price: Number(product.price) || 0,
    originalPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    deliveryTime: '2 hours',
    rating: 4.5, // TODO: Add rating to API
    reviewCount: undefined, // No reviews in API yet - use undefined to hide rating row
    image: product.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop',
    isVegetarian: product.dietaryTags?.includes('vegetarian') || false,
    isBestseller: product.dietaryTags?.includes('bestseller') || false,
    isOrganic: product.dietaryTags?.includes('organic') || false,
    isOutOfStock: !product.inStock,
    recipeCount: undefined, // No recipe count in API yet
  };
}

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInput>(null);
  const { addItem, updateQuantity, getItemQuantity } = useCart();

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch category details from API (handles both UUID and slug)
  const { data: categoryData, isLoading: isCategoryLoading } = useCategory(id);

  // Get the actual category ID (UUID) from the fetched data
  // This ensures we use the correct ID for product fetching
  const resolvedCategoryId = categoryData?.id;

  // Fetch products - use selected subcategory or resolved category ID
  const productCategoryId = selectedSubcategory || resolvedCategoryId;
  const { data: productsData, isLoading: isProductsLoading } = useCategoryProducts(productCategoryId, {
    limit: 50,
    includeDescendants: !selectedSubcategory, // Include all children products when viewing main category
  });

  // Animation values
  const searchWidth = useSharedValue(40);
  const titleOpacity = useSharedValue(1);

  // Derive values from API data or fallback
  const categoryTitle = categoryData?.name || CATEGORY_TITLES[id || ''] || 'Products';

  // Build subcategories from API children (no hardcoded fallback)
  const subcategories = useMemo(() => {
    if (categoryData?.children && categoryData.children.length > 0) {
      const allItem = {
        id: 'all',
        title: 'All',
        image: categoryData.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&h=100&fit=crop',
      };
      const childItems = categoryData.children.map(child => ({
        id: child.id,
        title: child.name,
        image: child.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&h=100&fit=crop',
      }));
      return [allItem, ...childItems];
    }
    // No children - just show "All" for this category
    return [{
      id: 'all',
      title: 'All',
      image: categoryData?.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&h=100&fit=crop',
    }];
  }, [categoryData]);

  // Transform API products to display format (no hardcoded fallback)
  const products = useMemo(() => {
    if (productsData?.products && productsData.products.length > 0) {
      return productsData.products.map(transformApiProduct);
    }
    return []; // Empty - will show empty state
  }, [productsData]);

  const isLoading = isCategoryLoading || isProductsLoading;

  const handleBack = () => {
    router.back();
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
    searchWidth.value = withTiming(SCREEN_WIDTH - 100, { duration: 250 });
    titleOpacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
    searchWidth.value = withTiming(40, { duration: 250 });
    titleOpacity.value = withTiming(1, { duration: 250 });
    searchInputRef.current?.blur();
  };

  const handleSubcategoryPress = (subcategoryId: string) => {
    // 'all' means show all products from parent category
    setSelectedSubcategory(subcategoryId === 'all' ? null : subcategoryId);
  };

  const handleFilterPress = (filterId: string) => {
    if (!FEATURE_FLAGS.ENABLE_FILTERS) return;
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      weight: product.weight || '',
      isVegetarian: product.isVegetarian,
    });
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const currentQty = getItemQuantity(productId);
    updateQuantity(productId, currentQty + delta);
  };

  const handleNotify = (productId: string) => {
    console.log('Notify when available:', productId);
  };

  // Animated styles
  const searchAnimatedStyle = useAnimatedStyle(() => ({
    width: searchWidth.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const renderSubcategoryItem = useCallback(({ item }: { item: typeof subcategories[0] }) => {
    // 'all' is selected when selectedSubcategory is null
    const isSelected = item.id === 'all' ? selectedSubcategory === null : selectedSubcategory === item.id;
    return (
      <Pressable
        style={[styles.subcategoryItem, isSelected && styles.subcategoryItemSelected]}
        onPress={() => handleSubcategoryPress(item.id)}
      >
        {isSelected && <View style={styles.subcategoryIndicator} />}
        <View style={[styles.subcategoryImageWrapper, isSelected && styles.subcategoryImageWrapperSelected]}>
          <Image
            source={{ uri: item.image }}
            width={48}
            height={48}
            borderRadius={24}
          />
        </View>
        <Text
          variant="caption"
          weight={isSelected ? 'semibold' : undefined}
          style={[styles.subcategoryTitle, isSelected && styles.subcategoryTitleSelected]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </Pressable>
    );
  }, [selectedSubcategory]);

  const renderProductItem = useCallback(({ item }: { item: typeof products[0] }) => {
    const quantity = getItemQuantity(item.id);
    return (
      <ProductCard
        product={item}
        isFavorite={favorites[item.id]}
        quantity={quantity}
        width={PRODUCT_CARD_WIDTH}
        onPress={() => handleProductPress(item.id)}
        onFavoriteToggle={() => handleFavoriteToggle(item.id)}
        onAddToCart={() => handleAddToCart(item)}
        onQuantityChange={(delta) => handleQuantityChange(item.id, delta)}
        onNotify={() => handleNotify(item.id)}
      />
    );
  }, [favorites, getItemQuantity]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>

        {!isSearchActive && (
          <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
            <Text variant="h4" weight="semibold" style={styles.headerTitle}>
              {categoryTitle}
            </Text>
          </Animated.View>
        )}

        <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
          {isSearchActive ? (
            <View style={styles.searchInputContainer}>
              <Icon name="search" size="sm" color={tokens.colors.semantic.text.tertiary} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor={tokens.colors.semantic.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Pressable onPress={handleSearchClose} style={styles.searchCloseButton}>
                <Icon name="x" size="sm" color={tokens.colors.semantic.text.secondary} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.searchButton} onPress={handleSearchPress}>
              <Icon name="search" size="md" color={tokens.colors.semantic.text.primary} />
            </Pressable>
          )}
        </Animated.View>
      </View>

      {/* Main content with sidebar */}
      <View style={styles.mainContent}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <FlatList
            data={subcategories}
            renderItem={renderSubcategoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sidebarContent}
          />
        </View>

        {/* Content area */}
        <View style={styles.contentArea}>
          {/* Filter bar - Only shown when ENABLE_FILTERS is true */}
          {FEATURE_FLAGS.ENABLE_FILTERS && (
            <View style={styles.filterBar}>
              <Pressable style={styles.filterButton}>
                <Icon name="settings" size="sm" color={tokens.colors.semantic.text.secondary} />
                <Text style={styles.filterButtonText}>Filters</Text>
                <Icon name="chevron-down" size="xs" color={tokens.colors.semantic.text.secondary} />
              </Pressable>

              <Pressable style={styles.sortButton}>
                <Icon name="arrow-up-down" size="sm" color={tokens.colors.semantic.text.secondary} />
                <Text style={styles.filterButtonText}>Sort</Text>
                <Icon name="chevron-down" size="xs" color={tokens.colors.semantic.text.secondary} />
              </Pressable>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickFiltersContent}
              >
                {QUICK_FILTERS.map((filter) => {
                  const isActive = activeFilters.includes(filter.id);
                  return (
                    <Pressable
                      key={filter.id}
                      style={[styles.quickFilterChip, isActive && styles.quickFilterChipActive]}
                      onPress={() => handleFilterPress(filter.id)}
                    >
                      <Image
                        source={{ uri: filter.image }}
                        width={20}
                        height={20}
                        borderRadius={10}
                      />
                      <Text style={[styles.quickFilterText, isActive && styles.quickFilterTextActive]}>
                        {filter.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Loading state */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          )}

          {/* Empty state */}
          {!isLoading && products.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="bag" size="xl" color={tokens.colors.semantic.text.tertiary} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>Try selecting a different category</Text>
            </View>
          )}

          {/* Product grid */}
          {!isLoading && products.length > 0 && (
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productGridContent}
              columnWrapperStyle={styles.productGridRow}
            />
          )}
        </View>
      </View>

      {/* Floating Cart Button */}
      <FloatingCartButton bottomOffset={insets.bottom + 16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
  },
  searchContainer: {
    height: 40,
    justifyContent: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 20,
    paddingHorizontal: tokens.spacing[3],
    height: 40,
    gap: tokens.spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.semantic.text.primary,
  },
  searchCloseButton: {
    padding: tokens.spacing[1],
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRightWidth: 1,
    borderRightColor: tokens.colors.semantic.border.subtle,
  },
  sidebarContent: {
    paddingVertical: tokens.spacing[2],
  },
  subcategoryItem: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[2],
    position: 'relative',
  },
  subcategoryItemSelected: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  subcategoryIndicator: {
    position: 'absolute',
    left: 0,
    top: tokens.spacing[3],
    bottom: tokens.spacing[3],
    width: 3,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  subcategoryImageWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[1],
  },
  subcategoryImageWrapperSelected: {
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  subcategoryTitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.secondary,
    fontSize: 10,
    lineHeight: 12,
  },
  subcategoryTitleSelected: {
    color: tokens.colors.semantic.text.primary,
  },
  contentArea: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
    gap: tokens.spacing[2],
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    backgroundColor: tokens.colors.semantic.surface.primary,
    gap: tokens.spacing[1],
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    backgroundColor: tokens.colors.semantic.surface.primary,
    gap: tokens.spacing[1],
  },
  filterButtonText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  quickFiltersContent: {
    gap: tokens.spacing[2],
    paddingLeft: tokens.spacing[2],
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    backgroundColor: tokens.colors.semantic.surface.primary,
    gap: tokens.spacing[2],
  },
  quickFilterChipActive: {
    borderColor: tokens.colors.semantic.brand.primary.default,
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
  },
  quickFilterText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  quickFilterTextActive: {
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
  productGridContent: {
    padding: tokens.spacing[3],
  },
  productGridRow: {
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[3],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing[10],
  },
  loadingText: {
    marginTop: tokens.spacing[3],
    color: tokens.colors.semantic.text.secondary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing[10],
    paddingHorizontal: tokens.spacing[6],
  },
  emptyTitle: {
    marginTop: tokens.spacing[4],
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  emptySubtitle: {
    marginTop: tokens.spacing[2],
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    textAlign: 'center',
  },
});
