import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Platform,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useProduct } from '@/hooks/use-api';
import { useCart } from '@/contexts/cart-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop';

// Transform API product to display format
function transformApiProduct(apiProduct: any): DisplayProduct {
  const images = apiProduct.images?.length > 0
    ? apiProduct.images
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((img: any) => img.cdnUrl || img.url)
    : apiProduct.imageUrl
      ? [apiProduct.imageUrl]
      : [PLACEHOLDER_IMAGE];

  const price = Number(apiProduct.price) || 0;
  const compareAtPrice = apiProduct.compareAtPrice ? Number(apiProduct.compareAtPrice) : null;
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0;

  // Check dietary tags for vegetarian
  const isVegetarian = apiProduct.dietaryTags?.some((tag: string) =>
    tag.toLowerCase().includes('vegan') || tag.toLowerCase().includes('vegetarian')
  ) ?? false;

  return {
    id: apiProduct.id,
    title: apiProduct.name,
    subtitle: apiProduct.shortDescription || apiProduct.brand?.name || '',
    images,
    deliveryTime: '2 hours', // Static for now
    rating: 4.5, // Not in API yet
    reviewCount: 0, // Not in API yet
    isSponsored: false,
    isVegetarian,
    variants: [
      {
        id: '1',
        weight: apiProduct.unitSize || apiProduct.unit || '1 unit',
        price,
        originalPrice: compareAtPrice || undefined,
        discount,
      },
    ],
    highlights: {
      sourced: 'Fresh Daily',
      quality: 'Assured',
      replacement: '48 hours',
      support: '24/7',
    },
    details: {
      unit: apiProduct.unitSize || apiProduct.unit || '1 unit',
      description: apiProduct.description || 'No description available.',
      healthBenefits: 'Healthy & Nutritious',
    },
    info: {
      shelfLife: '5-7 days',
      returnPolicy: 'The product is non-returnable. For a damaged, rotten or incorrect item, you can request a replacement within 48 hours of delivery.',
      countryOfOrigin: 'USA',
      customerCare: 'Email: support@thriptify.com',
      disclaimer: 'Every effort is made to maintain the accuracy of all information. However, actual product packaging and materials may contain more and/or different information.',
    },
  };
}

// Display product type
interface DisplayProduct {
  id: string;
  title: string;
  subtitle: string;
  images: string[];
  deliveryTime: string;
  rating: number;
  reviewCount: number;
  isSponsored: boolean;
  isVegetarian: boolean;
  variants: Array<{
    id: string;
    weight: string;
    price: number;
    originalPrice?: number;
    discount: number;
  }>;
  highlights: {
    sourced: string;
    quality: string;
    replacement: string;
    support: string;
  };
  details: {
    unit: string;
    description: string;
    healthBenefits: string;
  };
  info: {
    shelfLife: string;
    returnPolicy: string;
    countryOfOrigin: string;
    customerCare: string;
    disclaimer: string;
  };
}

// Fallback product data when API fails
const FALLBACK_PRODUCT: DisplayProduct = {
  id: '1',
  title: 'Product Not Found',
  subtitle: '',
  images: [PLACEHOLDER_IMAGE],
  deliveryTime: '2 hours',
  rating: 0,
  reviewCount: 0,
  isSponsored: false,
  isVegetarian: true,
  variants: [
    { id: '1', weight: '1 unit', price: 0, discount: 0 },
  ],
  highlights: {
    sourced: 'Fresh Daily',
    quality: 'Assured',
    replacement: '48 hours',
    support: '24/7',
  },
  details: {
    unit: '1 unit',
    description: 'Product information unavailable.',
    healthBenefits: '-',
  },
  info: {
    shelfLife: '-',
    returnPolicy: '-',
    countryOfOrigin: '-',
    customerCare: 'Email: support@thriptify.com',
    disclaimer: '-',
  },
};

// Related products data
const RELATED_PRODUCTS = [
  {
    id: '101',
    title: 'Green Chilli',
    weight: '100 g',
    price: 1.29,
    originalPrice: 1.59,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=400&fit=crop',
    isVegetarian: true,
    recipeCount: 9,
  },
  {
    id: '102',
    title: 'Lemon',
    weight: '220 g - 250 g',
    price: 1.99,
    originalPrice: 2.49,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=400&fit=crop',
    isVegetarian: true,
    recipeCount: 30,
  },
  {
    id: '103',
    title: 'Ginger',
    weight: '200 g',
    price: 2.79,
    originalPrice: 3.49,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop',
    isVegetarian: true,
    recipeCount: 17,
  },
];

