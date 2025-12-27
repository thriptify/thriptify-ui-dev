import { StyleSheet, View, Animated, ActivityIndicator } from 'react-native';
import { useRef, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { tokens } from '@thriptify/tokens/react-native';
import { Text } from '@thriptify/ui-elements';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { CollapsibleHeader } from '@/components/collapsible-header';
import { CategoryGrid } from '@/components/shared';
import { useCategories } from '@/hooks/use-api';
import type { CategoryWithChildren } from '@thriptify/api-types';

// Fallback mock data if API fails
const FALLBACK_CATEGORY_GROUPS = [
  {
    id: 'grocery',
    title: 'Grocery & Kitchen',
    categories: [
      { id: 'vegetables', title: 'Vegetables & Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop' },
      { id: 'rice', title: 'Rice, Grains & Pasta', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
      { id: 'oil', title: 'Oil, Ghee & Spices', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop' },
      { id: 'dairy', title: 'Dairy, Bread & Eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop' },
    ],
  },
];

// Transform API categories to display format
// Shows only Groceries categories (16 main categories with their subcategories)
function transformCategoriesToGroups(categories: CategoryWithChildren[]) {
  // Find the Groceries root category
  const groceriesRoot = categories.find(cat => cat.slug === 'groceries');

  // Use Groceries' children as main categories (the 16 grocery categories)
  const mainCategories = groceriesRoot?.children || [];

  // Each main category becomes a group with its subcategories
  return mainCategories
    .filter(cat => cat.isActive)
    .map(mainCategory => ({
      id: mainCategory.id,
      title: mainCategory.name,
      categories: (mainCategory.children || [])
        .filter(child => child.isActive)
        .map(child => ({
          id: child.id,
          title: child.name,
          image: child.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop',
        })),
    }))
    .filter(group => group.categories.length > 0);
}

export default function CategoriesScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch categories from API
  const { data: categories, isLoading, error } = useCategories();

  // Transform API data or use fallback
  const categoryGroups = useMemo(() => {
    if (categories && categories.length > 0) {
      return transformCategoriesToGroups(categories);
    }
    return FALLBACK_CATEGORY_GROUPS;
  }, [categories]);

  const handleSearch = (text: string) => {
    router.push(`/search?q=${encodeURIComponent(text)}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        scrollY={scrollY}
        searchPlaceholder="Search categories..."
        onSearch={handleSearch}
      >
        <View style={styles.contentSpacing} />

        {/* Loading state */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        )}

        {/* Error state - show fallback */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load categories. Showing default view.</Text>
          </View>
        )}

        {/* Category groups */}
        {!isLoading && categoryGroups.map((group) => (
          <CategoryGrid
            key={group.id}
            title={group.title}
            items={group.categories}
            size="md"
            onCategoryPress={handleCategoryPress}
          />
        ))}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </CollapsibleHeader>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentSpacing: {
    height: tokens.spacing[4],
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
  errorContainer: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    marginHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.status.warning.subtle,
    borderRadius: 8,
  },
  errorText: {
    color: tokens.colors.semantic.status.warning.default,
    fontSize: 14,
    textAlign: 'center',
  },
});
