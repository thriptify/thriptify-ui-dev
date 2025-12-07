# Thriptify Developer Guide

This guide explains how each screen and component is built, the patterns used, and how to create new ones.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Design System](#design-system)
3. [Common Patterns](#common-patterns)
4. [Screen Implementations](#screen-implementations)
   - [Home Screen](#home-screen)
   - [Category Detail Screen](#category-detail-screen)
   - [Product Detail Screen](#product-detail-screen)
5. [Component Patterns](#component-patterns)
6. [Creating New Screens](#creating-new-screens)
7. [Creating New Components](#creating-new-components)
8. [Navigation](#navigation)
9. [State Management](#state-management)
10. [Styling Guide](#styling-guide)

---

## Project Structure

```
thriptify-ui-dev/
├── app/                      # Expo Router file-based routing
│   ├── (tabs)/              # Tab navigator screens
│   │   ├── _layout.tsx      # Tab bar configuration
│   │   ├── index.tsx        # Home screen (first tab)
│   │   ├── categories.tsx   # Categories tab
│   │   └── reorder.tsx      # Order Again tab
│   ├── category/
│   │   └── [id].tsx         # Dynamic category detail screen
│   ├── product/
│   │   └── [id].tsx         # Dynamic product detail screen
│   ├── _layout.tsx          # Root layout (Stack navigator)
│   └── modal.tsx            # Modal screen
├── components/              # Reusable components
├── constants/               # App constants
├── hooks/                   # Custom React hooks
├── assets/                  # Images, fonts, etc.
└── node_modules/
    └── @thriptify/          # Design system packages
        ├── tokens/          # Colors, spacing, typography
        ├── ui-elements/     # Basic UI components
        └── components/      # Complex components
```

---

## Design System

### Importing Design Tokens

```tsx
import { tokens } from '@thriptify/tokens/react-native';

// Usage examples:
tokens.colors.semantic.surface.primary      // Background color
tokens.colors.semantic.text.primary         // Primary text color
tokens.colors.semantic.brand.primary.default // Brand/accent color
tokens.colors.semantic.status.success.default // Green for success
tokens.colors.semantic.status.error.default   // Red for errors
tokens.colors.semantic.border.default        // Border color
tokens.colors.semantic.border.subtle         // Light border

tokens.spacing[1]  // 4px
tokens.spacing[2]  // 8px
tokens.spacing[3]  // 12px
tokens.spacing[4]  // 16px
tokens.spacing[5]  // 20px
tokens.spacing[6]  // 24px
```

### UI Elements

```tsx
import { Text, Icon, Image, Badge } from '@thriptify/ui-elements';

// Text component
<Text variant="h1">Heading 1</Text>
<Text variant="h2">Heading 2</Text>
<Text variant="h3">Heading 3</Text>
<Text variant="h4">Heading 4</Text>
<Text variant="body">Body text</Text>
<Text variant="bodySmall">Small body text</Text>
<Text variant="caption">Caption text</Text>

// Text with weight
<Text variant="body" weight="regular">Regular</Text>
<Text variant="body" weight="medium">Medium</Text>
<Text variant="body" weight="semibold">Semibold</Text>
<Text variant="body" weight="bold">Bold</Text>

// Icon component
<Icon name="heart" size="sm" color={tokens.colors.semantic.text.primary} />
<Icon name="heart-fill" size="md" color={tokens.colors.semantic.status.error.default} />

// Available icon names (commonly used):
// heart, heart-fill, star, star-fill, search, home, bag, user,
// chevron-left, chevron-right, chevron-up, chevron-down,
// plus, minus, time, check-circle, refresh, share, settings,
// arrow-up-down, wallet, book, nutrition, flash, sparkles

// Icon sizes: 'xs', 'sm', 'md', 'lg', 'xl'

// Image component
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  width={100}
  height={100}
  borderRadius={12}
  resizeMode="cover"
/>

// Image with percentage width
<Image
  source={{ uri: imageUrl }}
  width="100%"
  height={140}
  borderRadius={12}
/>
```

### Components

```tsx
import { SearchBar } from '@thriptify/components';

<SearchBar
  value={searchText}
  onChangeText={setSearchText}
  onSearch={handleSearch}
  placeholder="Search groceries, recipes..."
  showClearButton
/>
```

---

## Common Patterns

### 1. Screen Setup Pattern

Every screen follows this basic structure:

```tsx
import { ScrollView, StyleSheet, View, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export default function MyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State declarations
  const [myState, setMyState] = useState(initialValue);

  // Event handlers
  const handleSomething = () => {
    // handle event
  };

  return (
    <View style={styles.container}>
      {/* Header with safe area */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        {/* Header content */}
      </View>

      {/* Main content */}
      <ScrollView style={styles.content}>
        {/* Screen content */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  header: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
  },
  content: {
    flex: 1,
  },
});
```

### 2. Dynamic Route Pattern

For screens with dynamic IDs (like `/product/123`):

```tsx
// File: app/product/[id].tsx

import { useLocalSearchParams } from 'expo-router';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Use id to fetch product data
  console.log('Product ID:', id);

  return (
    // ...
  );
}
```

### 3. Safe Area Pattern

Always handle safe areas for notches and home indicators:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Top safe area - for headers */}
      <View style={{ paddingTop: insets.top }}>
        {/* Header */}
      </View>

      {/* Bottom safe area - for fixed bottom bars */}
      <View style={{ paddingBottom: insets.bottom + tokens.spacing[3] }}>
        {/* Bottom bar */}
      </View>
    </View>
  );
}
```

### 4. Platform-Specific Shadows

Shadows work differently on iOS, Android, and Web:

```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    // Platform-specific shadows
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4, // Android only
        }),
  },
});
```

### 5. FlatList with Horizontal Scroll

```tsx
import { FlatList } from 'react-native';

<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.listContent}
/>

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
});
```

### 6. FlatList with Grid Layout

```tsx
<FlatList
  data={products}
  renderItem={renderProductItem}
  keyExtractor={(item) => item.id}
  numColumns={2}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.gridContent}
  columnWrapperStyle={styles.gridRow}