// People also bought
const ALSO_BOUGHT_PRODUCTS = [
  {
    id: '201',
    title: 'Hybrid Tomato',
    weight: '500 g',
    price: 3.49,
    originalPrice: 4.29,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=400&h=400&fit=crop',
    isVegetarian: true,
    hasOptions: true,
  },
  {
    id: '202',
    title: 'Potato',
    weight: '0.95 - 1.05 lb',
    price: 2.19,
    originalPrice: 2.79,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop',
    isVegetarian: true,
    hasOptions: true,
  },
  {
    id: '203',
    title: 'Green Chilli',
    weight: '100 g',
    price: 1.29,
    originalPrice: 1.59,
    deliveryTime: '2 hours',
    image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=400&fit=crop',
    isVegetarian: true,
  },
];

// Recipes for this product
const PRODUCT_RECIPES = [
  {
    id: 'r1',
    title: 'Chicken Fajitas',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=300&h=300&fit=crop',
  },
  {
    id: 'r2',
    title: 'French Onion Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=300&fit=crop',
  },
  {
    id: 'r3',
    title: 'Caramelized Onion Dip',
    image: 'https://images.unsplash.com/photo-1576506542790-51244b486a6b?w=300&h=300&fit=crop',
  },
  {
    id: 'r4',
    title: 'Onion Rings',
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&h=300&fit=crop',
  },
];

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const { addItem, updateQuantity, items } = useCart();

  // Fetch product from API
  const { data: apiProduct, isLoading, error } = useProduct(id);

  // Transform API product to display format
  const product: DisplayProduct = useMemo(() => {
    if (apiProduct) {
      return transformApiProduct(apiProduct);
    }
    return FALLBACK_PRODUCT;
  }, [apiProduct]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    highlights: true,
    info: false,
  });
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Update selected variant when product changes
  useEffect(() => {
    if (product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  // Get quantity from cart
  const cartItem = items.find(item => item.id === product.id);
  const cartQuantity = cartItem?.quantity || 0;

  const handleBack = () => {
    router.back();
  };

  const handleSearch = () => {
    console.log('Open search');
  };

  const handleShare = () => {
    console.log('Share product');
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const handleVariantSelect = (variant: typeof SAMPLE_PRODUCT.variants[0]) => {
    setSelectedVariant(variant);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddToCart = () => {
    // Add to cart context - match CartItem interface
    addItem({
      id: product.id,
      title: product.title,
      price: selectedVariant.price,
      image: product.images[0],
      weight: selectedVariant.weight,
    });
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    if (productId === product.id) {
      // Use cart context for main product
      const newQty = Math.max(0, cartQuantity + delta);
      updateQuantity(product.id, newQty);
    } else {
      // Use local state for related products (they'll add to cart on tap)
      setQuantities(prev => {
        const newQty = Math.max(0, (prev[productId] || 0) + delta);
        return { ...prev, [productId]: newQty };
      });
    }
  };

  const handleRelatedProductAdd = (productId: string) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: 1,
    }));
  };

  const handleRelatedFavoriteToggle = (productId: string) => {
    setFavorites(prev => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const onImageScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageSlide}>
      <Image
        source={{ uri: item }}
        width={SCREEN_WIDTH}
        height={SCREEN_WIDTH * 0.85}
        resizeMode="cover"
      />
      {/* Key features overlay on second image */}
      {index === 1 && (
        <View style={styles.keyFeaturesOverlay}>
          <Text style={styles.keyFeaturesTitle}>Key features</Text>
          <Text style={styles.keyFeaturesLabel}>Health Benefits</Text>
          <Text style={styles.keyFeaturesValue}>{product.details.healthBenefits}</Text>
        </View>
      )}
    </View>
  );

  const renderRelatedProduct = ({ item }: { item: typeof RELATED_PRODUCTS[0] }) => {
    const quantity = quantities[item.id] || 0;
    const isFav = favorites[item.id];
    const discount = item.originalPrice
      ? Math.round((1 - item.price / item.originalPrice) * 100)
      : 0;

    return (
      <Pressable
        style={styles.relatedProductCard}
        onPress={() => handleProductPress(item.id)}
      >
        <View style={styles.relatedProductImageContainer}>
          <Image
            source={{ uri: item.image }}
            width="100%"
            height={100}
            borderRadius={8}
          />
          <Pressable
            style={styles.relatedFavoriteButton}
            onPress={() => handleRelatedFavoriteToggle(item.id)}
          >
            <Icon
              name={isFav ? 'heart-fill' : 'heart'}
              size="xs"
              color={isFav ? tokens.colors.semantic.status.error.default : tokens.colors.semantic.text.tertiary}
            />
          </Pressable>
          <View style={styles.relatedAddButtonContainer}>
            {quantity > 0 ? (
              <View style={styles.relatedQuantityControl}>
                <Pressable
                  style={styles.relatedQuantityButton}
                  onPress={() => handleQuantityChange(item.id, -1)}
                >
                  <Icon name="minus" size="xs" color={tokens.colors.semantic.surface.primary} />
                </Pressable>
                <Text style={styles.relatedQuantityText}>{quantity}</Text>
                <Pressable
                  style={styles.relatedQuantityButton}
                  onPress={() => handleQuantityChange(item.id, 1)}
                >
                  <Icon name="plus" size="xs" color={tokens.colors.semantic.surface.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.relatedAddButton}
                onPress={() => handleRelatedProductAdd(item.id)}
              >
                <Text style={styles.relatedAddButtonText}>ADD</Text>
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.relatedProductInfo}>
          <View style={styles.relatedWeightBadge}>
            <Text style={styles.relatedWeightText}>{item.weight}</Text>
          </View>
          <Text variant="caption" weight="medium" numberOfLines={2} style={styles.relatedProductTitle}>
            {item.title}
          </Text>
          <View style={styles.relatedDeliveryRow}>
            <Icon name="time" size="xs" color={tokens.colors.semantic.status.success.default} />
            <Text style={styles.relatedDeliveryText}>{item.deliveryTime}</Text>
          </View>
          {discount > 0 && (
            <Text style={styles.relatedDiscountText}>{discount}% OFF</Text>
          )}
          <View style={styles.relatedPriceRow}>
            <Text style={styles.relatedPrice}>${item.price.toFixed(2)}</Text>
            {item.originalPrice && (
              <Text style={styles.relatedOriginalPrice}>${item.originalPrice.toFixed(2)}</Text>
            )}
          </View>
          {item.recipeCount && (
            <Pressable style={styles.relatedRecipeLink}>
              <Text style={styles.relatedRecipeLinkText}>See {item.recipeCount} recipes</Text>
              <Icon name="chevron-right" size="xs" color={tokens.colors.semantic.brand.primary.default} />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  const renderRecipeItem = ({ item }: { item: typeof PRODUCT_RECIPES[0] }) => (
    <Pressable style={styles.recipeCard}>
      <Image
        source={{ uri: item.image }}
        width={100}
        height={80}
        borderRadius={8}
      />
      <Text variant="caption" weight="medium" numberOfLines={2} style={styles.recipeTitle}>
        {item.title}
      </Text>
    </Pressable>
  );

  const quantity = cartQuantity; // Use cart quantity for bottom bar

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  // Error state
  if (error && !apiProduct) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <View style={[styles.headerOverlay, { paddingTop: insets.top + tokens.spacing[2] }]}>
          <Pressable style={styles.headerButton} onPress={handleBack}>
            <Icon name="chevron-down" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
        </View>
        <Icon name="alert-circle" size="xl" color={tokens.colors.semantic.status.error.default} />
        <Text variant="h4" weight="semibold" style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorText}>Unable to load product details. Please try again.</Text>
        <Pressable style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          <FlatList
            ref={flatListRef}
            data={product.images}
            renderItem={renderImageItem}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onImageScroll}
            scrollEventThrottle={16}
          />

          {/* Header buttons overlay */}
          <View style={[styles.headerOverlay, { paddingTop: insets.top + tokens.spacing[2] }]}>
            <Pressable style={styles.headerButton} onPress={handleBack}>
              <Icon name="chevron-down" size="md" color={tokens.colors.semantic.text.primary} />
            </Pressable>
            <View style={styles.headerRightButtons}>
              <Pressable style={styles.headerButton} onPress={handleFavoriteToggle}>
                <Icon
                  name={isFavorite ? 'heart-fill' : 'heart'}
                  size="md"
                  color={isFavorite ? tokens.colors.semantic.status.error.default : tokens.colors.semantic.text.primary}
                />
              </Pressable>
              <Pressable style={styles.headerButton} onPress={handleSearch}>
                <Icon name="search" size="md" color={tokens.colors.semantic.text.primary} />
              </Pressable>
              <Pressable style={styles.headerButton} onPress={handleShare}>
                <Icon name="share" size="md" color={tokens.colors.semantic.text.primary} />
              </Pressable>
            </View>
          </View>

          {/* Pagination dots */}
          <View style={styles.paginationContainer}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          {/* Delivery time badge */}
          <View style={styles.deliveryBadge}>
            <Icon name="time" size="xs" color={tokens.colors.semantic.status.success.default} />
            <Text style={styles.deliveryBadgeText}>{product.deliveryTime}</Text>
          </View>
        </View>

        {/* Product Info Section */}
        <View style={styles.productInfoSection}>
          {/* Rating and reviews */}
          {product.rating > 0 && product.reviewCount > 0 && (
            <View style={styles.ratingRow}>
              <Icon name="star-fill" size="xs" color="#FFB800" />
              <Icon name="star-fill" size="xs" color="#FFB800" />
              <Icon name="star-fill" size="xs" color="#FFB800" />
              <Icon name="star-fill" size="xs" color="#FFB800" />
              <Icon name="star" size="xs" color="#FFB800" />
              <Text style={styles.ratingCount}>({product.reviewCount.toLocaleString()})</Text>
              {product.isSponsored && <Text style={styles.sponsoredLabel}>Ad</Text>}
            </View>
          )}

          {/* Product Title */}
          <View style={styles.titleRow}>
            <Text variant="h3" weight="semibold" style={styles.productTitle}>
              {product.title}
            </Text>
            {!product.isVegetarian && (
              <View style={styles.nonVegBadge}>
                <View style={styles.nonVegDot} />
              </View>
            )}
            {product.isVegetarian && (
              <View style={styles.vegBadge}>
                <View style={styles.vegDot} />
              </View>
            )}
          </View>

          {/* Variant Selector */}
          <Text style={styles.selectUnitLabel}>Select Unit</Text>
          <View style={styles.variantContainer}>
            {product.variants.map((variant) => (
              <Pressable
                key={variant.id}
                style={[
                  styles.variantOption,
                  selectedVariant.id === variant.id && styles.variantOptionSelected,
                ]}
                onPress={() => handleVariantSelect(variant)}
              >
                {variant.discount > 0 && (
                  <View style={styles.variantDiscountBadge}>
                    <Text style={styles.variantDiscountText}>{variant.discount}% OFF</Text>
                  </View>
                )}
                <Text style={styles.variantWeight}>{variant.weight}</Text>
                <View style={styles.variantPriceRow}>
                  <Text style={styles.variantPrice}>${variant.price.toFixed(2)}</Text>
                  {variant.originalPrice && (
                    <Text style={styles.variantOriginalPrice}>
                      MRP ${variant.originalPrice.toFixed(2)}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {/* View product details */}
          <Pressable
            style={styles.viewDetailsButton}
            onPress={() => toggleSection('highlights')}
          >
            <Text style={styles.viewDetailsText}>View product details</Text>
            <Icon
              name={expandedSections.highlights ? 'chevron-up' : 'chevron-down'}
              size="sm"
              color={tokens.colors.semantic.brand.primary.default}
            />
          </Pressable>
        </View>

        {/* Product Details Sections */}
        {expandedSections.highlights && (
          <View style={styles.detailsSection}>
            {/* Trust badges */}
            <View style={styles.trustBadgesContainer}>
              <View style={styles.trustBadge}>
                <Icon name="bag" size="md" color={tokens.colors.semantic.text.secondary} />
                <Text style={styles.trustBadgeTitle}>Sourced</Text>
                <Text style={styles.trustBadgeValue}>{product.highlights.sourced}</Text>
              </View>
              <View style={styles.trustBadge}>
                <Icon name="check-circle" size="md" color={tokens.colors.semantic.text.secondary} />
                <Text style={styles.trustBadgeTitle}>Quality</Text>
                <Text style={styles.trustBadgeValue}>{product.highlights.quality}</Text>
              </View>
              <View style={styles.trustBadge}>
                <Icon name="refresh" size="md" color={tokens.colors.semantic.text.secondary} />
                <Text style={styles.trustBadgeTitle}>{product.highlights.replacement}</Text>
                <Text style={styles.trustBadgeValue}>Replacement</Text>
              </View>
              <View style={styles.trustBadge}>
                <Icon name="user" size="md" color={tokens.colors.semantic.text.secondary} />
                <Text style={styles.trustBadgeTitle}>{product.highlights.support}</Text>
                <Text style={styles.trustBadgeValue}>Support</Text>
              </View>
            </View>

            {/* Highlights accordion */}
            <View style={styles.accordionSection}>
              <Pressable
                style={styles.accordionHeader}
                onPress={() => toggleSection('highlights')}
              >
                <Text variant="body" weight="semibold">Highlights</Text>
                <Icon
                  name={expandedSections.highlights ? 'chevron-up' : 'chevron-down'}
                  size="sm"
                  color={tokens.colors.semantic.text.secondary}
                />
              </Pressable>
              <View style={styles.accordionContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Unit</Text>
                  <Text style={styles.detailValue}>{product.details.unit}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{product.details.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Health Benefits</Text>
                  <Text style={[styles.detailValue, styles.healthBenefitsText]}>
                    {product.details.healthBenefits}
                  </Text>
                </View>
              </View>
            </View>

            {/* Info accordion */}
            <View style={styles.accordionSection}>
              <Pressable
                style={styles.accordionHeader}
                onPress={() => toggleSection('info')}
              >
                <Text variant="body" weight="semibold">Info</Text>
                <Icon
                  name={expandedSections.info ? 'chevron-up' : 'chevron-down'}
                  size="sm"
                  color={tokens.colors.semantic.text.secondary}
                />
              </Pressable>
              {expandedSections.info && (
                <View style={styles.accordionContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Shelf Life</Text>
                    <Text style={styles.detailValue}>{product.info.shelfLife}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Return Policy</Text>
                    <Text style={styles.detailValue}>{product.info.returnPolicy}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Country of Origin</Text>
                    <Text style={styles.detailValue}>{product.info.countryOfOrigin}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Customer Care Details</Text>
                    <Text style={styles.detailValue}>{product.info.customerCare}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Disclaimer</Text>
                    <Text style={styles.detailValue}>{product.info.disclaimer}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Top products in this category */}
        <View style={styles.relatedSection}>
          <Text variant="h4" weight="semibold" style={styles.relatedSectionTitle}>
            Top products in this category
          </Text>
          <FlatList
            data={RELATED_PRODUCTS}
            renderItem={renderRelatedProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedProductsContent}
          />
        </View>

        {/* Recipes section */}
        <View style={styles.relatedSection}>
          <Text variant="h4" weight="semibold" style={styles.relatedSectionTitle}>
            Onion recipes for you
          </Text>
          <FlatList
            data={PRODUCT_RECIPES}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipesContent}
          />
        </View>

        {/* People also bought */}
        <View style={styles.relatedSection}>
          <Text variant="h4" weight="semibold" style={styles.relatedSectionTitle}>
            People also bought
          </Text>
          <FlatList
            data={ALSO_BOUGHT_PRODUCTS}
            renderItem={renderRelatedProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedProductsContent}
          />
        </View>

        {/* See all products button */}
        <Pressable style={styles.seeAllProductsButton}>
          <View style={styles.seeAllProductsImages}>
            {RELATED_PRODUCTS.slice(0, 3).map((p, index) => (
              <Image
                key={p.id}
                source={{ uri: p.image }}
                width={30}
                height={30}
                borderRadius={15}
                style={[styles.seeAllProductImage, { marginLeft: index > 0 ? -10 : 0 }]}
              />
            ))}
          </View>
          <Text style={styles.seeAllProductsText}>See all products</Text>
          <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.primary} />
        </Pressable>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + tokens.spacing[3] }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarWeight}>{selectedVariant.weight}</Text>
          <View style={styles.bottomBarPriceRow}>
            <Text style={styles.bottomBarPrice}>${selectedVariant.price.toFixed(2)}</Text>
            {selectedVariant.originalPrice && (
              <Text style={styles.bottomBarOriginalPrice}>
                MRP ${selectedVariant.originalPrice.toFixed(2)}
              </Text>
            )}
            {selectedVariant.discount > 0 && (
              <View style={styles.bottomBarDiscountBadge}>
                <Text style={styles.bottomBarDiscountText}>{selectedVariant.discount}% OFF</Text>
              </View>
            )}
          </View>
          <Text style={styles.bottomBarTaxInfo}>Inclusive of all taxes</Text>
        </View>
        {quantity > 0 ? (
          <View style={styles.bottomBarQuantityControl}>
            <Pressable
              style={styles.bottomBarQuantityButton}
              onPress={() => handleQuantityChange(product.id, -1)}
            >
              <Icon name="minus" size="md" color={tokens.colors.semantic.surface.primary} />
            </Pressable>
            <Text style={styles.bottomBarQuantityText}>{quantity}</Text>
            <Pressable
              style={styles.bottomBarQuantityButton}
              onPress={() => handleQuantityChange(product.id, 1)}
            >
              <Icon name="plus" size="md" color={tokens.colors.semantic.surface.primary} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to cart</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: tokens.spacing[3],
    color: tokens.colors.semantic.text.secondary,
    fontSize: tokens.typography.fontSize.sm,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[6],
  },
  errorTitle: {
    marginTop: tokens.spacing[4],
    marginBottom: tokens.spacing[2],
    textAlign: 'center',
  },
  errorText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: tokens.typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: tokens.spacing[4],
  },
  retryButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[6],
    borderRadius: tokens.radius.lg,
  },
  retryButtonText: {
    color: tokens.colors.semantic.text.inverse,
    fontWeight: String(tokens.typography.fontWeight.semibold) as '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Image Gallery
  imageGalleryContainer: {
    position: 'relative',
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  keyFeaturesOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: tokens.spacing[4],
    justifyContent: 'center',
  },
  keyFeaturesTitle: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: tokens.spacing[2],
  },
  keyFeaturesLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: tokens.spacing[1],
  },
  keyFeaturesValue: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 14,
    fontWeight: '500',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        }),
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: tokens.spacing[2],
  },
  paginationContainer: {
    position: 'absolute',
    bottom: tokens.spacing[4],
    right: tokens.spacing[4],
    flexDirection: 'row',
    gap: tokens.spacing[1],
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    width: 18,
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: tokens.spacing[4],
    left: tokens.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: 4,
    gap: 4,
  },
  deliveryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  // Product Info Section
  productInfoSection: {
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: tokens.spacing[2],
  },
  ratingCount: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    marginLeft: tokens.spacing[1],
  },
  sponsoredLabel: {
    fontSize: 10,
    color: tokens.colors.semantic.text.tertiary,
    marginLeft: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    paddingHorizontal: tokens.spacing[1],
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[3],
  },
  productTitle: {
    flex: 1,
  },
  vegBadge: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  nonVegBadge: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: tokens.colors.semantic.status.error.default,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  nonVegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.semantic.status.error.default,
  },
  selectUnitLabel: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[2],
  },
  variantContainer: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[4],
  },
  variantOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    borderRadius: 12,
    padding: tokens.spacing[3],
    position: 'relative',
    overflow: 'hidden',
  },
  variantOptionSelected: {
    borderColor: tokens.colors.semantic.brand.primary.default,
    borderWidth: 2,
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
  },
  variantDiscountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingVertical: 2,
    alignItems: 'center',
  },
  variantDiscountText: {
    fontSize: 10,
    fontWeight: '600',
    color: tokens.colors.semantic.text.inverse,
  },
  variantWeight: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
    marginTop: tokens.spacing[3],
    marginBottom: tokens.spacing[1],
  },
  variantPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  variantPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  variantOriginalPrice: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  viewDetailsText: {
    fontSize: 14,
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
  // Details Section
  detailsSection: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingHorizontal: tokens.spacing[4],
  },
  trustBadgesContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    borderRadius: 12,
    marginBottom: tokens.spacing[4],
  },
  trustBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
    borderRightWidth: 1,
    borderRightColor: tokens.colors.semantic.border.default,
  },
  trustBadgeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    marginTop: tokens.spacing[1],
  },
  trustBadgeValue: {
    fontSize: 10,
    color: tokens.colors.semantic.text.secondary,
  },
  accordionSection: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing[4],
  },
  accordionContent: {
    paddingBottom: tokens.spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: tokens.spacing[3],
  },
  detailLabel: {
    width: 100,
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: tokens.colors.semantic.text.primary,
    lineHeight: 20,
  },
  healthBenefitsText: {
    color: tokens.colors.semantic.brand.primary.default,
  },
  // Related Section
  relatedSection: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    paddingVertical: tokens.spacing[4],
  },
  relatedSectionTitle: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  relatedProductsContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  relatedProductCard: {
    width: 120,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  relatedProductImageContainer: {
    position: 'relative',
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  relatedFavoriteButton: {
    position: 'absolute',
    top: tokens.spacing[1],
    right: tokens.spacing[1],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedAddButtonContainer: {
    position: 'absolute',
    bottom: -12,
    left: tokens.spacing[2],
    right: tokens.spacing[2],
    alignItems: 'center',
  },
  relatedAddButton: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: 6,
    paddingVertical: tokens.spacing[1],
    paddingHorizontal: tokens.spacing[3],
  },
  relatedAddButtonText: {
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '600',
    fontSize: 12,
  },
  relatedQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: tokens.spacing[1],
  },
  relatedQuantityButton: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedQuantityText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 12,
    minWidth: 18,
    textAlign: 'center',
  },
  relatedProductInfo: {
    padding: tokens.spacing[2],
    paddingTop: tokens.spacing[4],
  },
  relatedWeightBadge: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    paddingHorizontal: tokens.spacing[1],
    paddingVertical: 1,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: tokens.spacing[1],
  },
  relatedWeightText: {
    fontSize: 9,
    color: tokens.colors.semantic.text.secondary,
  },
  relatedProductTitle: {
    marginBottom: tokens.spacing[1],
    lineHeight: 14,
    fontSize: 11,
  },
  relatedDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: tokens.spacing[1],
  },
  relatedDeliveryText: {
    fontSize: 9,
    color: tokens.colors.semantic.status.success.default,
  },
  relatedDiscountText: {
    fontSize: 10,
    color: tokens.colors.semantic.status.success.default,
    fontWeight: '500',
    marginBottom: tokens.spacing[1],
  },
  relatedPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  relatedPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  relatedOriginalPrice: {
    fontSize: 10,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  relatedRecipeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing[1],
    paddingTop: tokens.spacing[1],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  relatedRecipeLinkText: {
    fontSize: 10,
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '500',
  },
  // Recipes Section
  recipesContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  recipeCard: {
    width: 100,
    alignItems: 'center',
  },
  recipeTitle: {
    textAlign: 'center',
    marginTop: tokens.spacing[2],
    fontSize: 11,
    lineHeight: 14,
  },
  // See all products button
  seeAllProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: tokens.spacing[4],
    marginVertical: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    borderRadius: 12,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  seeAllProductsImages: {
    flexDirection: 'row',
    marginRight: tokens.spacing[2],
  },
  seeAllProductImage: {
    borderWidth: 2,
    borderColor: tokens.colors.semantic.surface.primary,
  },
  seeAllProductsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 -4px 12px rgba(0,0,0,0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }),
  },
  bottomBarLeft: {
    flex: 1,
  },
  bottomBarWeight: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: 2,
  },
  bottomBarPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  bottomBarPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  bottomBarOriginalPrice: {
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
    textDecorationLine: 'line-through',
  },
  bottomBarDiscountBadge: {
    backgroundColor: tokens.colors.semantic.status.success.subtle,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  bottomBarDiscountText: {
    fontSize: 10,
    fontWeight: '600',
    color: tokens.colors.semantic.status.success.default,
  },
  bottomBarTaxInfo: {
    fontSize: 10,
    color: tokens.colors.semantic.text.tertiary,
    marginTop: 2,
  },
  addToCartButton: {
    backgroundColor: tokens.colors.semantic.status.success.default,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[6],
    borderRadius: 12,
  },
  addToCartText: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBarQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 12,
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[3],
  },
  bottomBarQuantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarQuantityText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 18,
    minWidth: 36,
    textAlign: 'center',
  },
});
