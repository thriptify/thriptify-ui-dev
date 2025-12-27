import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { useRecipeHome, useRecipes, type RecipeListItem, type RecipeHomeSection } from '@/hooks/use-api';
import { RecipeCard } from '@/components/shared';

// Filter chips for "All Recipes" section
const FILTER_CHIPS = [
  { id: 'quick', label: 'Quick Recipes', maxTime: 30 },
  { id: 'easy', label: 'Easy', difficulty: 'easy' as const },
  { id: 'medium', label: 'Medium', difficulty: 'medium' as const },
  { id: 'hard', label: 'Hard', difficulty: 'hard' as const },
];

// Section icon mapping
const SECTION_ICONS: Record<string, string> = {
  trending: 'flame',
  new: 'sparkles',
  quick: 'flash',
  featured: 'star',
  seasonal: 'leaf',
};

export default function RecipesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; tag?: string; ingredient?: string }>();

  // State for filters (for "All Recipes" section)
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAllRecipes, setShowAllRecipes] = useState(false);

  // Derive filter options from active filters
  const filterOptions = useMemo(() => {
    const opts: { maxTime?: number; difficulty?: 'easy' | 'medium' | 'hard' } = {};
    for (const filterId of activeFilters) {
      const filter = FILTER_CHIPS.find(f => f.id === filterId);
      if (filter?.maxTime) opts.maxTime = filter.maxTime;
      if (filter?.difficulty) opts.difficulty = filter.difficulty;
    }
    return opts;
  }, [activeFilters]);

  const isFiltered = params.category || params.tag || params.ingredient;

  // Use consolidated endpoint for main page (single API call)
  const { data: homeData, isLoading: isHomeLoading } = useRecipeHome();

  // Use separate endpoint only for filtered views
  const { data: filteredData, isLoading: isFilteredLoading } = useRecipes(
    isFiltered ? {
      categorySlug: params.category,
      tagSlug: params.tag,
      productSlug: params.ingredient,
      limit: 50,
      ...filterOptions,
    } : undefined
  );

  // Use lazy-loaded "All Recipes" only when user wants to see them
  const { data: allRecipesData, isLoading: isAllRecipesLoading } = useRecipes(
    showAllRecipes && !isFiltered ? { limit: 50, ...filterOptions } : undefined
  );

  // Data extraction
  const cuisines = homeData?.cuisines || [];
  const categories = homeData?.categories || [];
  const sections = homeData?.sections || [];
  const filteredRecipes = filteredData?.recipes || [];
  const allRecipes = allRecipesData?.recipes || [];

  // Get product name from filtered response (when filtering by ingredient)
  const productName = filteredData?.productName;

  // Page title based on filters
  const pageTitle = useMemo(() => {
    if (params.ingredient) {
      // Use the product name from API response, or format the slug
      return productName
        ? `Recipes with ${productName}`
        : `Recipes with ${params.ingredient.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
    }
    if (params.category) {
      const cat = categories.find(c => c.slug === params.category);
      return cat?.name || 'Recipes';
    }
    if (params.tag) {
      return params.tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return 'Recipes';
  }, [params.category, params.tag, params.ingredient, categories, productName]);

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleCategoryPress = (categorySlug: string) => {
    router.push(`/recipes?category=${categorySlug}`);
  };

  const handleCuisinePress = (cuisineSlug: string) => {
    console.log('[RecipesIndex] Navigating to cuisine:', `/recipes/cuisine/${cuisineSlug}`);
    router.push(`/recipes/cuisine/${cuisineSlug}`);
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const clearFilters = () => {
    router.replace('/recipes');
  };

  const handleBack = () => {
    if (params.category || params.tag || params.ingredient) {
      router.replace('/recipes');
    } else {
      router.back();
    }
  };

  const isLoading = isFiltered ? isFilteredLoading : isHomeLoading;

  // Track scroll position to show/hide header background
  const [showHeaderBg, setShowHeaderBg] = useState(false);
  const heroHeight = 280;
  const scrollThreshold = heroHeight - insets.top - 60;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBg(scrollY > scrollThreshold);
  }, [scrollThreshold]);

  // Render a recipe section (horizontal scroll)
  const renderSection = (section: RecipeHomeSection) => (
    <View key={section.type} style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Icon
            name={SECTION_ICONS[section.type] || 'star'}
            size="sm"
            color={tokens.colors.semantic.brand.primary.default}
          />
          <Text variant="h3" style={styles.sectionTitle}>{section.title}</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {section.recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
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
            width={200}
          />
        ))}
      </ScrollView>
    </View>
  );

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
            <Text variant="h4" style={styles.headerTitle}>{pageTitle}</Text>
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
            source={{ uri: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=400&fit=crop' }}
            width="100%"
            height={280}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <View style={{ height: insets.top + tokens.spacing[2] + 40 }} />
            <View style={styles.heroContent}>
              <Text variant="h1" style={styles.heroTitle}>{pageTitle}</Text>
              <Text style={styles.heroSubtitle}>
                {isFiltered ? `${filteredRecipes.length} recipes found` : 'Cook with passion and serve love with food'}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Filter Banner (when filtered) */}
          {isFiltered && (
            <View style={styles.filterBanner}>
              <View style={styles.filterInfo}>
                <Icon name={params.ingredient ? "nutrition" : "filter"} size="sm" color={tokens.colors.semantic.brand.primary.default} />
                <Text variant="bodySmall" style={styles.filterText}>
                  {params.ingredient
                    ? `Recipes with: ${productName || params.ingredient}`
                    : params.category
                      ? `Category: ${params.category}`
                      : `Tag: ${params.tag}`}
                </Text>
              </View>
              <Pressable onPress={clearFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>
            </View>
          )}

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
            </View>
          )}

          {/* === MAIN PAGE (Not Filtered) === */}
          {!isFiltered && !isHomeLoading && (
            <>
              {/* Browse by Cuisine - Grid Layout */}
              {cuisines.length > 0 && (
                <View style={styles.section}>
                  <Text variant="h3" style={styles.sectionTitlePadded}>Browse by Cuisine</Text>
                  <View style={styles.cuisineGrid}>
                    {cuisines.map((cuisine) => (
                      <Pressable
                        key={cuisine.slug}
                        style={styles.cuisineGridCard}
                        onPress={() => handleCuisinePress(cuisine.slug)}
                      >
                        <Image
                          source={{ uri: cuisine.imageUrl }}
                          width="100%"
                          height={120}
                          style={styles.cuisineGridImage}
                        />
                        <View style={styles.cuisineGridOverlay}>
                          <Text variant="body" weight="semibold" style={styles.cuisineGridName}>
                            {cuisine.name}
                          </Text>
                          <Text variant="caption" style={styles.cuisineGridCount}>
                            {cuisine.recipeCount} recipes
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Recipe Sections (Trending, New, Quick & Easy, Featured) */}
              {sections.map(renderSection)}

              {/* Browse by Meal */}
              {categories.length > 0 && (
                <View style={styles.section}>
                  <Text variant="h3" style={styles.sectionTitlePadded}>Browse by Meal</Text>
                  <View style={styles.categoriesGrid}>
                    {categories.map((category) => (
                      <Pressable
                        key={category.id}
                        style={styles.categoryCard}
                        onPress={() => handleCategoryPress(category.slug)}
                      >
                        <View style={styles.categoryImageContainer}>
                          <Image
                            source={{ uri: category.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop' }}
                            width={80}
                            height={80}
                            borderRadius={12}
                          />
                        </View>
                        <Text variant="caption" weight="medium" style={styles.categoryTitle}>
                          {category.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* All Recipes (Lazy Loaded) */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3" style={styles.sectionTitlePadded}>All Recipes</Text>
                </View>

                {!showAllRecipes ? (
                  <Pressable
                    style={styles.showAllButton}
                    onPress={() => setShowAllRecipes(true)}
                  >
                    <Text style={styles.showAllButtonText}>Browse All Recipes</Text>
                    <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.brand.primary.default} />
                  </Pressable>
                ) : (
                  <>
                    {/* Filter Chips */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterChipsContent}
                      style={styles.filterChipsContainer}
                    >
                      {FILTER_CHIPS.map((filter) => {
                        const isActive = activeFilters.includes(filter.id);
                        return (
                          <Pressable
                            key={filter.id}
                            style={[styles.filterChip, isActive && styles.filterChipActive]}
                            onPress={() => toggleFilter(filter.id)}
                          >
                            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                              {filter.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    {/* Recipe Grid */}
                    {isAllRecipesLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
                      </View>
                    ) : (
                      <View style={styles.recipesGrid}>
                        {allRecipes.map((recipe) => (
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
                  </>
                )}
              </View>
            </>
          )}

          {/* === FILTERED VIEW === */}
          {isFiltered && !isFilteredLoading && (
            <>
              {/* Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipsContent}
                style={styles.filterChipsContainer}
              >
                {FILTER_CHIPS.map((filter) => {
                  const isActive = activeFilters.includes(filter.id);
                  return (
                    <Pressable
                      key={filter.id}
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                      onPress={() => toggleFilter(filter.id)}
                    >
                      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                        {filter.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Recipe Grid */}
              {filteredRecipes.length > 0 ? (
                <View style={styles.recipesGrid}>
                  {filteredRecipes.map((recipe) => (
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
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="restaurant" size="xl" color={tokens.colors.semantic.text.tertiary} />
                  <Text variant="h4" style={styles.emptyTitle}>No recipes found</Text>
                  <Text variant="body" style={styles.emptySubtitle}>
                    Try adjusting your filters or browse all recipes
                  </Text>
                  <Pressable style={styles.browseAllButton} onPress={clearFilters}>
                    <Text style={styles.browseAllText}>Browse All Recipes</Text>
                  </Pressable>
                </View>
              )}
            </>
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
    height: 280,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: tokens.spacing[8],
  },
  heroTitle: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 40,
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
    paddingTop: tokens.spacing[6],
  },
  loadingContainer: {
    paddingVertical: tokens.spacing[8],
    alignItems: 'center',
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
    borderRadius: tokens.radius.md,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  filterText: {
    color: tokens.colors.semantic.brand.primary.default,
  },
  clearButton: {
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[1],
  },
  clearButtonText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '600',
    fontSize: 13,
  },
  section: {
    marginBottom: tokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: tokens.spacing[4],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  sectionTitle: {
    color: tokens.colors.semantic.text.primary,
  },
  sectionTitlePadded: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    color: tokens.colors.semantic.text.primary,
  },
  // Cuisine grid
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  cuisineGridCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  cuisineGridImage: {
    borderRadius: 0,
  },
  cuisineGridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[3],
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cuisineGridName: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 15,
  },
  cuisineGridCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  // Categories grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
  },
  categoryImageContainer: {
    backgroundColor: '#FFF5EB',
    borderRadius: 16,
    padding: tokens.spacing[2],
    marginBottom: tokens.spacing[2],
  },
  categoryTitle: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
  },
  // Horizontal scroll
  horizontalScrollContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  // Show all button
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: tokens.radius.md,
    gap: tokens.spacing[2],
  },
  showAllButtonText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontWeight: '600',
  },
  // Filter chips
  filterChipsContainer: {
    marginBottom: tokens.spacing[4],
  },
  filterChipsContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.default,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.semantic.text.primary,
    borderColor: tokens.colors.semantic.text.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  filterChipTextActive: {
    color: tokens.colors.semantic.surface.primary,
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
  browseAllButton: {
    marginTop: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: tokens.radius.md,
  },
  browseAllText: {
    color: tokens.colors.semantic.text.inverse,
    fontWeight: '600',
  },
});