/>

const styles = StyleSheet.create({
  gridContent: {
    padding: tokens.spacing[3],
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: tokens.spacing[3],
  },
});
```

---

## Screen Implementations

### Home Screen

**File:** `app/(tabs)/index.tsx`

#### Structure Overview

```
┌─────────────────────────────────────┐
│ Header (with safe area)             │
│ ├── Delivery Info                   │
│ ├── Location + Action Buttons       │
│ ├── Search Bar                      │
│ └── Category Tabs                   │
├─────────────────────────────────────┤
│ ScrollView Content                  │
│ ├── Bestsellers Section             │
│ ├── Grocery Categories Grid         │
│ ├── Featured Products               │
│ └── Recipe Categories               │
└─────────────────────────────────────┘
```

#### Key Components Explained

**1. Header with Delivery Info**
```tsx
<View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
  <View style={styles.deliveryRow}>
    <View style={styles.deliveryInfo}>
      <Text variant="caption" style={styles.deliveryLabel}>Thriptify in</Text>
      <View style={styles.deliveryTimeRow}>
        <Text variant="h2" style={styles.deliveryTime}>2 hours</Text>
        <Icon name="chevron-down" size="sm" color={tokens.colors.semantic.text.primary} />
      </View>
      <Text variant="caption" style={styles.locationText}>San Francisco, CA</Text>
    </View>
    <View style={styles.headerActions}>
      <Pressable style={styles.headerButton}>
        <Icon name="wallet" size="md" color={tokens.colors.semantic.text.primary} />
      </Pressable>
      <Pressable style={styles.headerButton}>
        <Icon name="user" size="md" color={tokens.colors.semantic.text.primary} />
      </Pressable>
    </View>
  </View>
</View>
```

**2. Category Tabs (Horizontal Scroll)**
```tsx
const CATEGORY_TABS = [
  { id: 'all', label: 'All', icon: 'bag' },
  { id: 'groceries', label: 'Groceries', icon: 'nutrition' },
  // ...more tabs
];

const [selectedTab, setSelectedTab] = useState('all');

<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {CATEGORY_TABS.map((tab) => {
    const isSelected = selectedTab === tab.id;
    return (
      <Pressable
        key={tab.id}
        onPress={() => setSelectedTab(tab.id)}
        style={[styles.tab, isSelected && styles.tabSelected]}
      >
        <Icon
          name={tab.icon}
          size="md"
          color={isSelected
            ? tokens.colors.semantic.brand.primary.default
            : tokens.colors.semantic.text.secondary}
        />
        <Text
          variant="caption"
          style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}
        >
          {tab.label}
        </Text>
        {isSelected && <View style={styles.tabIndicator} />}
      </Pressable>
    );
  })}
