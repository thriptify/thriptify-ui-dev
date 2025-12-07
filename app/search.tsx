import { ScrollView, StyleSheet, View, Pressable, FlatList, Platform, Keyboard } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image, Badge } from '@thriptify/ui-elements';
import { SearchBar } from '@thriptify/components';
import { tokens } from '@thriptify/tokens/react-native';
import { useCart } from '@/contexts/cart-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Recent searches storage key
const RECENT_SEARCHES_KEY = 'thriptify_recent_searches';
const MAX_RECENT_SEARCHES = 10;

// Search suggestions data
const TRENDING_SEARCHES = [
  'Organic vegetables',
  'Fresh fruits',
  'Milk',
  'Bread',
  'Eggs',
  'Chicken breast',
  'Pasta',
  'Rice',
];

const POPULAR_CATEGORIES = [
  { id: 'veggies', title: 'Vegetables & Fruits', icon: 'nutrition', color: '#4CAF50' },
  { id: 'dairy', title: 'Dairy & Eggs', icon: 'cafe', color: '#FFA726' },
  { id: 'meat', title: 'Meat & Seafood', icon: 'restaurant', color: '#EF5350' },
  { id: 'bakery', title: 'Bakery', icon: 'basket', color: '#8D6E63' },
];

// Mock search results data
const ALL_PRODUCTS = [
  {
    id: '1',
    title: 'Organic Avocados',
    category: 'Produce',
    price: 4.99,
    originalPrice: 6.99,
    rating: 4.5,
    reviewCount: 128,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop',
    isVegetarian: true,
    weight: '2 count',
    tags: ['organic', 'avocado', 'fruit', 'vegetable', 'fresh'],
  },
  {
    id: '2',
    title: 'Fresh Strawberries',
    category: 'Produce',
    price: 5.49,
    originalPrice: 7.99,
    rating: 4.8,
    reviewCount: 256,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop',
    isVegetarian: true,
    weight: '1 lb',
    tags: ['strawberry', 'berry', 'fruit', 'fresh'],
  },
  {
    id: '3',
    title: 'Artisan Sourdough',
    category: 'Bakery',
    price: 6.99,
    rating: 4.7,
    reviewCount: 89,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
    isVegetarian: true,
    weight: '1 loaf',
    tags: ['bread', 'sourdough', 'bakery', 'artisan'],
  },
  {
    id: '4',
    title: 'Organic Milk',
    category: 'Dairy',
    price: 5.99,
    originalPrice: 7.49,
    rating: 4.6,
    reviewCount: 312,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
    isVegetarian: true,
    weight: '1 gallon',
    tags: ['milk', 'dairy', 'organic', 'beverage'],
  },
  {
    id: '5',
    title: 'Free Range Eggs',
    category: 'Dairy',
    price: 6.49,
    rating: 4.9,
    reviewCount: 445,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop',
    isVegetarian: true,
    weight: '12 count',
    tags: ['eggs', 'dairy', 'free range', 'organic'],
  },
  {
    id: '6',
    title: 'Chicken Breast',
    category: 'Meat',
    price: 9.99,
    originalPrice: 12.99,
    rating: 4.4,
    reviewCount: 198,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop',
    isVegetarian: false,
    weight: '1 lb',
    tags: ['chicken', 'meat', 'poultry', 'protein'],
  },
  {
    id: '7',
    title: 'Basmati Rice',
    category: 'Pantry',
    price: 8.99,
    rating: 4.7,
    reviewCount: 523,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
    isVegetarian: true,
    weight: '5 lb',
    tags: ['rice', 'basmati', 'grain', 'pantry'],
  },
  {
    id: '8',
    title: 'Extra Virgin Olive Oil',
    category: 'Pantry',
    price: 12.99,
    originalPrice: 15.99,
    rating: 4.8,
    reviewCount: 267,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
    isVegetarian: true,
    weight: '500 ml',
    tags: ['olive oil', 'oil', 'cooking', 'pantry'],
  },
  {
    id: '9',
    title: 'Organic Spinach',
    category: 'Produce',
    price: 3.99,
    rating: 4.5,
    reviewCount: 156,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
    isVegetarian: true,
    weight: '5 oz',
    tags: ['spinach', 'vegetable', 'leafy green', 'organic', 'fresh'],
  },
  {
    id: '10',
    title: 'Greek Yogurt',
    category: 'Dairy',
    price: 4.49,
    originalPrice: 5.99,
    rating: 4.6,
    reviewCount: 389,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
    isVegetarian: true,
    weight: '32 oz',
    tags: ['yogurt', 'greek', 'dairy', 'protein'],
  },
];

