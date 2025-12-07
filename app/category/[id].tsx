import { ScrollView, StyleSheet, View, Pressable, Platform, FlatList, Dimensions } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 80;
const CONTENT_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
const PRODUCT_CARD_WIDTH = (CONTENT_WIDTH - tokens.spacing[4] * 3) / 2;

// Subcategories data
const SUBCATEGORIES: Record<string, { id: string; title: string; image: string }[]> = {
  veggies: [
    { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&h=100&fit=crop' },
    { id: 'fresh-vegetables', title: 'Fresh Vegetables', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=100&h=100&fit=crop' },
    { id: 'fresh-fruits', title: 'Fresh Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&h=100&fit=crop' },
    { id: 'exotics', title: 'Exotics', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=100&h=100&fit=crop' },
    { id: 'herbs', title: 'Herbs & Seasonings', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=100&h=100&fit=crop' },
    { id: 'organic', title: 'Organic', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop' },
    { id: 'seasonal', title: 'Seasonal', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=100&h=100&fit=crop' },
    { id: 'cut-fruits', title: 'Cut & Sprouts', image: 'https://images.unsplash.com/photo-1564750497011-ead0ce4b9448?w=100&h=100&fit=crop' },
  ],
  dairy: [
    { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop' },
    { id: 'milk', title: 'Milk', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop' },
    { id: 'cheese', title: 'Cheese', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=100&h=100&fit=crop' },
    { id: 'butter', title: 'Butter & Cream', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=100&h=100&fit=crop' },
    { id: 'eggs', title: 'Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100&h=100&fit=crop' },
    { id: 'yogurt', title: 'Yogurt', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&h=100&fit=crop' },
  ],
  snacks: [
    { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=100&h=100&fit=crop' },
    { id: 'chips', title: 'Chips & Wafers', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=100&h=100&fit=crop' },
    { id: 'namkeen', title: 'Namkeen & Snacks', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop' },
    { id: 'chocolates', title: 'Chocolates', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=100&h=100&fit=crop' },
    { id: 'biscuits', title: 'Biscuits & Cookies', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100&h=100&fit=crop' },
    { id: 'drinks', title: 'Drinks & Juices', image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop' },
  ],
};

// Default subcategories for other categories
const DEFAULT_SUBCATEGORIES = [
  { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop' },
  { id: 'popular', title: 'Popular', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&h=100&fit=crop' },
  { id: 'new', title: 'New Arrivals', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=100&h=100&fit=crop' },
  { id: 'deals', title: 'Best Deals', image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=100&h=100&fit=crop' },
];

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

// Sample products data
const PRODUCTS = [
  {
    id: '1',
    title: 'Organic Avocados',
    weight: '2 count',
    price: 4.99,
    originalPrice: 6.99,
    deliveryTime: '2 hours',
    rating: 4.5,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop',
    isVegetarian: true,
    isBestseller: true,
    recipeCount: 12,
  },
  {
    id: '2',
    title: 'Fresh Strawberries',
    weight: '1 lb',
    price: 5.49,
    originalPrice: 7.99,
    deliveryTime: '2 hours',
    rating: 4.8,
    reviewCount: 256,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop',
    isVegetarian: true,
    recipeCount: 8,
  },
  {
    id: '3',
    title: 'Red Bell Peppers',
    weight: '3 count',
    price: 3.99,
    deliveryTime: '2 hours',
    rating: 4.6,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop',
    isVegetarian: true,
    recipeCount: 24,
  },
  {
    id: '4',
    title: 'Baby Spinach',
    weight: '5 oz',
    price: 4.29,
    originalPrice: 5.49,
    deliveryTime: '2 hours',
    rating: 4.4,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
    isVegetarian: true,
    isOrganic: true,
  },
  {
    id: '5',
    title: 'Honeycrisp Apples',
    weight: '3 lb bag',
    price: 7.99,
    deliveryTime: '2 hours',
    rating: 4.9,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
    isVegetarian: true,
    isBestseller: true,
    recipeCount: 15,
  },
  {
    id: '6',
    title: 'Fresh Broccoli',
    weight: '1 bunch',
    price: 2.99,
    deliveryTime: '2 hours',
    rating: 4.3,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
    isVegetarian: true,
    recipeCount: 18,
    isOutOfStock: true,
  },
  {
    id: '7',
    title: 'Organic Bananas',
    weight: '1 bunch',
    price: 1.99,
    deliveryTime: '2 hours',
    rating: 4.7,
    reviewCount: 523,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop',
    isVegetarian: true,
    isOrganic: true,
    isBestseller: true,
  },
  {
    id: '8',
    title: 'Cherry Tomatoes',
    weight: '1 pint',
    price: 4.49,
    originalPrice: 5.99,
    deliveryTime: '2 hours',
    rating: 4.5,
    reviewCount: 178,
    image: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=400&h=400&fit=crop',
    isVegetarian: true,
    recipeCount: 32,
    hasOptions: true,
  },
];

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const categoryTitle = CATEGORY_TITLES[id || ''] || 'Products';
  const subcategories = SUBCATEGORIES[id || ''] || DEFAULT_SUBCATEGORIES;

  const handleBack = () => {
    router.back();
  };

  const handleSearch = () => {
    console.log('Open search');
  };

  const handleSubcategoryPress = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleFilterPress = (filterId: string) => {
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

  const handleAddToCart = (productId: string) => {
    setQuantities(prev => ({ ...prev, [productId]: 1 }));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => {
      const newQty = Math.max(0, (prev[productId] || 0) + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  const handleNotify = (productId: string) => {
    console.log('Notify when available:', productId);
  };

  const renderSubcategoryItem = useCallback(({ item, index }: { item: typeof subcategories[0]; index: number }) => {
    const isSelected = selectedSubcategory === item.id;
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
          weight={isSelected ? 'semibold' : 'regular'}
          style={[styles.subcategoryTitle, isSelected && styles.subcategoryTitleSelected]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </Pressable>
    );
  }, [selectedSubcategory]);

  const renderProductItem = useCallback(({ item }: { item: typeof PRODUCTS[0] }) => {
    const quantity = quantities[item.id] || 0;
    const isFavorite = favorites[item.id];
    const discount = item.originalPrice
      ? Math.round((1 - item.price / item.originalPrice) * 100)
      : 0;

    return (
      <Pressable
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
      >
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: item.image }}
            width="100%"
            height={140}
            borderRadius={12}
          />

          {/* Out of stock overlay */}
          {item.isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of stock</Text>
            </View>
          )}

          {/* Favorite button */}
          <Pressable
            style={styles.favoriteButton}
            onPress={() => handleFavoriteToggle(item.id)}
          >
            <Icon
              name={isFavorite ? 'heart-fill' : 'heart'}
              size="sm"
              color={isFavorite ? tokens.colors.semantic.status.error.default : tokens.colors.semantic.text.tertiary}
            />
          </Pressable>

          {/* Bestseller badge */}
          {item.isBestseller && (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>Bestseller</Text>
            </View>
          )}

          {/* Add button */}
          <View style={styles.addButtonContainer}>
            {item.isOutOfStock ? (
              <Pressable
                style={styles.notifyButton}
                onPress={() => handleNotify(item.id)}
              >
                <Text style={styles.notifyButtonText}>Notify</Text>
              </Pressable>
            ) : quantity > 0 ? (
              <View style={styles.quantityControl}>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, -1)}
                >
                  <Icon name="minus" size="sm" color={tokens.colors.semantic.surface.primary} />
                </Pressable>
                <Text style={styles.quantityText}>{quantity}</Text>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, 1)}
                >
                  <Icon name="plus" size="sm" color={tokens.colors.semantic.surface.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.addButton, item.hasOptions && styles.addButtonWithOptions]}
                onPress={() => handleAddToCart(item.id)}
              >
                <Text style={styles.addButtonText}>ADD</Text>
                {item.hasOptions && (
                  <Text style={styles.optionsText}>2 options</Text>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Badges row */}
          <View style={styles.badgesRow}>
            {item.isVegetarian && (
              <View style={styles.vegBadge}>
                <View style={styles.vegDot} />
              </View>
            )}
            <View style={styles.weightBadge}>
              <Text style={styles.weightText}>{item.weight}</Text>
            </View>
          </View>

          {/* Title */}
          <Text variant="bodySmall" weight="medium" numberOfLines={2} style={styles.productTitle}>
            {item.title}
          </Text>

          {/* Delivery time */}
          <View style={styles.deliveryRow}>
            <Icon name="time" size="xs" color={tokens.colors.semantic.status.success.default} />
            <Text style={styles.deliveryText}>{item.deliveryTime}</Text>
          </View>

          {/* Discount */}
          {discount > 0 && (
            <Text style={styles.discountText}>{discount}% OFF</Text>
          )}

          {/* Price row */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
            )}
          </View>

          {/* Recipe link */}
          {item.recipeCount && item.recipeCount > 0 && (
            <Pressable style={styles.recipeLink}>
              <Text style={styles.recipeLinkText}>See {item.recipeCount} recipes</Text>
              <Icon name="chevron-right" size="xs" color={tokens.colors.semantic.brand.primary.default} />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  }, [quantities, favorites]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h4" weight="semibold" style={styles.headerTitle}>
          {categoryTitle}
        </Text>
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
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
          {/* Filter bar */}
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

          {/* Product grid */}
          <FlatList
            data={PRODUCTS}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productGridContent}
            columnWrapperStyle={styles.productGridRow}
          />
        </View>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'space-between',
    marginBottom: tokens.spacing[3],
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  outOfStockText: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 12,
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: tokens.spacing[2],
    right: tokens.spacing[2],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  bestsellerBadge: {
    position: 'absolute',
    top: tokens.spacing[2],
    left: tokens.spacing[2],
    backgroundColor: '#FFF3CD',
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestsellerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#856404',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: -14,
    left: tokens.spacing[2],
    right: tokens.spacing[2],
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: 8,
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
    minWidth: 80,
    alignItems: 'center',
  },
  addButtonWithOptions: {
    paddingVertical: tokens.spacing[1],
  },
  addButtonText: {
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '600',
    fontSize: 14,
  },
  optionsText: {
    color: tokens.colors.semantic.status.success.default,
    fontSize: 10,
  },
  notifyButton: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    borderRadius: 8,
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
    minWidth: 80,
    alignItems: 'center',
  },
  notifyButtonText: {
    color: tokens.colors.semantic.text.secondary,
    fontWeight: '500',
    fontSize: 14,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 8,
    paddingVertical: tokens.spacing[1],
    paddingHorizontal: tokens.spacing[2],
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 14,
    minWidth: 24,
    textAlign: 'center',
  },
  productInfo: {
    padding: tokens.spacing[3],
    paddingTop: tokens.spacing[5],
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[1],
  },
  vegBadge: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  weightBadge: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  weightText: {
    fontSize: 10,
    color: tokens.colors.semantic.text.secondary,
  },
  productTitle: {
    marginBottom: tokens.spacing[1],
    lineHeight: 16,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: tokens.spacing[1],
  },
  deliveryText: {
    fontSize: 11,
    color: tokens.colors.semantic.status.success.default,
  },
  discountText: {
    fontSize: 12,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
    marginBottom: tokens.spacing[1],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  recipeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing[2],
    paddingTop: tokens.spacing[2],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  recipeLinkText: {
    fontSize: 12,
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
});