</ScrollView>
```

**3. Product Card with Add to Cart**
```tsx
const [quantities, setQuantities] = useState<Record<string, number>>({});

const handleAddToCart = (productId: string) => {
  setQuantities(prev => ({ ...prev, [productId]: 1 }));
};

const handleQuantityChange = (productId: string, delta: number) => {
  setQuantities(prev => {
    const newQty = Math.max(0, (prev[productId] || 0) + delta);
    return { ...prev, [productId]: newQty };
  });
};

// In render:
{quantities[product.id] ? (
  <View style={styles.quantityControl}>
    <Pressable onPress={() => handleQuantityChange(product.id, -1)}>
      <Icon name="minus" size="sm" color={tokens.colors.semantic.surface.primary} />
    </Pressable>
    <Text style={styles.quantityText}>{quantities[product.id]}</Text>
    <Pressable onPress={() => handleQuantityChange(product.id, 1)}>
      <Icon name="plus" size="sm" color={tokens.colors.semantic.surface.primary} />
    </Pressable>
  </View>
) : (
  <Pressable style={styles.addButton} onPress={() => handleAddToCart(product.id)}>
    <Text style={styles.addButtonText}>ADD</Text>
  </Pressable>
)}
```

**4. Favorite Toggle**
```tsx
const [favorites, setFavorites] = useState<Record<string, boolean>>({});

const handleFavoriteToggle = (productId: string) => {
  setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
};

// In render:
<Pressable onPress={() => handleFavoriteToggle(product.id)}>
  <Icon
    name={favorites[product.id] ? 'heart-fill' : 'heart'}
    size="sm"
    color={favorites[product.id]
      ? tokens.colors.semantic.status.error.default
      : tokens.colors.semantic.text.tertiary}
  />
</Pressable>
```

---

### Category Detail Screen

**File:** `app/category/[id].tsx`

#### Structure Overview

```
┌─────────────────────────────────────┐
│ Header                              │
│ ├── Back Button                     │
│ ├── Category Title                  │
│ └── Search Button                   │
├─────────────────────────────────────┤
│ Main Content (Row Layout)           │
│ ┌─────────┬───────────────────────┐ │
│ │ Sidebar │ Content Area          │ │
│ │ (80px)  │ ┌───────────────────┐ │ │
│ │         │ │ Filter Bar        │ │ │
│ │ Sub-    │ ├───────────────────┤ │ │
│ │ category│ │ Product Grid      │ │ │
│ │ List    │ │ (2 columns)       │ │ │
│ │         │ │                   │ │ │
│ └─────────┴─┴───────────────────┘ │ │
└─────────────────────────────────────┘
```

#### Key Components Explained

**1. Screen Layout with Sidebar**
```tsx
const SIDEBAR_WIDTH = 80;

<View style={styles.mainContent}>
  {/* Left Sidebar */}
  <View style={styles.sidebar}>
    <FlatList
      data={subcategories}
      renderItem={renderSubcategoryItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
    />
  </View>

  {/* Right Content Area */}
  <View style={styles.contentArea}>
    {/* Filter bar and product grid */}
  </View>
</View>

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    flexDirection: 'row', // Side by side layout
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRightWidth: 1,
    borderRightColor: tokens.colors.semantic.border.subtle,
  },
  contentArea: {
    flex: 1, // Takes remaining space
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
});
```

**2. Subcategory Item with Selection State**
```tsx
const [selectedSubcategory, setSelectedSubcategory] = useState('all');

