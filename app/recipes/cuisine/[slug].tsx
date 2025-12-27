import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { useRecipesByCuisine, useRecipeCategories } from '@/hooks/use-api';
import { RecipeCard } from '@/components/shared';

export default function CuisineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ slug: string }>();
  const cuisineSlug = params.slug || '';

  // State for meal type filter
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Get categories for meal type tabs
  const { data: categories, isLoading: isCategoriesLoading } = useRecipeCategories();
  const mealCategories = categories || [];

  // Debug
  console.log('[CuisineScreen] cuisineSlug:', cuisineSlug);
  console.log('[CuisineScreen] mealCategories:', mealCategories.length);
  console.log('[CuisineScreen] isCategoriesLoading:', isCategoriesLoading);

  // Fetch recipes by cuisine with optional category filter
  const { data, isLoading } = useRecipesByCuisine(cuisineSlug, {
    categorySlug: selectedCategory,
    limit: 50,
  });

  const recipes = data?.recipes || [];
  const cuisineName = data?.cuisineName || cuisineSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleBack = () => {
    router.back();
  };

  // Track scroll position for header
  const [showHeaderBg, setShowHeaderBg] = useState(false);
  const heroHeight = 240;
  const scrollThreshold = heroHeight - insets.top - 60;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBg(scrollY > scrollThreshold);
  }, [scrollThreshold]);

  // Cuisine hero images
  const cuisineHeroImages: Record<string, string> = {
    indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=400&fit=crop',
    italian: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=400&fit=crop',
    mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=400&fit=crop',
    thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=400&fit=crop',
    chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=400&fit=crop',
    japanese: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&h=400&fit=crop',
    american: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=400&fit=crop',
    mediterranean: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop',
    french: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop',
    korean: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&h=400&fit=crop',
  };

  const heroImage = cuisineHeroImages[cuisineSlug] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop';

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
        {showHeaderBg && (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidHeaderBg]} />
          )
        )}
        <View style={styles.headerContent}>
          <Pressable
            style={[styles.headerButton, !showHeaderBg && styles.headerButtonOnImage]}
            onPress={handleBack}
          >
            <Icon
              name="chevron-left"
              size="md"
              color={showHeaderBg ? tokens.colors.semantic.text.primary : tokens.colors.semantic.surface.primary}
            />
          </Pressable>
          {showHeaderBg && (
            <Text variant="h4" style={styles.headerTitle}>{cuisineName}</Text>
          )}
          <Pressable
            style={[styles.headerButton, !showHeaderBg && styles.headerButtonOnImage]}
            onPress={() => router.push('/search?type=recipes')}
          >
            <Icon
              name="search"
              size="md"
              color={showHeaderBg ? tokens.colors.semantic.text.primary : tokens.colors.semantic.surface.primary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: heroImage }}
            width="100%"
            height={240}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <View style={{ height: insets.top + tokens.spacing[2] + 40 }} />
            <View style={styles.heroContent}>
              <Text variant="h1" style={styles.heroTitle}>{cuisineName}</Text>
              <Text style={styles.heroSubtitle}>
                {recipes.length} recipes found
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Meal Type Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
            >
              <Pressable
                style={[styles.tab, !selectedCategory && styles.tabActive]}
                onPress={() => setSelectedCategory(undefined)}
              >
                <Text style={[styles.tabText, !selectedCategory && styles.tabTextActive]}>
                  All
                </Text>
              </Pressable>
              {isCategoriesLoading ? (
                <View style={styles.tabsLoading}>
                  <ActivityIndicator size="small" color={tokens.colors.semantic.text.secondary} />
                </View>
              ) : (
                mealCategories.map((category) => (
                  <Pressable
                    key={category.id}
                    style={[styles.tab, selectedCategory === category.slug && styles.tabActive]}
                    onPress={() => setSelectedCategory(category.slug)}
                  >
                    <Text style={[styles.tabText, selectedCategory === category.slug && styles.tabTextActive]}>
                      {category.name}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>

          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
            </View>
          )}

          {/* Recipe Grid */}
          {!isLoading && recipes.length > 0 && (
            <View style={styles.recipesGrid}>
              {recipes.map((recipe) => (
                <View key={recipe.id} style={styles.recipeGridItem}>
                  <RecipeCard
                    id={recipe.id}
                    title={recipe.title}
                    imageUrl={recipe.thumbnailUrl || recipe.imageUrl || ''}
                    prepTime={recipe.prepTime}
                    cookTime={recipe.cookTime}
                    totalTime={recipe.totalTime}
                    servings={recipe.servings}
                    difficulty={recipe.difficulty}
                    cuisine={recipe.cuisine}
                    rating={recipe.ratingAvg}
                    ratingCount={recipe.ratingCount}
                    onPress={() => handleRecipePress(recipe.id)}
                    width={170}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && recipes.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="restaurant" size="xl" color={tokens.colors.semantic.text.tertiary} />
              <Text variant="h4" style={styles.emptyTitle}>No recipes found</Text>
              <Text variant="body" style={styles.emptySubtitle}>
                {selectedCategory
                  ? `No ${cuisineName} ${selectedCategory} recipes yet`
                  : `No ${cuisineName} recipes yet`}
              </Text>
              {selectedCategory && (
                <Pressable style={styles.clearButton} onPress={() => setSelectedCategory(undefined)}>
                  <Text style={styles.clearButtonText}>Show All {cuisineName}</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <FloatingCartButton bottomOffset={insets.bottom + 16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  androidHeaderBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[2],
    paddingBottom: tokens.spacing[3],
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonOnImage: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    position: 'relative',
    height: 240,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: tokens.spacing[6],
  },
  heroTitle: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: tokens.spacing[2],
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  content: {
    marginTop: -tokens.spacing[6],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: tokens.colors.semantic.surface.primary,
    paddingTop: tokens.spacing[4],
  },
  // Tabs
  tabsContainer: {
    marginBottom: tokens.spacing[4],
  },
  tabsContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[2],
    alignItems: 'center',
  },
  tabsLoading: {
    paddingHorizontal: tokens.spacing[4],
    justifyContent: 'center',
  },
  tab: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  tabActive: {
    backgroundColor: tokens.colors.semantic.text.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.text.secondary,
  },
  tabTextActive: {
    color: tokens.colors.semantic.surface.primary,
  },
  loadingContainer: {
    paddingVertical: tokens.spacing[8],
    alignItems: 'center',
  },
  // Recipes grid
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  recipeGridItem: {
    width: '47%',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[4],
  },
  emptyTitle: {
    marginTop: tokens.spacing[3],
    color: tokens.colors.semantic.text.primary,
  },
  emptySubtitle: {
    marginTop: tokens.spacing[2],
    color: tokens.colors.semantic.text.secondary,
    textAlign: 'center',
  },
  clearButton: {
    marginTop: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: tokens.radius.md,
  },
  clearButtonText: {
    color: tokens.colors.semantic.text.inverse,
    fontWeight: '600',
  },
});
