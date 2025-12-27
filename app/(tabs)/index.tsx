import { View, Text, Animated, ActivityIndicator, Modal, Platform } from 'react-native';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppAuth } from '@/contexts/auth-context';
import { tokens } from '@thriptify/tokens/react-native';
import { useCart } from '@/contexts/cart-context';
import { useLocation, DeliveryAddress } from '@/contexts/location-context';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { CollapsibleHeader } from '@/components/collapsible-header';
import { StoryCarousel } from '@/components/carousels';
import { SectionRenderer, type Section, type ProductSectionItem, type StorySectionItem } from '@/components/sections';
import { useTabs, useTabSections, type TabPage } from '@/hooks/use-api';
import { AddressEntry } from '@/components/address';
import { SubcategoryPickerModal, type CategoryWithSubcategories } from '@/components/modals';

// Fallback category tabs (used when API fails)
const FALLBACK_CATEGORY_TABS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'groceries', label: 'Groceries', icon: 'nutrition' },
  { id: 'recipes', label: 'Recipes', icon: 'book' },
  { id: 'household', label: 'Household', icon: 'home' },
  { id: 'beauty', label: 'Beauty', icon: 'sparkles' },
];

// Transform API tabs to UI format
function transformTabsToUI(tabs: TabPage[]): { id: string; label: string; icon: string }[] {
  return tabs.map(tab => ({
    id: tab.slug,
    label: tab.title,
    icon: tab.icon || 'grid', // Default icon if null
  }));
}