const renderSubcategoryItem = ({ item }) => {
  const isSelected = selectedSubcategory === item.id;

  return (
    <Pressable
      style={[styles.subcategoryItem, isSelected && styles.subcategoryItemSelected]}
      onPress={() => setSelectedSubcategory(item.id)}
    >
      {/* Selection indicator bar */}
      {isSelected && <View style={styles.subcategoryIndicator} />}

      {/* Circular image */}
      <View style={[
        styles.subcategoryImageWrapper,
        isSelected && styles.subcategoryImageWrapperSelected
      ]}>
        <Image
          source={{ uri: item.image }}
          width={48}
          height={48}
          borderRadius={24}
        />
      </View>

      {/* Title */}
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
};

// Styles for selection indicator
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
```

**3. Filter Chips with Active State**
```tsx
const [activeFilters, setActiveFilters] = useState<string[]>([]);

const handleFilterPress = (filterId: string) => {
  setActiveFilters(prev =>
    prev.includes(filterId)
      ? prev.filter(f => f !== filterId)  // Remove if active
      : [...prev, filterId]               // Add if not active
  );
};

// In render:
{QUICK_FILTERS.map((filter) => {
  const isActive = activeFilters.includes(filter.id);
  return (
    <Pressable
      key={filter.id}
      style={[styles.quickFilterChip, isActive && styles.quickFilterChipActive]}
      onPress={() => handleFilterPress(filter.id)}
    >
      <Image source={{ uri: filter.image }} width={20} height={20} borderRadius={10} />
      <Text style={[styles.quickFilterText, isActive && styles.quickFilterTextActive]}>
        {filter.label}
      </Text>
    </Pressable>
  );
})}
```

**4. Product Card with All States**
```tsx
const renderProductItem = ({ item }) => {
  const quantity = quantities[item.id] || 0;
  const isFavorite = favorites[item.id];
  const discount = item.originalPrice
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : 0;

  return (
    <Pressable style={styles.productCard} onPress={() => handleProductPress(item.id)}>
      {/* Image Container */}
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} width="100%" height={140} borderRadius={12} />

        {/* Out of stock overlay */}
        {item.isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of stock</Text>
          </View>
        )}

        {/* Favorite button */}
        <Pressable style={styles.favoriteButton} onPress={() => handleFavoriteToggle(item.id)}>
          <Icon name={isFavorite ? 'heart-fill' : 'heart'} size="sm" />
        </Pressable>

        {/* Bestseller badge */}
        {item.isBestseller && (
          <View style={styles.bestsellerBadge}>
            <Text style={styles.bestsellerText}>Bestseller</Text>
          </View>
        )}

        {/* Add button - positioned at bottom of image */}
        <View style={styles.addButtonContainer}>
          {/* ADD button or Quantity selector or Notify button */}
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        {/* Veg badge + Weight badge */}
        {/* Title */}
        {/* Delivery time */}
        {/* Discount */}
        {/* Price row */}
        {/* Recipe link */}
      </View>
    </Pressable>
  );
};
```

**5. Vegetarian Badge**
```tsx
// Green square with dot inside
{item.isVegetarian && (
  <View style={styles.vegBadge}>
    <View style={styles.vegDot} />
  </View>
)}

const styles = StyleSheet.create({
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
});
```

---

### Product Detail Screen

**File:** `app/product/[id].tsx`

#### Structure Overview

```
┌─────────────────────────────────────┐
│ Image Gallery (Full Width)          │
│ ├── Swipeable Images                │
│ ├── Header Buttons (Overlay)        │
│ ├── Pagination Dots                 │
│ └── Delivery Badge                  │
├─────────────────────────────────────┤
│ Product Info Section                │
│ ├── Rating Stars                    │
│ ├── Product Title + Veg Badge       │
│ ├── Variant Selector                │
│ └── View Details Link               │
├─────────────────────────────────────┤
│ Expandable Details                  │
│ ├── Trust Badges Row                │
│ ├── Highlights Accordion            │
│ └── Info Accordion                  │
├─────────────────────────────────────┤
│ Related Sections                    │
│ ├── Top Products (Horizontal)       │
│ ├── Recipes (Horizontal)            │
│ ├── People Also Bought              │
│ └── See All Products Button         │
├─────────────────────────────────────┤
│ Sticky Bottom Bar                   │
│ ├── Price Info                      │
│ └── Add to Cart Button              │
└─────────────────────────────────────┘
```

#### Key Components Explained

**1. Image Gallery with Pagination**
```tsx
const [currentImageIndex, setCurrentImageIndex] = useState(0);
const flatListRef = useRef<FlatList>(null);

const onImageScroll = (event: any) => {
  const offsetX = event.nativeEvent.contentOffset.x;
  const index = Math.round(offsetX / SCREEN_WIDTH);
  setCurrentImageIndex(index);
};

