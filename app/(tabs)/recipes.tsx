import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { useRecipeHome } from '@/hooks/use-api';

export default function RecipesTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch recipe home data
  const { data: homeData, isLoading } = useRecipeHome();

  const cuisines = homeData?.cuisines || [];
  const categories = homeData?.categories || [];
  const sections = homeData?.sections || [];

  const handleCuisinePress = (cuisineSlug: string) => {
    router.push(`/recipes/cuisine/${cuisineSlug}`);
  };

  const handleCategoryPress = (categorySlug: string) => {
    router.push(`/recipes?category=${categorySlug}`);
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleViewAllRecipes = () => {
    router.push('/recipes');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + tokens.spacing[2], paddingBottom: 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" style={styles.headerTitle}>Recipes</Text>
          <Pressable
            style={styles.searchButton}
            onPress={() => router.push('/search?type=recipes')}
          >
            <Icon name="search" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
          </View>
        ) : (
          <>
            {/* Browse by Cuisine - Grid */}
            {cuisines.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3" style={styles.sectionTitle}>Browse by Cuisine</Text>
                  <Pressable onPress={handleViewAllRecipes}>
                    <Text style={styles.viewAll}>View All</Text>
                  </Pressable>
                </View>
                <View style={styles.cuisineGrid}>
                  {cuisines.slice(0, 6).map((cuisine) => (
                    <Pressable
                      key={cuisine.slug}
                      style={styles.cuisineCard}
                      onPress={() => handleCuisinePress(cuisine.slug)}
                    >
                      <Image
                        source={{ uri: cuisine.imageUrl }}
                        width="100%"
                        height={100}
                        style={styles.cuisineImage}
                      />
                      <View style={styles.cuisineOverlay}>
                        <Text variant="body" weight="semibold" style={styles.cuisineName}>
                          {cuisine.name}
                        </Text>
                        <Text variant="caption" style={styles.cuisineCount}>
                          {cuisine.recipeCount} recipes
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Browse by Meal Type */}
            {categories.length > 0 && (
              <View style={styles.section}>
                <Text variant="h3" style={styles.sectionTitle}>Browse by Meal</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mealScrollContent}
                >
                  {categories.map((category) => (
                    <Pressable
                      key={category.slug}
                      style={styles.mealCard}
                      onPress={() => handleCategoryPress(category.slug)}
                    >
                      <View style={styles.mealIconContainer}>
                        <Icon
                          name={category.icon || 'restaurant'}
                          size="lg"
                          color={tokens.colors.semantic.brand.primary.default}
                        />
                      </View>
                      <Text variant="caption" weight="medium" style={styles.mealName}>
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recipe Sections */}
            {sections.map((section) => (
              <View key={section.type} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    {section.icon && (
                      <Text style={styles.sectionIcon}>{section.icon}</Text>
                    )}
                    <Text variant="h3" style={styles.sectionTitle}>{section.title}</Text>
                  </View>
                  <Pressable onPress={handleViewAllRecipes}>
                    <Text style={styles.viewAll}>See All</Text>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recipeScrollContent}
                >
                  {section.recipes.slice(0, 8).map((recipe) => (
                    <Pressable
                      key={recipe.id}
                      style={styles.recipeCard}
                      onPress={() => handleRecipePress(recipe.id)}
                    >
                      <Image
                        source={{ uri: recipe.thumbnailUrl || recipe.imageUrl }}
                        width={160}
                        height={120}
                        borderRadius={12}
                        style={styles.recipeImage}
                      />
                      <View style={styles.recipeInfo}>
                        <Text
                          variant="body"
                          weight="medium"
                          numberOfLines={2}
                          style={styles.recipeTitle}
                        >
                          {recipe.title}
                        </Text>
                        <View style={styles.recipeMeta}>
                          <Icon name="clock" size="xs" color={tokens.colors.semantic.text.tertiary} />
                          <Text variant="caption" style={styles.recipeMetaText}>
                            {recipe.totalTime || recipe.cookTime || 30} min
                          </Text>
                          {recipe.difficulty && (
                            <>
                              <Text style={styles.recipeDot}>•</Text>
                              <Text variant="caption" style={styles.recipeMetaText}>
                                {recipe.difficulty}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <FloatingCartButton bottomOffset={insets.bottom + 80} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
  },
  headerTitle: {
    color: tokens.colors.semantic.text.primary,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing[8],
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  sectionTitle: {
    color: tokens.colors.semantic.text.primary,
  },
  sectionIcon: {
    fontSize: 20,
  },
  viewAll: {
    color: tokens.colors.semantic.brand.primary.default,
    fontSize: 14,
    fontWeight: '600',
  },
  // Cuisine Grid
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  cuisineCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  cuisineImage: {
    borderRadius: 0,
  },
  cuisineOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[3],
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cuisineName: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: 14,
  },
  cuisineCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  // Meal Type
  mealScrollContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  mealCard: {
    alignItems: 'center',
    width: 80,
  },
  mealIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[2],
  },
  mealName: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
    fontSize: 12,
  },
  // Recipe Cards
  recipeScrollContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  recipeCard: {
    width: 160,
  },
  recipeImage: {
    marginBottom: tokens.spacing[2],
  },
  recipeInfo: {
    gap: tokens.spacing[1],
  },
  recipeTitle: {
    color: tokens.colors.semantic.text.primary,
    fontSize: 14,
    lineHeight: 18,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    color: tokens.colors.semantic.text.tertiary,
    fontSize: 12,
  },
  recipeDot: {
    color: tokens.colors.semantic.text.tertiary,
    fontSize: 12,
  },
});
