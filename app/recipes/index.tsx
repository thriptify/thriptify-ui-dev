import { ScrollView, StyleSheet, View, Pressable, Platform, FlatList } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { SearchBar } from '@thriptify/components';
import { tokens } from '@thriptify/tokens/react-native';
import { FloatingCartButton } from '@/components/floating-cart-button';

// Meal type categories
const MEAL_CATEGORIES = [
  { id: 'breakfast', title: 'Breakfast', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&h=200&fit=crop' },
  { id: 'lunch', title: 'Lunch', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop' },
  { id: 'dinner', title: 'Dinner', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop' },
  { id: 'snacks', title: 'Snacks', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&h=200&fit=crop' },
  { id: 'drinks', title: 'Drinks', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop' },
  { id: 'dessert', title: 'Dessert', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop' },
];

// Filter chips
const FILTER_CHIPS = [
  { id: 'quick', label: 'Quick Recipes' },
  { id: 'veg', label: 'Veg' },
  { id: 'diet', label: 'Diet Type', hasDropdown: true },
  { id: 'ingredients', label: 'Ingredients', hasDropdown: true },
  { id: 'cuisine', label: 'Cuisine', hasDropdown: true },
];

// Today's recommendations (large cards)
const TODAYS_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    title: 'Avocado Toast',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&h=600&fit=crop',
    cookingTime: 15,
    isVegetarian: true,
    tags: ['Breakfast', 'Healthy'],
  },
  {
    id: 'rec-2',
    title: 'Grilled Salmon Bowl',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=600&fit=crop',
    cookingTime: 35,
    isVegetarian: false,
    tags: ['Main Course', 'Healthy'],
  },
  {
    id: 'rec-3',
    title: 'Mediterranean Salad',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=600&fit=crop',
    cookingTime: 20,
    isVegetarian: true,
    tags: ['Lunch', 'Vegan'],
  },
];

// Cook in minutes (quick recipes)
const QUICK_RECIPES = [
  {
    id: 'quick-1',
    title: 'Green Smoothie',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=300&h=300&fit=crop',
    cookingTime: 5,
    isVegetarian: true,
    tags: ['Beverages'],
  },
  {
    id: 'quick-2',
    title: 'Overnight Oats',
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=300&h=300&fit=crop',
    cookingTime: 10,
    isVegetarian: true,
    tags: ['Breakfast'],
  },
  {
    id: 'quick-3',
    title: 'Fruit Parfait',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop',
    cookingTime: 10,
    isVegetarian: true,
    tags: ['Dessert'],
  },
  {
    id: 'quick-4',
    title: 'Caprese Salad',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=300&h=300&fit=crop',
    cookingTime: 10,
    isVegetarian: true,
    tags: ['Appetizer'],
  },
  {
    id: 'quick-5',
    title: 'Bruschetta',
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300&h=300&fit=crop',
    cookingTime: 15,
    isVegetarian: true,
    tags: ['Snacks'],
  },
  {
    id: 'quick-6',
    title: 'Berry Smoothie Bowl',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300&h=300&fit=crop',
    cookingTime: 10,
    isVegetarian: true,
    tags: ['Breakfast'],
  },
];

// All recipes grid
const ALL_RECIPES = [
  {
    id: 'all-1',
    title: 'Pasta Primavera',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
    cookingTime: 30,
    isVegetarian: true,
    tags: ['Main Course', 'Italian'],
  },
  {
    id: 'all-2',
    title: 'Chicken Stir Fry',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop',
    cookingTime: 25,
    isVegetarian: false,
    tags: ['Main Course', 'Asian'],
  },
  {
    id: 'all-3',
    title: 'Veggie Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
    cookingTime: 25,
    isVegetarian: true,
    tags: ['Healthy', 'Vegan'],
  },
  {
    id: 'all-4',
    title: 'Beef Tacos',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    cookingTime: 35,
    isVegetarian: false,
    tags: ['Main Course', 'Mexican'],
  },
  {
    id: 'all-5',
    title: 'Mushroom Risotto',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=400&fit=crop',
    cookingTime: 45,
    isVegetarian: true,
    tags: ['Main Course', 'Italian'],
  },
  {
    id: 'all-6',
    title: 'Shrimp Scampi',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop',
    cookingTime: 20,
    isVegetarian: false,
    tags: ['Main Course', 'Seafood'],
  },
];

// Bookmarked recipes
const BOOKMARKED_RECIPES = [
  {
    id: 'bm-1',
    title: 'Chocolate Lava Cake',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=400&fit=crop',
    cookingTime: 25,
    isVegetarian: true,
    tags: ['Dessert'],
  },
  {
    id: 'bm-2',
    title: 'Grilled Caesar Salad',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=400&fit=crop',
    cookingTime: 20,
    isVegetarian: true,
    tags: ['Salad', 'Healthy'],
  },
];

interface Recipe {
  id: string;
  title: string;
  image: string;
  cookingTime: number;
  isVegetarian: boolean;
  tags: string[];
}

export default function RecipesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({
    'bm-1': true,
    'bm-2': true,
  });

  const handleSearch = (text: string) => {
    console.log('Search recipes:', text);
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/recipes?category=${categoryId}`);
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const toggleBookmark = (recipeId: string) => {
    setBookmarks(prev => ({ ...prev, [recipeId]: !prev[recipeId] }));
  };

  const renderRecipeCard = (recipe: Recipe, size: 'large' | 'small' | 'grid') => {
    const isBookmarked = bookmarks[recipe.id];

    if (size === 'large') {
      return (
        <Pressable
          key={recipe.id}
          style={styles.largeRecipeCard}
          onPress={() => handleRecipePress(recipe.id)}
        >
          <Image
            source={{ uri: recipe.image }}
            width="100%"
            height={220}
            borderRadius={16}
          />
          <Pressable
            style={styles.bookmarkButton}
            onPress={() => toggleBookmark(recipe.id)}
          >
            <Icon
              name={isBookmarked ? 'bookmark-fill' : 'bookmark'}
              size="sm"
              color={isBookmarked ? tokens.colors.semantic.brand.primary.default : tokens.colors.semantic.surface.primary}
            />
          </Pressable>
          <View style={styles.largeCardOverlay}>
            <View style={styles.recipeTagsRow}>
              <View style={[styles.vegIndicator, !recipe.isVegetarian && styles.nonVegIndicator]}>
                <View style={[styles.vegDot, !recipe.isVegetarian && styles.nonVegDot]} />
              </View>
              {recipe.tags.map((tag, idx) => (
                <View key={idx} style={styles.recipeTag}>
                  <Text style={styles.recipeTagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text variant="h4" style={styles.largeCardTitle}>{recipe.title}</Text>
            <View style={styles.cookingTimeRow}>
              <Icon name="time" size="xs" color="rgba(255,255,255,0.8)" />
              <Text style={styles.cookingTimeText}>{recipe.cookingTime} mins</Text>
            </View>
          </View>
        </Pressable>
      );
    }

    if (size === 'small') {
      return (
        <Pressable
          key={recipe.id}
          style={styles.smallRecipeCard}
          onPress={() => handleRecipePress(recipe.id)}
        >
          <View style={styles.smallCardImageContainer}>
            <Image
              source={{ uri: recipe.image }}
              width="100%"
              height={100}
              borderRadius={12}
            />
            <Pressable
              style={styles.smallBookmarkButton}
              onPress={() => toggleBookmark(recipe.id)}
            >
              <Icon
                name={isBookmarked ? 'bookmark-fill' : 'bookmark'}
                size="xs"
                color={isBookmarked ? tokens.colors.semantic.brand.primary.default : tokens.colors.semantic.surface.primary}
              />
            </Pressable>
          </View>
          <View style={styles.smallCardInfo}>
            <View style={styles.recipeTagsRow}>
              <View style={[styles.vegIndicator, !recipe.isVegetarian && styles.nonVegIndicator]}>
                <View style={[styles.vegDot, !recipe.isVegetarian && styles.nonVegDot]} />
              </View>
              <View style={styles.smallRecipeTag}>
                <Text style={styles.smallRecipeTagText}>{recipe.tags[0]}</Text>
              </View>
            </View>
            <Text variant="caption" weight="medium" numberOfLines={2} style={styles.smallCardTitle}>
              {recipe.title}
            </Text>
            <View style={styles.cookingTimeRow}>
              <Icon name="time" size="xs" color={tokens.colors.semantic.status.warning.default} />
              <Text style={styles.smallCookingTimeText}>{recipe.cookingTime} mins</Text>
            </View>
          </View>
        </Pressable>
      );
    }

    // Grid card
    return (
      <Pressable
        key={recipe.id}
        style={styles.gridRecipeCard}
        onPress={() => handleRecipePress(recipe.id)}
      >
        <Image
          source={{ uri: recipe.image }}
          width="100%"
          height={160}
          borderRadius={12}
        />
        <Pressable
          style={styles.gridBookmarkButton}
          onPress={() => toggleBookmark(recipe.id)}
        >
          <Icon
            name={isBookmarked ? 'bookmark-fill' : 'bookmark'}
            size="sm"
            color={isBookmarked ? tokens.colors.semantic.brand.primary.default : tokens.colors.semantic.surface.primary}
          />
        </Pressable>
        <View style={styles.gridCardOverlay}>
          <View style={styles.recipeTagsRow}>
            <View style={[styles.vegIndicator, !recipe.isVegetarian && styles.nonVegIndicator]}>
              <View style={[styles.vegDot, !recipe.isVegetarian && styles.nonVegDot]} />
            </View>
            {recipe.tags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={styles.recipeTag}>
                <Text style={styles.recipeTagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text variant="bodySmall" weight="semibold" style={styles.gridCardTitle}>{recipe.title}</Text>
          <View style={styles.cookingTimeRow}>
            <Icon name="time" size="xs" color="rgba(255,255,255,0.8)" />
            <Text style={styles.cookingTimeText}>{recipe.cookingTime} mins</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Hero */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=400&fit=crop' }}
          width="100%"
          height={280}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <View style={[styles.heroHeader, { paddingTop: insets.top + tokens.spacing[2] }]}>
            <Pressable style={styles.backButton} onPress={() => router.push('/')}>
              <Icon name="chevron-left" size="md" color={tokens.colors.semantic.surface.primary} />
            </Pressable>
            <Pressable style={styles.searchButton}>
              <Icon name="search" size="md" color={tokens.colors.semantic.surface.primary} />
            </Pressable>
          </View>
          <View style={styles.heroContent}>
            <Text variant="h1" style={styles.heroTitle}>Recipes</Text>
            <Text style={styles.heroSubtitle}>Cook with passion and serve love with food</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Meal Categories Grid */}
        <View style={styles.section}>
          <View style={styles.categoriesGrid}>
            {MEAL_CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View style={styles.categoryImageContainer}>
                  <Image
                    source={{ uri: category.image }}
                    width={80}
                    height={80}
                    borderRadius={12}
                  />
                </View>
                <Text variant="caption" weight="medium" style={styles.categoryTitle}>
                  {category.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bookmarked Recipes */}
        {BOOKMARKED_RECIPES.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h3" style={styles.sectionTitle}>Bookmarked Recipes</Text>
              <Pressable style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>see all</Text>
                <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.status.success.default} />
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {BOOKMARKED_RECIPES.map((recipe) => renderRecipeCard(recipe, 'small'))}
            </ScrollView>
          </View>
        )}

        {/* Today's Recommendations */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitlePadded}>Today's Recommendations</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            pagingEnabled={false}
            snapToInterval={320}
            decelerationRate="fast"
          >
            {TODAYS_RECOMMENDATIONS.map((recipe) => renderRecipeCard(recipe, 'large'))}
          </ScrollView>
        </View>

        {/* Cook in minutes */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitlePadded}>Cook in minutes</Text>
          <View style={styles.quickRecipesGrid}>
            {QUICK_RECIPES.map((recipe) => renderRecipeCard(recipe, 'small'))}
          </View>
        </View>

        {/* All Recipes with Filters */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitlePadded}>All Recipes</Text>

          {/* Filter chips */}
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
                  {filter.hasDropdown && (
                    <Icon
                      name="chevron-down"
                      size="xs"
                      color={isActive ? tokens.colors.semantic.surface.primary : tokens.colors.semantic.text.secondary}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Recipe grid */}
          <View style={styles.allRecipesGrid}>
            {ALL_RECIPES.map((recipe) => renderRecipeCard(recipe, 'grid'))}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Cart Button */}
      <FloatingCartButton bottomOffset={insets.bottom + 16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
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
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
    marginTop: -tokens.spacing[6],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  contentContainer: {
    paddingTop: tokens.spacing[6],
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
  sectionTitlePadded: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    color: tokens.colors.semantic.text.primary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  seeAllText: {
    color: tokens.colors.semantic.status.success.default,
    fontSize: 14,
    fontWeight: '500',
  },
  // Meal categories grid
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
  // Large recipe card
  largeRecipeCard: {
    width: 300,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bookmarkButton: {
    position: 'absolute',
    top: tokens.spacing[3],
    right: tokens.spacing[3],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing[4],
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  recipeTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[1],
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  nonVegIndicator: {
    borderColor: tokens.colors.semantic.status.error.default,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  nonVegDot: {
    backgroundColor: tokens.colors.semantic.status.error.default,
  },
  recipeTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: 4,
  },
  recipeTagText: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 11,
    fontWeight: '500',
  },
  largeCardTitle: {
    color: tokens.colors.semantic.text.inverse,
    marginBottom: tokens.spacing[1],
  },
  cookingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  cookingTimeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  // Small recipe card
  smallRecipeCard: {
    width: 110,
  },
  smallCardImageContainer: {
    position: 'relative',
    marginBottom: tokens.spacing[2],
  },
  smallBookmarkButton: {
    position: 'absolute',
    top: tokens.spacing[2],
    right: tokens.spacing[2],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCardInfo: {},
  smallRecipeTag: {
    backgroundColor: tokens.colors.semantic.status.success.subtle,
    paddingHorizontal: tokens.spacing[1],
    paddingVertical: 2,
    borderRadius: 4,
  },
  smallRecipeTagText: {
    color: tokens.colors.semantic.status.success.default,
    fontSize: 10,
    fontWeight: '500',
  },
  smallCardTitle: {
    marginTop: tokens.spacing[1],
    marginBottom: tokens.spacing[1],
    color: tokens.colors.semantic.text.primary,
  },
  smallCookingTimeText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 11,
  },
  // Quick recipes grid
  quickRecipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  // Grid recipe card
  gridRecipeCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gridBookmarkButton: {
    position: 'absolute',
    top: tokens.spacing[2],
    right: tokens.spacing[2],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  gridCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing[3],
  },
  gridCardTitle: {
    color: tokens.colors.semantic.text.inverse,
    marginBottom: tokens.spacing[1],
  },
  // All recipes grid
  allRecipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
    justifyContent: 'space-between',
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
});