<View style={styles.imageGalleryContainer}>
  <FlatList
    ref={flatListRef}
    data={product.images}
    renderItem={({ item, index }) => (
      <View style={styles.imageSlide}>
        <Image
          source={{ uri: item }}
          width={SCREEN_WIDTH}
          height={SCREEN_WIDTH * 0.85}
          resizeMode="cover"
        />
      </View>
    )}
    keyExtractor={(_, index) => index.toString()}
    horizontal
    pagingEnabled  // Snap to each image
    showsHorizontalScrollIndicator={false}
    onScroll={onImageScroll}
    scrollEventThrottle={16}
  />

  {/* Pagination Dots */}
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
</View>

// Styles
paginationDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: 'rgba(255,255,255,0.5)',
},
paginationDotActive: {
  backgroundColor: tokens.colors.semantic.brand.primary.default,
  width: 18, // Elongated active dot
},
```

**2. Header Buttons Overlay**
```tsx
{/* Buttons float over the image */}
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
      <Icon name="search" size="md" />
    </Pressable>
    <Pressable style={styles.headerButton} onPress={handleShare}>
      <Icon name="share" size="md" />
    </Pressable>
  </View>
</View>

// Styles
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
  // Add shadow for visibility
},
```

**3. Variant Selector**
```tsx
const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);

<Text style={styles.selectUnitLabel}>Select Unit</Text>
<View style={styles.variantContainer}>
  {product.variants.map((variant) => (
    <Pressable
      key={variant.id}
      style={[
        styles.variantOption,
        selectedVariant.id === variant.id && styles.variantOptionSelected,
      ]}
      onPress={() => setSelectedVariant(variant)}
    >
      {/* Discount badge at top */}
      {variant.discount > 0 && (
        <View style={styles.variantDiscountBadge}>
          <Text style={styles.variantDiscountText}>{variant.discount}% OFF</Text>
        </View>
      )}

      {/* Weight */}
      <Text style={styles.variantWeight}>{variant.weight}</Text>

      {/* Price row */}
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

// Styles
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
```

**4. Accordion/Expandable Sections**
```tsx
const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
  highlights: true,
  info: false,
});

const toggleSection = (section: string) => {
  setExpandedSections(prev => ({
    ...prev,
    [section]: !prev[section],
  }));
};

// Usage:
<View style={styles.accordionSection}>
  <Pressable style={styles.accordionHeader} onPress={() => toggleSection('info')}>
    <Text variant="body" weight="semibold">Info</Text>
    <Icon
      name={expandedSections.info ? 'chevron-up' : 'chevron-down'}
      size="sm"
      color={tokens.colors.semantic.text.secondary}
    />
  </Pressable>

  {expandedSections.info && (
    <View style={styles.accordionContent}>
      {/* Content here */}
    </View>
  )}
</View>
```

**5. Sticky Bottom Bar**
```tsx
{/* Position at bottom of screen */}
<View style={[styles.bottomBar, { paddingBottom: insets.bottom + tokens.spacing[3] }]}>
  {/* Left side - Price info */}
  <View style={styles.bottomBarLeft}>
    <Text style={styles.bottomBarWeight}>{selectedVariant.weight}</Text>
    <View style={styles.bottomBarPriceRow}>
      <Text style={styles.bottomBarPrice}>${selectedVariant.price.toFixed(2)}</Text>
      {selectedVariant.originalPrice && (
        <Text style={styles.bottomBarOriginalPrice}>
          MRP ${selectedVariant.originalPrice.toFixed(2)}
        </Text>
      )}
    </View>
    <Text style={styles.bottomBarTaxInfo}>Inclusive of all taxes</Text>
  </View>

  {/* Right side - Add to cart or Quantity */}
  {quantity > 0 ? (
    <View style={styles.bottomBarQuantityControl}>
      <Pressable onPress={() => handleQuantityChange(product.id, -1)}>
        <Icon name="minus" size="md" color={tokens.colors.semantic.surface.primary} />
      </Pressable>
      <Text style={styles.bottomBarQuantityText}>{quantity}</Text>
      <Pressable onPress={() => handleQuantityChange(product.id, 1)}>
        <Icon name="plus" size="md" color={tokens.colors.semantic.surface.primary} />
      </Pressable>
    </View>
  ) : (
    <Pressable style={styles.addToCartButton} onPress={handleAddToCart}>
      <Text style={styles.addToCartText}>Add to cart</Text>
    </Pressable>
  )}
</View>

// Styles
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
  // Add shadow
},
```

**6. Trust Badges Row**
```tsx
<View style={styles.trustBadgesContainer}>
  <View style={styles.trustBadge}>
    <Icon name="bag" size="md" color={tokens.colors.semantic.text.secondary} />
    <Text style={styles.trustBadgeTitle}>Sourced</Text>
    <Text style={styles.trustBadgeValue}>Fresh Daily</Text>
  </View>
  <View style={styles.trustBadge}>
    <Icon name="check-circle" size="md" />
    <Text style={styles.trustBadgeTitle}>Quality</Text>
    <Text style={styles.trustBadgeValue}>Assured</Text>
  </View>
  {/* More badges */}
