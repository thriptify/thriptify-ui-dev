import { View, Animated } from 'react-native';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { tokens } from '@thriptify/tokens/react-native';
import { useCart } from '@/contexts/cart-context';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { CollapsibleHeader } from '@/components/collapsible-header';
import { StoryCarousel } from '@/components/carousels';
import {
  BannersSection,
  DealsSection,
  BestsellersSection,
  GroceriesSection,
  FeaturedProductsSection,
  RecipesSection,
  FeaturedProduct,
} from '@/components/home-sections';
import { HOME_SECTIONS_CONFIG, getEnabledSections, SectionId } from '@/config/home-sections';

// Category tabs data
const CATEGORY_TABS = [
  { id: 'all', label: 'All', icon: 'bag' },
  { id: 'groceries', label: 'Groceries', icon: 'nutrition' },
  { id: 'recipes', label: 'Recipes', icon: 'book' },
  { id: 'household', label: 'Household', icon: 'home' },
  { id: 'beauty', label: 'Beauty', icon: 'sparkles' },
  { id: 'electronics', label: 'Electronics', icon: 'flash' },
];

// Story carousel data (always first)
const STORY_ITEMS = [
  { id: '1', title: 'New Arrivals', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop', isNew: true },
  { id: '2', title: 'Organic', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=150&h=150&fit=crop', gradientColors: ['#4CAF50', '#8BC34A'] as [string, string] },
  { id: '3', title: 'Dairy', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&h=150&fit=crop', gradientColors: ['#2196F3', '#03A9F4'] as [string, string] },
  { id: '4', title: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&h=150&fit=crop', gradientColors: ['#FF9800', '#FFC107'] as [string, string] },
  { id: '5', title: 'Snacks', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=150&h=150&fit=crop', gradientColors: ['#E91E63', '#F44336'] as [string, string] },
  { id: '6', title: 'Beverages', image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=150&h=150&fit=crop', gradientColors: ['#9C27B0', '#673AB7'] as [string, string] },
];

// Banner carousel data
const BANNER_ITEMS = [
  {
    id: '1',
    title: 'Fresh Organic Produce',
    subtitle: 'Get 20% off on your first order',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=300&fit=crop',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
  },
  {
    id: '2',
    title: 'Weekly Meal Kits',
    subtitle: 'Ready-to-cook meals delivered',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop',
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  {
    id: '3',
    title: 'Free Delivery',
    subtitle: 'On orders above $30',
    image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=300&h=300&fit=crop',
    backgroundColor: tokens.colors.primitives.purple[500],
  },
];

// Deal carousel data
const DEAL_ITEMS = [
  {
    id: '1',
    title: 'Fresh Strawberries 500g',
    discount: '-30%',
    originalPrice: 7.99,
    salePrice: 5.49,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop',
    endsIn: '2h 30m',
  },
  {
    id: '2',
    title: 'Organic Avocados Pack',
    discount: '-25%',
    originalPrice: 6.99,
    salePrice: 4.99,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop',
    endsIn: '1h 45m',
  },
  {
    id: '3',
    title: 'Greek Yogurt 1kg',
    discount: '-40%',
    originalPrice: 8.99,
    salePrice: 5.39,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop',
    endsIn: '3h 15m',
  },
  {
    id: '4',
    title: 'Artisan Sourdough',
    discount: '-20%',
    originalPrice: 5.99,
    salePrice: 4.79,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
    endsIn: '4h 00m',
  },
];

// Bestseller categories
const BESTSELLER_CATEGORIES = [
  {
    id: 'vegetables',
    title: 'Vegetables & Fruits',
    moreCount: 129,
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&h=100&fit=crop',
    ],
  },
  {
    id: 'dairy',
    title: 'Dairy, Bread & Eggs',
    moreCount: 33,
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=100&h=100&fit=crop',
    ],
  },
  {
    id: 'snacks',
    title: 'Snacks & Beverages',
    moreCount: 260,
    images: [
      'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop',
    ],
  },
];

// Grocery categories grid
const GROCERY_CATEGORIES = [
  { id: 'veggies', title: 'Vegetables & Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop' },
  { id: 'rice', title: 'Rice & Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
  { id: 'oil', title: 'Oil & Spices', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop' },
  { id: 'dairy', title: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop' },
  { id: 'bakery', title: 'Bakery & Bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop' },
  { id: 'meat', title: 'Meat & Seafood', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop' },
  { id: 'frozen', title: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=200&h=200&fit=crop' },
  { id: 'pantry', title: 'Pantry Staples', image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=200&h=200&fit=crop' },
];

// Featured products
const FEATURED_PRODUCTS = [
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
  },
];

// Recipe categories
const RECIPE_CATEGORIES = [
  { id: 'quick', title: 'Quick & Easy', subtitle: '30 mins or less', image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&h=200&fit=crop' },
  { id: 'healthy', title: 'Healthy', subtitle: 'Nutritious meals', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
  { id: 'comfort', title: 'Comfort Food', subtitle: 'Family favorites', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=200&h=200&fit=crop' },
  { id: 'desserts', title: 'Desserts', subtitle: 'Sweet treats', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [selectedTab, setSelectedTab] = useState('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Scroll animation for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;

  // Get enabled sections from config
  const enabledSections = getEnabledSections(HOME_SECTIONS_CONFIG);

  const handleSearchFocus = () => {
    router.push('/search');
  };

  const handleSearch = (text: string) => {
    router.push(`/search?q=${encodeURIComponent(text)}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  const handleRecipesPress = () => {
    router.push('/recipes');
  };

  const handleRecipeCategoryPress = (categoryId: string) => {
    router.push(`/recipes?category=${categoryId}`);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddToCart = useCallback((product: FeaturedProduct) => {
    addItem({
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      weight: '1 unit',
      isVegetarian: product.isVegetarian,
    });
  }, [addItem]);

  const handleQuantityChange = useCallback((productId: string, delta: number) => {
    const currentQty = getItemQuantity(productId);
    updateQuantity(productId, currentQty + delta);
  }, [getItemQuantity, updateQuantity]);

  // Render section based on section ID
  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'banners':
        return <BannersSection key={sectionId} items={BANNER_ITEMS} />;
      case 'deals':
        return (
          <DealsSection
            key={sectionId}
            items={DEAL_ITEMS}
            onSeeAll={() => router.push('/deals')}
          />
        );
      case 'bestsellers':
        return (
          <BestsellersSection
            key={sectionId}
            items={BESTSELLER_CATEGORIES}
            onCategoryPress={handleCategoryPress}
          />
        );
      case 'groceries':
        return (
          <GroceriesSection
            key={sectionId}
            items={GROCERY_CATEGORIES}
            onCategoryPress={handleCategoryPress}
          />
        );
      case 'featured':
        return (
          <FeaturedProductsSection
            key={sectionId}
            items={FEATURED_PRODUCTS}
            favorites={favorites}
            getItemQuantity={getItemQuantity}
            onProductPress={handleProductPress}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToCart={handleAddToCart}
            onQuantityChange={handleQuantityChange}
          />
        );
      case 'recipes':
        return (
          <RecipesSection
            key={sectionId}
            items={RECIPE_CATEGORIES}
            onCategoryPress={handleRecipeCategoryPress}
            onSeeAll={handleRecipesPress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CollapsibleHeader
        scrollY={scrollY}
        searchPlaceholder="Search groceries, recipes..."
        onSearch={handleSearch}
        onSearchFocus={handleSearchFocus}
        tabs={CATEGORY_TABS}
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
      >
        {/* Story Carousel - Always first (order: 1) */}
        <StoryCarousel items={STORY_ITEMS} />

        {/* Dynamic sections based on config */}
        {enabledSections.map(renderSection)}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </CollapsibleHeader>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </View>
  );
}