// Recipe data for search
const ALL_RECIPES = [
  {
    id: 'r1',
    title: 'Avocado Toast',
    cookTime: '10 min',
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop',
    isVegetarian: true,
    tags: ['avocado', 'toast', 'breakfast', 'quick'],
  },
  {
    id: 'r2',
    title: 'Strawberry Smoothie',
    cookTime: '5 min',
    servings: 1,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
    isVegetarian: true,
    tags: ['strawberry', 'smoothie', 'drink', 'breakfast'],
  },
  {
    id: 'r3',
    title: 'Grilled Chicken Salad',
    cookTime: '25 min',
    servings: 2,
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop',
    isVegetarian: false,
    tags: ['chicken', 'salad', 'healthy', 'lunch'],
  },
  {
    id: 'r4',
    title: 'Spinach Pasta',
    cookTime: '20 min',
    servings: 4,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
    isVegetarian: true,
    tags: ['spinach', 'pasta', 'dinner', 'vegetarian'],
  },
];

// Filter options
const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'products', label: 'Products' },
  { id: 'recipes', label: 'Recipes' },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Rating' },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { addItem, updateQuantity, getItemQuantity, itemCount } = useCart();

  const [searchText, setSearchText] = useState(params.q?.toString() || '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    products: typeof ALL_PRODUCTS;
    recipes: typeof ALL_RECIPES;
  }>({ products: [], recipes: [] });
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('relevance');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Perform search when query param changes
  useEffect(() => {
    if (params.q) {
      setSearchText(params.q.toString());
      performSearch(params.q.toString());
    }
  }, [params.q]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  const removeRecentSearch = async (query: string) => {
    try {
      const updated = recentSearches.filter(s => s !== query);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to remove recent search:', error);
    }
  };

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults({ products: [], recipes: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lowerQuery = query.toLowerCase();

    // Filter products
    const products = ALL_PRODUCTS.filter(product =>
      product.title.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    // Filter recipes
    const recipes = ALL_RECIPES.filter(recipe =>
      recipe.title.toLowerCase().includes(lowerQuery) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    // Sort results
    let sortedProducts = [...products];
    if (activeSort === 'price_low') {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price_high') {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'rating') {
      sortedProducts.sort((a, b) => b.rating - a.rating);
    }

    setSearchResults({ products: sortedProducts, recipes });
    setIsSearching(false);
  }, [activeSort]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      performSearch(query);
      Keyboard.dismiss();
    }
  };

  const handleClear = () => {
    setSearchText('');
    setSearchResults({ products: [], recipes: [] });
  };

  const handleBack = () => {
    router.back();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  const handleTrendingPress = (query: string) => {
    setSearchText(query);
    handleSearch(query);
  };

  const handleRecentPress = (query: string) => {
    setSearchText(query);
    handleSearch(query);
  };

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddToCart = (product: typeof ALL_PRODUCTS[0]) => {
    addItem({
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      weight: product.weight,
      isVegetarian: product.isVegetarian,
    });
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const currentQty = getItemQuantity(productId);
    updateQuantity(productId, currentQty + delta);
  };

  const hasResults = searchResults.products.length > 0 || searchResults.recipes.length > 0;
  const showInitialState = !searchText.trim();

  const filteredProducts = activeFilter === 'recipes' ? [] : searchResults.products;
  const filteredRecipes = activeFilter === 'products' ? [] : searchResults.recipes;
  const totalResults = filteredProducts.length + filteredRecipes.length;

  const renderProductCard = ({ item: product }: { item: typeof ALL_PRODUCTS[0] }) => (
    <Pressable
      style={styles.productCard}
      onPress={() => handleProductPress(product.id)}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product.image }}
          width="100%"
          height={100}
          borderRadius={8}
        />
        <Pressable
          style={styles.favoriteButton}
          onPress={() => handleFavoriteToggle(product.id)}
        >
          <Icon
            name={favorites[product.id] ? 'heart-fill' : 'heart'}
            size="sm"
            color={favorites[product.id] ? tokens.colors.semantic.status.error.default : tokens.colors.semantic.text.tertiary}
          />
        </Pressable>
        <View style={styles.addButtonContainer}>
          {getItemQuantity(product.id) > 0 ? (
            <View style={styles.quantityControl}>
              <Pressable
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(product.id, -1)}
              >
                <Icon name="minus" size="xs" color={tokens.colors.semantic.surface.primary} />
              </Pressable>
              <Text style={styles.quantityText}>{getItemQuantity(product.id)}</Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(product.id, 1)}
              >
                <Icon name="plus" size="xs" color={tokens.colors.semantic.surface.primary} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.addButton}
              onPress={() => handleAddToCart(product)}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.productInfo}>
        <View style={styles.productBadges}>
          {product.isVegetarian && (
            <View style={styles.vegBadge}>
              <View style={styles.vegDot} />
            </View>
          )}
          <Text style={styles.productWeight}>{product.weight}</Text>
        </View>
        <Text variant="bodySmall" weight="medium" numberOfLines={2} style={styles.productTitle}>
          {product.title}
        </Text>
        <View style={styles.ratingRow}>
          <Icon name="star-fill" size="xs" color="#FFB800" />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>
        <View style={styles.deliveryBadge}>
          <Icon name="time" size="xs" color={tokens.colors.semantic.status.success.default} />
          <Text style={styles.productDeliveryText}>{product.deliveryTime}</Text>
        </View>
        {product.originalPrice && (
          <Text style={styles.discountBadge}>
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </Text>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  const renderRecipeCard = ({ item: recipe }: { item: typeof ALL_RECIPES[0] }) => (
    <Pressable
      style={styles.recipeCard}
      onPress={() => handleRecipePress(recipe.id)}
    >
      <Image
        source={{ uri: recipe.image }}
        width="100%"
        height={100}
        borderRadius={8}
      />
      <View style={styles.recipeInfo}>
        <View style={styles.recipeBadges}>
          {recipe.isVegetarian && (
            <View style={styles.vegBadge}>
              <View style={styles.vegDot} />
            </View>
          )}
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
          </View>
        </View>
        <Text variant="bodySmall" weight="medium" numberOfLines={2} style={styles.recipeTitle}>
          {recipe.title}
        </Text>
        <View style={styles.recipeMetaRow}>
          <Icon name="time" size="xs" color={tokens.colors.semantic.text.tertiary} />
          <Text style={styles.recipeMetaText}>{recipe.cookTime}</Text>
          <Text style={styles.recipeMetaDivider}>•</Text>
          <Text style={styles.recipeMetaText}>{recipe.servings} servings</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <View style={styles.searchRow}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
          <View style={styles.searchBarContainer}>
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              onSearch={handleSearch}
              onClear={handleClear}
              placeholder="Search products, recipes..."
              showClearButton
              autoFocus
            />
          </View>
        </View>

        {/* Filters - only show when there are results */}
        {hasResults && !showInitialState && (
          <View style={styles.filtersRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              {FILTER_OPTIONS.map(filter => (
                <Pressable
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    activeFilter === filter.id && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(filter.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === filter.id && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.sortButton}
              onPress={() => setShowSortOptions(!showSortOptions)}
            >
              <Icon name="sort" size="sm" color={tokens.colors.semantic.text.primary} />
              <Text style={styles.sortButtonText}>Sort</Text>
            </Pressable>
          </View>
        )}

        {/* Sort Options Dropdown */}
        {showSortOptions && (
          <View style={styles.sortDropdown}>
            {SORT_OPTIONS.map(option => (
              <Pressable
                key={option.id}
                style={[
                  styles.sortOption,
                  activeSort === option.id && styles.sortOptionActive,
                ]}
                onPress={() => {
                  setActiveSort(option.id);
                  setShowSortOptions(false);
                  if (searchText.trim()) {
                    performSearch(searchText);
                  }
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    activeSort === option.id && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {activeSort === option.id && (
                  <Icon name="checkmark" size="sm" color={tokens.colors.semantic.brand.primary.default} />
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showInitialState ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text variant="h4" style={styles.sectionTitle}>Recent Searches</Text>
                  <Pressable onPress={clearRecentSearches}>
                    <Text style={styles.clearText}>Clear all</Text>
                  </Pressable>
                </View>
                <View style={styles.recentSearches}>
                  {recentSearches.map((search, index) => (
                    <Pressable
                      key={index}
                      style={styles.recentSearchItem}
                      onPress={() => handleRecentPress(search)}
                    >
                      <Icon name="time" size="sm" color={tokens.colors.semantic.text.tertiary} />
                      <Text style={styles.recentSearchText}>{search}</Text>
                      <Pressable
                        style={styles.removeSearchButton}
                        onPress={() => removeRecentSearch(search)}
                        hitSlop={8}
                      >
                        <Icon name="close" size="xs" color={tokens.colors.semantic.text.tertiary} />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Trending Searches */}
            <View style={styles.section}>
              <Text variant="h4" style={styles.sectionTitle}>Trending Searches</Text>
              <View style={styles.trendingSearches}>
                {TRENDING_SEARCHES.map((search, index) => (
                  <Pressable
                    key={index}
                    style={styles.trendingChip}
                    onPress={() => handleTrendingPress(search)}
                  >
                    <Icon name="trending" size="xs" color={tokens.colors.semantic.brand.primary.default} />
                    <Text style={styles.trendingChipText}>{search}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Popular Categories */}
            <View style={styles.section}>
              <Text variant="h4" style={styles.sectionTitle}>Popular Categories</Text>
              <View style={styles.popularCategories}>
                {POPULAR_CATEGORIES.map(category => (
                  <Pressable
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() => handleCategoryPress(category.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                      <Icon name={category.icon} size="md" color={category.color} />
                    </View>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.tertiary} />
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : hasResults ? (
          <>
            {/* Results count */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchText}"
              </Text>
            </View>

            {/* Products */}
            {filteredProducts.length > 0 && (
              <View style={styles.section}>
                {activeFilter === 'all' && (
                  <View style={styles.sectionHeader}>
                    <Text variant="h4" style={styles.sectionTitle}>Products</Text>
                    <Text style={styles.sectionCount}>{filteredProducts.length}</Text>
                  </View>
                )}
                <FlatList
                  data={filteredProducts}
                  renderItem={renderProductCard}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.productGrid}
                  scrollEnabled={false}
                  contentContainerStyle={styles.productGridContainer}
                />
              </View>
            )}

            {/* Recipes */}
            {filteredRecipes.length > 0 && (
              <View style={styles.section}>
                {activeFilter === 'all' && (
                  <View style={styles.sectionHeader}>
                    <Text variant="h4" style={styles.sectionTitle}>Recipes</Text>
                    <Text style={styles.sectionCount}>{filteredRecipes.length}</Text>
                  </View>
                )}
                <FlatList
                  data={filteredRecipes}
                  renderItem={renderRecipeCard}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.productGrid}
                  scrollEnabled={false}
                  contentContainerStyle={styles.productGridContainer}
                />
              </View>
            )}
          </>
        ) : (
          /* No Results */
          <View style={styles.emptyState}>
            <Icon name="search" size="xl" color={tokens.colors.semantic.text.tertiary} />
            <Text variant="h3" style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>
              We couldn't find anything for "{searchText}". Try searching for something else.
            </Text>
            <Pressable style={styles.browseCategoriesButton} onPress={() => router.push('/(tabs)/categories')}>
              <Text style={styles.browseCategoriesText}>Browse Categories</Text>
            </Pressable>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <Pressable
          style={[styles.floatingCartButton, { bottom: insets.bottom + 16 }]}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.cartIconContainer}>
            <Icon name="bag" size="md" color={tokens.colors.semantic.surface.primary} />
          </View>
          <View style={styles.cartButtonContent}>
            <Text style={styles.cartItemCount}>{itemCount} item{itemCount > 1 ? 's' : ''}</Text>
            <Text style={styles.viewCartText}>View cart</Text>
          </View>
          <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.surface.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  header: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingBottom: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flex: 1,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    marginTop: tokens.spacing[3],
    gap: tokens.spacing[2],
  },
  filterChips: {
    flexDirection: 'row',
    gap: tokens.spacing[2],
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderColor: tokens.colors.semantic.brand.primary.default,
  },
  filterChipText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  filterChipTextActive: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
    gap: tokens.spacing[1],
  },
  sortButtonText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  sortDropdown: {
    position: 'absolute',
    top: '100%',
    right: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    marginTop: tokens.spacing[2],
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
    zIndex: 100,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  sortOptionActive: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  sortOptionText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.primary,
  },
  sortOptionTextActive: {
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: tokens.spacing[4],
  },
  section: {
    marginBottom: tokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  sectionTitle: {
    color: tokens.colors.semantic.text.primary,
  },
  sectionCount: {
    fontSize: 14,
    color: tokens.colors.semantic.text.tertiary,
  },
  clearText: {
    fontSize: 14,
    color: tokens.colors.semantic.brand.primary.default,
  },
  // Recent Searches
  recentSearches: {
    paddingHorizontal: tokens.spacing[4],
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
    gap: tokens.spacing[3],
  },
  recentSearchText: {
    flex: 1,
    fontSize: 15,
    color: tokens.colors.semantic.text.primary,
  },
  removeSearchButton: {
    padding: tokens.spacing[1],
  },
  // Trending Searches
  trendingSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
    gap: tokens.spacing[1],
  },
  trendingChipText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.primary,
  },
  // Popular Categories
  popularCategories: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: tokens.spacing[3],
    gap: tokens.spacing[3],
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  // Results
  resultsHeader: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  resultsCount: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },
  productGridContainer: {
    paddingHorizontal: tokens.spacing[4],
  },
  productGrid: {
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[3],
  },
  productCard: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  favoriteButton: {
    position: 'absolute',
    top: tokens.spacing[2],
    right: tokens.spacing[2],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: -12,
    right: tokens.spacing[2],
  },
  addButton: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: 6,
    paddingVertical: tokens.spacing[1],
    paddingHorizontal: tokens.spacing[3],
  },
  addButtonText: {
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '600',
    fontSize: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 6,
    paddingVertical: tokens.spacing[1],
    paddingHorizontal: tokens.spacing[1],
  },
  quantityButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 12,
    minWidth: 16,
    textAlign: 'center',
  },
  productInfo: {
    padding: tokens.spacing[2],
    paddingTop: tokens.spacing[4],
  },
  productBadges: {
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
  productWeight: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
  },
  productTitle: {
    marginBottom: tokens.spacing[1],
    lineHeight: 16,
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: tokens.spacing[1],
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: tokens.spacing[1],
  },
  productDeliveryText: {
    fontSize: 10,
    color: tokens.colors.semantic.status.success.default,
  },
  discountBadge: {
    fontSize: 11,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
    marginBottom: tokens.spacing[1],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  originalPrice: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  // Recipe Cards
  recipeCard: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recipeInfo: {
    padding: tokens.spacing[2],
  },
  recipeBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[1],
  },
  difficultyBadge: {
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  difficultyText: {
    fontSize: 10,
    color: tokens.colors.semantic.text.secondary,
  },
  recipeTitle: {
    marginBottom: tokens.spacing[1],
    lineHeight: 16,
    fontSize: 13,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
  },
  recipeMetaDivider: {
    color: tokens.colors.semantic.text.tertiary,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: tokens.spacing[16],
    paddingHorizontal: tokens.spacing[8],
  },
  emptyTitle: {
    marginTop: tokens.spacing[4],
    color: tokens.colors.semantic.text.primary,
  },
  emptyText: {
    marginTop: tokens.spacing[2],
    textAlign: 'center',
    fontSize: 15,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 22,
  },
  browseCategoriesButton: {
    marginTop: tokens.spacing[6],
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 8,
  },
  browseCategoriesText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  // Floating Cart Button
  floatingCartButton: {
    position: 'absolute',
    left: tokens.spacing[4],
    right: tokens.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 12,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  cartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing[3],
  },
  cartButtonContent: {
    flex: 1,
  },
  cartItemCount: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 12,
    opacity: 0.9,
  },
  viewCartText: {
    color: tokens.colors.semantic.surface.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