</View>

// Styles
trustBadgesContainer: {
  flexDirection: 'row',
  borderWidth: 1,
  borderColor: tokens.colors.semantic.border.default,
  borderRadius: 12,
},
trustBadge: {
  flex: 1,
  alignItems: 'center',
  paddingVertical: tokens.spacing[3],
  borderRightWidth: 1,
  borderRightColor: tokens.colors.semantic.border.default,
},
```

---

## Creating New Screens

### Step 1: Create the file

For a regular screen:
```bash
# Create file at app/my-screen.tsx
touch app/my-screen.tsx
```

For a screen in a tab:
```bash
# Create file at app/(tabs)/my-tab.tsx
touch app/(tabs)/my-tab.tsx
```

For a dynamic route:
```bash
# Create directory and file
mkdir -p app/my-feature
touch app/my-feature/[id].tsx
```

### Step 2: Basic screen template

```tsx
import { ScrollView, StyleSheet, View, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export default function MyNewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Add your state here
  const [data, setData] = useState([]);

  // Add your handlers here
  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h4" weight="semibold">Screen Title</Text>
        <View style={{ width: 40 }} /> {/* Spacer for centering */}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Your content here */}
        <Text>Hello World</Text>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: tokens.spacing[4],
  },
});
```

### Step 3: Add to navigation (if needed)

For modal screens or screens that need special configuration, update `app/_layout.tsx`:

```tsx
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
  <Stack.Screen
    name="my-feature/[id]"
    options={{
      headerShown: false,
      presentation: 'modal', // or 'card'
      animation: 'slide_from_bottom', // or 'slide_from_right'
    }}
  />
</Stack>
```

---

## Creating New Components

### Step 1: Create component file

```bash
touch components/MyComponent.tsx
```

### Step 2: Component template

```tsx
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

// Define props interface
interface MyComponentProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  onPress: () => void;
  isSelected?: boolean;
}

