import { StyleSheet, ScrollView, View, Platform, Pressable } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { CategoryNavBar, ProductCard, SortSelector } from '@thriptify/components';
import { Text, Icon, Button, Image, Badge } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

// Subcategories matching Blinkit style - with images
const SUBCATEGORIES = [
  {
    id: 'all',
    title: 'All',
    image: { uri: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&h=100&fit=crop' }
  },
  {
    id: 'fresh-vegetables',
    title: 'Fresh Vegetables',
    image: { uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop' }
  },
  {
    id: 'fresh-fruits',
    title: 'Fresh Fruits',
    image: { uri: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&h=100&fit=crop' }
  },
  {
    id: 'exotics',
    title: 'Exotics',
    image: { uri: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=100&h=100&fit=crop' }
  },
  {
    id: 'coriander-others',
    title: 'Coriander & Others',
    image: { uri: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=100&h=100&fit=crop' }
  },
  {
    id: 'flowers-leaves',
    title: 'Flowers & Leaves',
    image: { uri: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=100&h=100&fit=crop' }
  },
  {
    id: 'seasonal',
    title: 'Seasonal',
    image: { uri: 'https://images.unsplash.com/photo-1568702846914-96b305d2uj64?w=100&h=100&fit=crop' }
  },
  {
    id: 'freshly-cut',
    title: 'Freshly Cut & Sprouts',
    image: { uri: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop' }
  },
];

// Products matching Blinkit style
const PRODUCTS = [
  {
    id: '1',
    title: 'Green Chilli 100 g (Hari Mirch)',
    price: 18,
    originalPrice: 22,
    discount: 18,
    weight: '100 g',
    deliveryTime: '10 MINS',
    recipeCount: 9,
    image: { uri: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=400&fit=crop' },
  },
  {
    id: '2',
    title: 'Onion (Pyaz)',
    price: 36,
    originalPrice: 47,
    discount: 23,
    weight: '0.95 - 1.05 kg',
    deliveryTime: '10 MINS',
    recipeCount: 30,
    hasOptions: true,
    image: { uri: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&h=400&fit=crop' },
  },
  {
    id: '3',
    title: 'Lemon',
    price: 27,
    originalPrice: 37,
    discount: 27,
    weight: '220 g - 250 g',
    deliveryTime: '10 MINS',
    recipeCount: 30,
    image: { uri: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=400&fit=crop' },
  },
  {
    id: '4',
    title: 'Ginger (Adrak)',
    price: 40,
    originalPrice: 51,
    discount: 21,
    weight: '200 g',
    deliveryTime: '10 MINS',
    recipeCount: 17,
    image: { uri: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop' },
  },
  {
    id: '5',
    title: 'Tomato (Tamatar)',
    price: 24,
    originalPrice: 30,
    discount: 20,
    weight: '500 g',
    deliveryTime: '10 MINS',
    recipeCount: 45,
    image: { uri: 'https://images.unsplash.com/photo-1546094097-3c3b0b0b0b0b?w=400&h=400&fit=crop' },
  },
  {
    id: '6',
    title: 'Potato (Aloo)',
    price: 32,
    originalPrice: 40,
    discount: 20,
    weight: '1 kg',
    deliveryTime: '10 MINS',
    recipeCount: 50,
    image: { uri: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop' },
  },
  {
    id: '7',
    title: 'Carrot (Gajar)',
    price: 45,
    originalPrice: 55,
    discount: 18,
    weight: '500 g',
    deliveryTime: '10 MINS',
    recipeCount: 22,
    image: { uri: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop' },
  },
  {
    id: '8',
    title: 'Capsicum Green',
    price: 28,
    originalPrice: 35,
    discount: 20,
    weight: '250 g',
    deliveryTime: '10 MINS',
    recipeCount: 15,
    image: { uri: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop' },
  },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'discount', label: 'Discount' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedSort, setSelectedSort] = useState('relevance');

  const handleBackPress = () => {
    console.log('Back pressed');
  };

  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleSubCategoryPress = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
  };

  const handleFavoriteChange = (productId: string, favorite: boolean) => {
    setFavorites(prev => ({ ...prev, [productId]: favorite }));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const handleProductPress = (productId: string) => {
    console.log('Product pressed:', productId);
  };

  const handleRecipePress = (productId: string) => {
    console.log('See recipes for:', productId);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.screenWrapper}>
        {/* Header */}
        <CategoryNavBar
          categoryName="Vegetables & Fruits"
          onBack={handleBackPress}
          onSearchPress={handleSearchPress}
          style={{ paddingTop: insets.top }}
          elevated
        />

        {/* Main Content */}
        <View style={styles.bodyWrapper}>
          {/* Left Sidebar - Subcategories */}
          <View style={styles.leftPanel}>
            <ScrollView
              style={styles.leftPanelScroll}
              contentContainerStyle={styles.leftPanelContent}
              showsVerticalScrollIndicator={false}
            >
              {SUBCATEGORIES.map((subcategory) => {
                const isActive = selectedSubCategory === subcategory.id;
                return (
                  <Pressable
                    key={subcategory.id}
                    onPress={() => handleSubCategoryPress(subcategory.id)}
                    style={[
                      styles.subCategoryItem,
                      isActive && styles.subCategoryItemActive,
                    ]}
                  >
                    {isActive && <View style={styles.activeIndicator} />}
                    <Image
                      source={subcategory.image}
                      width={50}
                      height={50}
                      borderRadius={8}
                    />
                    <Text
                      variant="caption"
                      style={[
                        styles.subCategoryText,
                        isActive && styles.subCategoryTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {subcategory.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Right Panel - Products */}
          <View style={styles.rightPanel}>
            {/* Sort Bar */}
            <View style={styles.sortBar}>
              <SortSelector
                options={SORT_OPTIONS}
                selectedId={selectedSort}
                onChange={setSelectedSort}
              />
            </View>

            {/* Products Grid */}
            <ScrollView
              style={styles.productsScroll}
              contentContainerStyle={styles.productsContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.productsGrid}>
                {PRODUCTS.map((product) => (
                  <View key={product.id} style={styles.productWrapper}>
                    {/* Product Card */}
                    <View style={styles.productCard}>
                      {/* Image Container */}
                      <View style={styles.imageContainer}>
                        <Image
                          source={product.image}
                          width="100%"
                          height={140}
                          borderRadius={8}
                        />
                        {/* Favorite Button */}
                        <Pressable
                          style={styles.favoriteButton}
                          onPress={() => handleFavoriteChange(product.id, !favorites[product.id])}
                        >
                          <Icon
                            name={favorites[product.id] ? 'heart-fill' : 'heart'}
                            size="sm"
                            color={favorites[product.id] ? tokens.colors.semantic.status.error.default : tokens.colors.semantic.text.tertiary}
                          />
                        </Pressable>
                        {/* Add Button */}
                        <View style={styles.addButtonContainer}>
                          {quantities[product.id] ? (
                            <View style={styles.quantityControl}>
                              <Pressable
                                style={styles.quantityButton}
                                onPress={() => handleQuantityChange(product.id, Math.max(0, (quantities[product.id] || 0) - 1))}
                              >
                                <Icon name="minus" size="sm" color={tokens.colors.semantic.status.success.default} />
                              </Pressable>
                              <Text style={styles.quantityText}>{quantities[product.id]}</Text>
                              <Pressable
                                style={styles.quantityButton}
                                onPress={() => handleQuantityChange(product.id, (quantities[product.id] || 0) + 1)}
                              >
                                <Icon name="plus" size="sm" color={tokens.colors.semantic.status.success.default} />
                              </Pressable>
                            </View>
                          ) : (
                            <Pressable
                              style={styles.addButton}
                              onPress={() => handleQuantityChange(product.id, 1)}
                            >
                              <Text style={styles.addButtonText}>ADD</Text>
                              {product.hasOptions && (
                                <Text style={styles.optionsText}>2 options</Text>
                              )}
                            </Pressable>
                          )}
                        </View>
                      </View>

                      {/* Product Info */}
                      <View style={styles.productInfo}>
                        {/* Weight Badge */}
                        <View style={styles.weightBadge}>
                          <Text style={styles.weightText}>{product.weight}</Text>
                        </View>

                        {/* Title */}
                        <Text
                          variant="bodySmall"
                          weight="medium"
                          style={styles.productTitle}
                          numberOfLines={2}
                        >
                          {product.title}
                        </Text>

                        {/* Delivery Time */}
                        <View style={styles.deliveryRow}>
                          <Icon name="time" size="xs" color={tokens.colors.semantic.text.tertiary} />
                          <Text style={styles.deliveryText}>{product.deliveryTime}</Text>
                        </View>

                        {/* Discount */}
                        {product.discount && (
                          <Text style={styles.discountText}>{product.discount}% OFF</Text>
                        )}

                        {/* Price Row */}
                        <View style={styles.priceRow}>
                          <Text style={styles.price}>₹{product.price}</Text>
                          {product.originalPrice && (
                            <Text style={styles.originalPrice}>MRP ₹{product.originalPrice}</Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* See Recipes Link */}
                    {product.recipeCount && (
                      <Pressable
                        style={styles.recipeLink}
                        onPress={() => handleRecipePress(product.id)}
                      >
                        <Text style={styles.recipeLinkText}>See {product.recipeCount} recipes</Text>
                        <Icon name="chevron-right" size="xs" color={tokens.colors.semantic.status.success.default} />
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  screenWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 1440,
    ...(Platform.OS === 'web' && {
      marginHorizontal: 'auto',
    }),
  },
  bodyWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  // Left Panel - Subcategories
  leftPanel: {
    width: 90,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRightWidth: 1,
    borderRightColor: tokens.colors.semantic.border.subtle,
  },
  leftPanelScroll: {
    flex: 1,
  },
  leftPanelContent: {
    paddingVertical: tokens.spacing[2],
  },
  subCategoryItem: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[2],
    position: 'relative',
  },
  subCategoryItemActive: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: tokens.spacing[3],
    bottom: tokens.spacing[3],
    width: 3,
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  subCategoryText: {
    marginTop: tokens.spacing[1],
    textAlign: 'center',
    color: tokens.colors.semantic.text.secondary,
    fontSize: 11,
  },
  subCategoryTextActive: {
    color: tokens.colors.semantic.text.primary,
    fontWeight: '600',
  },
  // Right Panel - Products
  rightPanel: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
    gap: tokens.spacing[2],
  },
  productsScroll: {
    flex: 1,
  },
  productsContent: {
    padding: tokens.spacing[3],
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[3],
  },
  productWrapper: {
    width: '48%',
    marginBottom: tokens.spacing[2],
  },
  productCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: tokens.colors.semantic.surface.tertiary,
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
  addButtonContainer: {
    position: 'absolute',
    bottom: -16,
    right: tokens.spacing[2],
    left: tokens.spacing[2],
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
  addButtonText: {
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '600',
    fontSize: 14,
  },
  optionsText: {
    color: tokens.colors.semantic.status.success.default,
    fontSize: 10,
    marginTop: 2,
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
  weightBadge: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: tokens.spacing[2],
  },
  weightText: {
    fontSize: 11,
    color: tokens.colors.semantic.text.secondary,
  },
  productTitle: {
    marginBottom: tokens.spacing[1],
    lineHeight: 18,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: tokens.spacing[1],
  },
  deliveryText: {
    fontSize: 11,
    color: tokens.colors.semantic.text.tertiary,
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
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.semantic.status.success.subtle,
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[3],
    borderRadius: 8,
    marginTop: tokens.spacing[2],
  },
  recipeLinkText: {
    fontSize: 12,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
  },
});