export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading: isAuthLoading, getToken } = useAppAuth();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const { hasSetLocation, setDeliveryAddress, isLoading: isLocationLoading } = useLocation();
  const [selectedTab, setSelectedTab] = useState('home'); // Default to home tab
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [hasWaitedForSync, setHasWaitedForSync] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);
  // Drill-down modal state for category selection
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<CategoryWithSubcategories | null>(null);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  // Scroll animation for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;

  // For signed-in users, wait a bit for backend sync before showing modal
  useEffect(() => {
    if (isAuthLoading || isLocationLoading) return;

    // If location is already set, skip showing modal
    if (hasSetLocation) {
      setHasShownModal(true);
      return;
    }

    if (isAuthenticated && !hasSetLocation && !hasWaitedForSync) {
      // Give backend sync 1.5 seconds to complete
      const timer = setTimeout(() => {
        setHasWaitedForSync(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (!isAuthenticated) {
      setHasWaitedForSync(true);
    }
  }, [isAuthLoading, isAuthenticated, isLocationLoading, hasSetLocation, hasWaitedForSync]);

  // Show address modal automatically if location not set (after sync attempt)
  // Only show once per session to avoid showing again after returning from checkout
  useEffect(() => {
    if (!isLocationLoading && !hasSetLocation && hasWaitedForSync && !hasShownModal) {
      setShowAddressModal(true);
      setHasShownModal(true);
    } else if (hasSetLocation) {
      setShowAddressModal(false);
    }
  }, [isLocationLoading, hasSetLocation, hasWaitedForSync, hasShownModal]);

  // Handle address verified from modal
  const handleAddressVerified = async (address: DeliveryAddress) => {
    try {
      await setDeliveryAddress(address);
      setShowAddressModal(false);
    } catch (error) {
      console.error('[Home] Error setting address:', error);
    }
  };

  // Handle modal dismiss - use default Overland Park location
  const handleDismissModal = async () => {
    if (hasSetLocation) {
      setShowAddressModal(false);
      return;
    }

    // Use default Overland Park location when dismissed without address
    const defaultAddress: DeliveryAddress = {
      streetAddress: '7500 W 119th St',
      city: 'Overland Park',
      state: 'KS',
      zip: '66213',
      latitude: 38.9108,
      longitude: -94.6639,
      label: 'home',
      isDefault: true,
    };

    try {
      // If signed in, save address to backend
      if (isAuthenticated) {
        try {
          const token = await getToken();
          if (token) {
            const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.thriptify.com';
            const response = await fetch(`${API_BASE_URL}/api/v1/customer/addresses`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                label: 'home',
                addressLine1: defaultAddress.streetAddress,
                city: defaultAddress.city,
                state: defaultAddress.state,
                postalCode: defaultAddress.zip,
                country: 'US',
                latitude: defaultAddress.latitude,
                longitude: defaultAddress.longitude,
                isDefault: true,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              defaultAddress.id = data.address?.id;
            }
          }
        } catch (err) {
          console.warn('[Home] Failed to save address to backend:', err);
        }
      }

      await setDeliveryAddress(defaultAddress);
    } catch (error) {
      console.error('[Home] Error setting default address:', error);
    }
    setShowAddressModal(false);
  };

  // Fetch tabs from API
  const { data: tabsData } = useTabs();

  // Set initial tab based on API's isDefault flag
  useEffect(() => {
    if (tabsData && tabsData.length > 0) {
      const defaultTab = tabsData.find(tab => tab.isDefault);
      if (defaultTab) {
        setSelectedTab(defaultTab.slug);
      } else {
        // Fall back to first tab if no default is set
        setSelectedTab(tabsData[0].slug);
      }
    }
  }, [tabsData]);

  // Fetch sections for selected tab
  const { data: tabSectionsData, isLoading: isTabSectionsLoading, refetch: refetchSections } = useTabSections(selectedTab);

  // Transform tabs from API or use fallback
  const categoryTabs = useMemo(() => {
    if (tabsData && tabsData.length > 0) {
      return transformTabsToUI(tabsData);
    }
    return FALLBACK_CATEGORY_TABS;
  }, [tabsData]);

  // Get sections from API response
  const sections = useMemo((): Section[] => {
    if (tabSectionsData?.sections) {
      return tabSectionsData.sections as Section[];
    }
    return [];
  }, [tabSectionsData]);

  // Get story items from first stories section or use fallback
  const storyItems = useMemo(() => {
    const storiesSection = sections.find(s => s.sectionType === 'stories');
    if (storiesSection && storiesSection.items && storiesSection.items.length > 0) {
      // Transform API story items to StoryCarousel format
      const items = storiesSection.items as StorySectionItem[];
      const transformedItems = items
        .filter(item => item.thumbnailUrl) // Only include items with thumbnail
        .map((item) => ({
          id: item.id,
          title: item.title,
          image: item.thumbnailUrl,
          isNew: item.hasUnviewed,
          slides: (item.items && item.items.length > 0)
            ? item.items.map((slide) => ({
                id: slide.id,
                image: slide.type === 'image' ? slide.mediaUrl : (slide.thumbnailUrl || slide.mediaUrl),
                caption: slide.linkText || undefined,
                link: slide.linkId ? {
                  text: slide.linkText || 'View',
                  url: `/${slide.linkType}/${slide.linkId}`,
                } : undefined,
              }))
            : [{ id: `${item.id}-fallback`, image: item.thumbnailUrl, caption: item.title }], // Fallback slide
        }));

      // Only use transformed items if we have valid ones
      if (transformedItems.length > 0) {
        return transformedItems;
      }
    }
    return [];
  }, [sections]);

  // Filter out stories section from regular sections (it's rendered separately)
  const contentSections = useMemo(() => {
    return sections.filter(s => s.sectionType !== 'stories');
  }, [sections]);

  const handleSearchFocus = () => {
    router.push('/search');
  };

  const handleSearch = (text: string) => {
    router.push(`/search?q=${encodeURIComponent(text)}`);
  };

  // Handle category press - show drill-down modal if category has subcategories
  const handleCategoryPress = (categoryId: string) => {
    // Find the category in the sections data
    const categoriesSection = tabSectionsData?.sections?.find((s: any) => s.sectionType === 'categories');
    if (categoriesSection?.items) {
      const category = (categoriesSection.items as any[]).find(c => c.id === categoryId);
      if (category && category.children && category.children.length > 0) {
        // Show drill-down modal for categories with subcategories
        setSelectedCategoryForModal({
          id: category.id,
          name: category.name,
          slug: category.slug,
          imageUrl: category.imageUrl,
          children: category.children,
        });
        setShowSubcategoryModal(true);
        return;
      }
    }
    // No subcategories - navigate directly to category
    router.push(`/category/${categoryId}`);
  };

  // Handle subcategory selection from drill-down modal
  const handleSubcategorySelect = (subcategoryId: string, _subcategoryName: string) => {
    router.push(`/category/${subcategoryId}`);
  };

  // Handle "View All" from drill-down modal
  const handleViewAllCategory = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  const handleBrandPress = (brandId: string) => {
    router.push(`/products?brand=${brandId}` as any);
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleRecipeCategoryPress = (categorySlug: string) => {
    router.push(`/recipes?category=${categorySlug}` as any);
  };

  const handleRecipeTagPress = (tagSlug: string) => {
    router.push(`/recipes?tag=${tagSlug}` as any);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleProductRecipesPress = (productSlug: string) => {
    router.push(`/recipes?ingredient=${productSlug}` as any);
  };

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleSeeAll = (link: string) => {
    router.push(link as any);
  };

  const handleBannerPress = (linkType: string, linkId: string) => {
    switch (linkType) {
      case 'product':
        router.push(`/product/${linkId}`);
        break;
      case 'category':
        router.push(`/category/${linkId}`);
        break;
      case 'collection':
        router.push(`/collections/${linkId}` as any);
        break;
      case 'deal':
        router.push(`/deals/${linkId}` as any);
        break;
      case 'url':
        // External URL - could open in browser
        break;
      default:
        break;
    }
  };

  const handleAddToCart = useCallback((product: ProductSectionItem) => {
    addItem({
      id: product.id,
      title: product.name,
      image: product.imageUrl || '',
      price: product.dealPrice || product.price,
      originalPrice: product.compareAtPrice || undefined,
      weight: product.unitSize || product.unit,
      isVegetarian: product.dietaryTags?.includes('vegetarian'),
    });
  }, [addItem]);

  const handleQuantityChange = useCallback((productId: string, delta: number) => {
    const currentQty = getItemQuantity(productId);
    updateQuantity(productId, currentQty + delta);
  }, [getItemQuantity, updateQuantity]);

  return (
    <View style={{ flex: 1 }}>
      <CollapsibleHeader
        scrollY={scrollY}
        searchPlaceholder="Search groceries, recipes..."
        onSearch={handleSearch}
        onSearchFocus={handleSearchFocus}
        tabs={categoryTabs}
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
      >
        {/* Story Carousel - Only show if there are stories */}
        {storyItems.length > 0 && (
          <StoryCarousel items={storyItems} onStoryViewed={refetchSections} />
        )}

        {/* Loading state */}
        {isTabSectionsLoading && (
          <View style={{ paddingVertical: tokens.spacing[4], alignItems: 'center' }}>
            <ActivityIndicator size="small" color={tokens.colors.semantic.brand.primary.default} />
          </View>
        )}

        {/* Dynamic sections from API */}
        {contentSections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            onProductPress={handleProductPress}
            onProductRecipesPress={handleProductRecipesPress}
            onCategoryPress={handleCategoryPress}
            onBrandPress={handleBrandPress}
            onRecipePress={handleRecipePress}
            onRecipeCategoryPress={handleRecipeCategoryPress}
            onRecipeTagPress={handleRecipeTagPress}
            onBannerPress={handleBannerPress}
            onSeeAll={handleSeeAll}
            favorites={favorites}
            getItemQuantity={getItemQuantity}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToCart={handleAddToCart}
            onQuantityChange={handleQuantityChange}
          />
        ))}

        {/* Empty state when no sections */}
        {!isTabSectionsLoading && contentSections.length === 0 && (
          <View style={{ paddingVertical: tokens.spacing[12], alignItems: 'center', paddingHorizontal: tokens.spacing[6] }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: tokens.colors.semantic.surface.secondary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: tokens.spacing[4]
            }}>
              <Text style={{ fontSize: 32 }}>📦</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: tokens.colors.semantic.text.primary, marginBottom: tokens.spacing[2] }}>No content yet</Text>
            <Text style={{ fontSize: 14, color: tokens.colors.semantic.text.secondary, textAlign: 'center' }}>Check back soon for products and deals</Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </CollapsibleHeader>

      {/* Floating Cart Button */}
      <FloatingCartButton />

      {/* Address Entry Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={handleDismissModal}
      >
        <View style={{ flex: 1, backgroundColor: tokens.colors.semantic.surface.primary, paddingTop: insets.top }}>
          <AddressEntry
            onAddressVerified={handleAddressVerified}
            onCancel={handleDismissModal}
            showCancel={true}
          />
        </View>
      </Modal>

      {/* Subcategory Picker Modal - Drill-down pattern */}
      <SubcategoryPickerModal
        visible={showSubcategoryModal}
        category={selectedCategoryForModal}
        onClose={() => setShowSubcategoryModal(false)}
        onSelectSubcategory={handleSubcategorySelect}
        onViewAll={handleViewAllCategory}
      />
    </View>
  );
}