export function MyComponent({
  title,
  subtitle,
  imageUrl,
  onPress,
  isSelected = false,
}: MyComponentProps) {
  return (
    <Pressable
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
    >
      <Image
        source={{ uri: imageUrl }}
        width={60}
        height={60}
        borderRadius={8}
      />
      <View style={styles.textContainer}>
        <Text variant="body" weight="medium">{title}</Text>
        {subtitle && (
          <Text variant="caption" style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      <Icon
        name="chevron-right"
        size="sm"
        color={tokens.colors.semantic.text.tertiary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    gap: tokens.spacing[3],
  },
  containerSelected: {
    borderColor: tokens.colors.semantic.brand.primary.default,
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    color: tokens.colors.semantic.text.secondary,
    marginTop: tokens.spacing[1],
  },
});
```

### Step 3: Use the component

```tsx
import { MyComponent } from '@/components/MyComponent';

// In your screen:
<MyComponent
  title="Item Name"
  subtitle="Description here"
  imageUrl="https://example.com/image.jpg"
  onPress={() => console.log('pressed')}
  isSelected={selectedId === item.id}
/>
```

---

## Navigation

### Navigate to a screen

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

// Push a new screen
router.push('/category/veggies');
router.push(`/product/${productId}`);

// Replace current screen
router.replace('/home');

// Go back
router.back();
```

### Pass and receive parameters

```tsx
// Navigating with params
router.push(`/product/${productId}`);

// Receiving params in destination screen
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
```

---

## State Management

### Local State (useState)

For component-level state:

```tsx
// Single value
const [isLoading, setIsLoading] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);

// Object tracking multiple items
const [quantities, setQuantities] = useState<Record<string, number>>({});
const [favorites, setFavorites] = useState<Record<string, boolean>>({});

// Update object state
setQuantities(prev => ({ ...prev, [productId]: newValue }));
```

### Callbacks with useCallback

For performance optimization with FlatList:

```tsx
const renderItem = useCallback(({ item }) => {
  return <ProductCard item={item} />;
}, [dependencies]); // Add any dependencies used inside

<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
/>
```

---

## Styling Guide

### Color Usage

```tsx
// Backgrounds
tokens.colors.semantic.surface.primary    // White/main background
tokens.colors.semantic.surface.secondary  // Light gray background
tokens.colors.semantic.surface.tertiary   // Darker gray background

// Text
tokens.colors.semantic.text.primary       // Black/dark text
tokens.colors.semantic.text.secondary     // Gray text
tokens.colors.semantic.text.tertiary      // Light gray text
tokens.colors.semantic.text.inverse       // White text

// Brand
tokens.colors.semantic.brand.primary.default  // Primary accent color
tokens.colors.semantic.brand.primary.subtle   // Light accent background

// Status
tokens.colors.semantic.status.success.default // Green (add buttons, veg badge)
tokens.colors.semantic.status.error.default   // Red (heart, non-veg badge)

// Borders
tokens.colors.semantic.border.default     // Standard borders
tokens.colors.semantic.border.subtle      // Light dividers
```

### Spacing Scale

```tsx
tokens.spacing[1]  // 4px  - Tiny gaps
tokens.spacing[2]  // 8px  - Small gaps, button padding
tokens.spacing[3]  // 12px - Medium gaps
tokens.spacing[4]  // 16px - Standard padding, section spacing
tokens.spacing[5]  // 20px - Large gaps
tokens.spacing[6]  // 24px - Section margins
```

### Common Style Patterns

```tsx
// Card
card: {
  backgroundColor: tokens.colors.semantic.surface.primary,
  borderRadius: 12,
  padding: tokens.spacing[3],
  // Add platform shadow
},

// Button (primary)
button: {
  backgroundColor: tokens.colors.semantic.status.success.default,
  paddingVertical: tokens.spacing[3],
  paddingHorizontal: tokens.spacing[4],
  borderRadius: 8,
  alignItems: 'center',
},
buttonText: {
  color: tokens.colors.semantic.text.inverse,
  fontWeight: '600',
},

// Button (outline)
outlineButton: {
  borderWidth: 1,
  borderColor: tokens.colors.semantic.status.success.default,
  backgroundColor: tokens.colors.semantic.surface.primary,
  paddingVertical: tokens.spacing[2],
  paddingHorizontal: tokens.spacing[4],
  borderRadius: 8,
},
outlineButtonText: {
  color: tokens.colors.semantic.status.success.default,
  fontWeight: '600',
},

// Badge
badge: {
  backgroundColor: tokens.colors.semantic.surface.secondary,
  paddingHorizontal: tokens.spacing[2],
  paddingVertical: 2,
  borderRadius: 4,
},
badgeText: {
  fontSize: 10,
  color: tokens.colors.semantic.text.secondary,
},

// Circular icon button
iconButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: tokens.colors.semantic.surface.secondary,
  alignItems: 'center',
  justifyContent: 'center',
},

// Divider
divider: {
  height: 1,
  backgroundColor: tokens.colors.semantic.border.subtle,
},
```

---

## Quick Reference

### File Naming
- Screens: `kebab-case.tsx` or `[param].tsx` for dynamic routes
- Components: `PascalCase.tsx`

### Import Order
1. React Native imports
2. React/hooks imports
3. expo-router imports
4. Design system imports (@thriptify/*)
5. Local imports (components, constants, hooks)

### Checklist for New Features
- [ ] Create file in correct location
- [ ] Import design tokens and UI elements
- [ ] Use safe area insets for headers/footers
- [ ] Add platform-specific shadows
- [ ] Handle loading/empty states
- [ ] Wire up navigation
- [ ] Update PROGRESS.md

---

*Last Updated: December 6, 2025*
