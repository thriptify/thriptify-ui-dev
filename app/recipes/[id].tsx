import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useCart } from '@/contexts/cart-context';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { QuantityStepper } from '@/components/shared/QuantityStepper';
import { useRecipe, useShoppableRecipe } from '@/hooks/use-api';

// Mock recipe data - in real app, fetch by ID
const RECIPE_DATA: Record<string, {
  id: string;
  title: string;
  image: string;
  cookingTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isVegetarian: boolean;
  tags: string[];
  description: string;
  ingredients: Array<{
    id: string;
    productId?: string;
    name: string;
    quantity: string;
    image: string;
    price: number;
    originalPrice?: number;
    inStock: boolean;
    hasProduct?: boolean;
  }>;
  instructions: Array<{
    step: number;
    text: string;
    tip?: string;
  }>;
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  shoppableSummary?: null;
}> = {
  'rec-1': {
    id: 'rec-1',
    title: 'Avocado Toast',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop',
    cookingTime: 15,
    servings: 2,
    difficulty: 'Easy',
    isVegetarian: true,
    tags: ['Breakfast', 'Healthy', 'Quick'],
    description: 'A delicious and nutritious breakfast option featuring creamy avocado on crispy toast, topped with your favorite seasonings.',
    ingredients: [
      { id: 'ing-1', name: 'Ripe Avocados', quantity: '2 large', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop', price: 4.99, originalPrice: 6.99, inStock: true },
      { id: 'ing-2', name: 'Sourdough Bread', quantity: '4 slices', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop', price: 5.49, inStock: true },
      { id: 'ing-3', name: 'Cherry Tomatoes', quantity: '1 cup', image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200&h=200&fit=crop', price: 3.99, inStock: true },
      { id: 'ing-4', name: 'Fresh Lemon', quantity: '1', image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=200&h=200&fit=crop', price: 0.79, inStock: true },
      { id: 'ing-5', name: 'Red Pepper Flakes', quantity: '1 tsp', image: 'https://images.unsplash.com/photo-1599909533786-c1e2941d7a83?w=200&h=200&fit=crop', price: 2.99, inStock: false },
      { id: 'ing-6', name: 'Sea Salt', quantity: 'to taste', image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=200&h=200&fit=crop', price: 3.49, inStock: true },
    ],
    instructions: [
      { step: 1, text: 'Toast the sourdough bread slices until golden brown and crispy.' },
      { step: 2, text: 'Cut the avocados in half, remove the pit, and scoop the flesh into a bowl.' },
      { step: 3, text: 'Mash the avocado with a fork until slightly chunky. Add a squeeze of lemon juice.', tip: 'Keep it slightly chunky for better texture!' },
      { step: 4, text: 'Spread the mashed avocado generously on each toast slice.' },
      { step: 5, text: 'Halve the cherry tomatoes and arrange them on top of the avocado.' },
      { step: 6, text: 'Season with red pepper flakes and sea salt. Serve immediately.' },
    ],
    nutrition: {
      calories: 320,
      protein: '8g',
      carbs: '28g',
      fat: '22g',
    },
  },
  'all-1': {
    id: 'all-1',
    title: 'Pasta Primavera',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
    cookingTime: 30,
    servings: 4,
    difficulty: 'Medium',
    isVegetarian: true,
    tags: ['Main Course', 'Italian', 'Vegetarian'],
    description: 'A classic Italian pasta dish loaded with fresh seasonal vegetables in a light garlic and olive oil sauce.',
    ingredients: [
      { id: 'ing-1', name: 'Penne Pasta', quantity: '1 lb', image: 'https://images.unsplash.com/photo-1551462147-37885acc36f1?w=200&h=200&fit=crop', price: 2.99, inStock: true },
      { id: 'ing-2', name: 'Zucchini', quantity: '2 medium', image: 'https://images.unsplash.com/photo-1563252722-6434563a985d?w=200&h=200&fit=crop', price: 2.49, inStock: true },
      { id: 'ing-3', name: 'Bell Peppers', quantity: '2', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop', price: 3.99, inStock: true },
      { id: 'ing-4', name: 'Cherry Tomatoes', quantity: '1 cup', image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200&h=200&fit=crop', price: 3.99, inStock: true },
      { id: 'ing-5', name: 'Garlic', quantity: '4 cloves', image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2a5e?w=200&h=200&fit=crop', price: 0.99, inStock: true },
      { id: 'ing-6', name: 'Parmesan Cheese', quantity: '1/2 cup grated', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop', price: 6.99, inStock: true },
    ],
    instructions: [
      { step: 1, text: 'Bring a large pot of salted water to boil. Cook pasta according to package directions.' },
      { step: 2, text: 'While pasta cooks, slice zucchini and bell peppers into bite-sized pieces.' },
      { step: 3, text: 'Heat olive oil in a large skillet over medium-high heat. Add garlic and sauté for 30 seconds.' },
      { step: 4, text: 'Add the vegetables and cook for 5-7 minutes until tender-crisp.', tip: 'Don\'t overcook the vegetables - they should still have a slight crunch!' },
      { step: 5, text: 'Drain pasta, reserving 1/2 cup pasta water. Add pasta to the skillet with vegetables.' },
      { step: 6, text: 'Toss everything together, adding pasta water as needed. Top with Parmesan and serve.' },
    ],
    nutrition: {
      calories: 420,
      protein: '14g',
      carbs: '62g',
      fat: '12g',
    },
  },
};

// Default recipe for unknown IDs
const DEFAULT_RECIPE = {
  id: 'default',
  title: 'Delicious Recipe',
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  cookingTime: 30,
  servings: 4,
  difficulty: 'Medium' as const,
  isVegetarian: true,
  tags: ['Main Course'],
  description: 'A delicious recipe to try at home.',
  ingredients: [
    { id: 'ing-1', productId: 'ing-1', name: 'Fresh Ingredients', quantity: 'As needed', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop', price: 9.99, inStock: true, hasProduct: false },
  ],
  instructions: [
    { step: 1, text: 'Prepare all your ingredients.' },
    { step: 2, text: 'Cook according to preference.' },
    { step: 3, text: 'Serve and enjoy!' },
  ],
  nutrition: {
    calories: 350,
    protein: '12g',
    carbs: '40g',
    fat: '15g',
  },
  shoppableSummary: null,
};

// Similar recipes
const SIMILAR_RECIPES = [
  {
    id: 'sim-1',
    title: 'Eggs Benedict',
    image: 'https://images.unsplash.com/photo-1608039829572-9b5e7cf2a7c6?w=300&h=300&fit=crop',
    cookingTime: 25,
    isVegetarian: true,
    tags: ['Breakfast'],
  },
  {
    id: 'sim-2',
    title: 'Pancakes',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop',
    cookingTime: 20,
    isVegetarian: true,
    tags: ['Breakfast'],
  },
  {
    id: 'sim-3',
    title: 'French Toast',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=300&fit=crop',
    cookingTime: 15,
    isVegetarian: true,
    tags: ['Breakfast'],
  },
];

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();

  // Fetch basic recipe from API (for description, steps, nutrition, etc.)
  const { data: apiRecipe, isLoading: isRecipeLoading, error } = useRecipe(id);

  // Fetch shoppable recipe for ingredient product data
  const { data: shoppableRecipe, isLoading: isShoppableLoading } = useShoppableRecipe(id);

  const isLoading = isRecipeLoading || isShoppableLoading;

  // Build ingredients list - merge basic recipe with shoppable product data
  const buildIngredients = () => {
    // If we have shoppable recipe data, use it for ingredients (has product info)
    if (shoppableRecipe?.ingredients) {
      return shoppableRecipe.ingredients.map((ing) => ({
        id: ing.id,
        productId: ing.selectedProduct?.id || ing.id, // Use product ID for cart
        name: ing.name,
        quantity: `${ing.quantity}${ing.unit ? ' ' + ing.unit : ''}`,
        image: ing.selectedProduct?.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop',
        price: ing.selectedProduct?.price || 0,
        inStock: ing.selectedProduct?.inStock ?? true,
        preparation: ing.preparation,
        hasProduct: ing.selectedProduct !== null,
      }));
    }

    // Fall back to basic recipe ingredients (no product data)
    if (apiRecipe?.ingredients) {
      return apiRecipe.ingredients.map((ing: any) => ({
        id: ing.id,
        productId: ing.preferredProductId || ing.id,
        name: ing.name,
        quantity: `${ing.quantity}${ing.unit ? ' ' + ing.unit : ''}`,
        image: ing.preferredProduct?.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop',
        price: ing.preferredProduct?.price || 0,
        inStock: true,
        preparation: ing.preparation,
        hasProduct: !!ing.preferredProduct,
      }));
    }

    return DEFAULT_RECIPE.ingredients;
  };

  // Use API data if available, otherwise fall back to mock data
  const recipe = apiRecipe ? {
    id: apiRecipe.id,
    title: apiRecipe.title,
    image: apiRecipe.thumbnailUrl || apiRecipe.imageUrl || DEFAULT_RECIPE.image,
    cookingTime: apiRecipe.totalTime || (apiRecipe.prepTime + apiRecipe.cookTime),
    servings: apiRecipe.servings,
    difficulty: (apiRecipe.difficulty?.charAt(0).toUpperCase() + apiRecipe.difficulty?.slice(1)) as 'Easy' | 'Medium' | 'Hard' || 'Medium',
    isVegetarian: apiRecipe.dietaryTags?.includes('vegetarian') || false,
    tags: apiRecipe.tags?.map((t: any) => t.name || t) || [],
    description: apiRecipe.description || '',
    ingredients: buildIngredients(),
    instructions: apiRecipe.steps?.map((step: any) => ({
      step: step.stepNumber,
      text: step.instruction,
      tip: step.tip,
    })) || DEFAULT_RECIPE.instructions,
    nutrition: {
      calories: apiRecipe.calories || 0,
      protein: '-',
      carbs: '-',
      fat: '-',
    },
    // Add shoppable summary if available
    shoppableSummary: shoppableRecipe?.summary || null,
  } : (RECIPE_DATA[id || ''] || DEFAULT_RECIPE);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'ingredients' | 'instructions' | 'nutrition' | null>('ingredients');
  // Track quantity per ingredient (0 = not selected, 1+ = selected with quantity)
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>({});

  // Update selected ingredients when recipe loads (only auto-select items with products)
  useEffect(() => {
    if (recipe.ingredients) {
      const initialQuantities: Record<string, number> = {};
      recipe.ingredients.forEach(i => {
        // Auto-select with quantity 1 if in stock and has product
        initialQuantities[i.id] = (i.inStock && i.hasProduct) ? 1 : 0;
      });
      setIngredientQuantities(initialQuantities);
    }
  }, [apiRecipe, shoppableRecipe]);

  const toggleIngredient = (ingredientId: string) => {
    setIngredientQuantities(prev => ({
      ...prev,
      [ingredientId]: prev[ingredientId] > 0 ? 0 : 1,
    }));
  };

  const incrementQuantity = (ingredientId: string) => {
    setIngredientQuantities(prev => ({
      ...prev,
      [ingredientId]: Math.min((prev[ingredientId] || 0) + 1, 10), // Max 10
    }));
  };

  const decrementQuantity = (ingredientId: string) => {
    setIngredientQuantities(prev => ({
      ...prev,
      [ingredientId]: Math.max((prev[ingredientId] || 0) - 1, 0),
    }));
  };

  const addAllToCart = () => {
    recipe.ingredients
      .filter(ing => (ingredientQuantities[ing.id] || 0) > 0 && ing.inStock && ing.hasProduct)
      .forEach(ing => {
        const qty = ingredientQuantities[ing.id] || 1;
        // Add each item with the specified quantity
        for (let i = 0; i < qty; i++) {
          addItem({
            id: ing.productId || ing.id, // Use product ID for cart
            title: ing.name,
            image: ing.image,
            price: ing.price,
            originalPrice: 'originalPrice' in ing ? ing.originalPrice : undefined,
            weight: ing.quantity,
            isVegetarian: recipe.isVegetarian,
          });
        }
      });
  };

  // Calculate total price including quantities
  const selectedIngredientsTotal = recipe.ingredients
    .filter(ing => (ingredientQuantities[ing.id] || 0) > 0 && ing.inStock && ing.hasProduct)
    .reduce((sum, ing) => sum + (ing.price * (ingredientQuantities[ing.id] || 1)), 0);

  // Count total items (sum of all quantities)
  const selectedItemCount = recipe.ingredients
    .filter(ing => (ingredientQuantities[ing.id] || 0) > 0 && ing.inStock && ing.hasProduct)
    .reduce((sum, ing) => sum + (ingredientQuantities[ing.id] || 0), 0);

  // Count unique ingredients selected
  const selectedIngredientCount = recipe.ingredients.filter(
    ing => (ingredientQuantities[ing.id] || 0) > 0 && ing.inStock && ing.hasProduct
  ).length;

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <Pressable style={styles.loadingBackButton} onPress={() => router.back()}>
            <Icon name="chevron-left" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
            <Text style={styles.loadingText}>Loading recipe...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: recipe.image }}
          style={{ width: '100%', height: 320 }}
        />
        <View style={styles.heroOverlay}>
          <View style={[styles.headerButtons, { paddingTop: insets.top + tokens.spacing[2] }]}>
            <Pressable style={styles.headerButton} onPress={() => router.back()}>
              <Icon name="chevron-left" size="md" color={tokens.colors.semantic.surface.primary} />
            </Pressable>
            <View style={styles.headerRightButtons}>
              <Pressable
                style={styles.headerButton}
                onPress={() => setIsBookmarked(!isBookmarked)}
              >
                <Icon
                  name={isBookmarked ? 'bookmark-fill' : 'bookmark'}
                  size="md"
                  color={isBookmarked ? tokens.colors.semantic.brand.primary.default : tokens.colors.semantic.surface.primary}
                />
              </Pressable>
              <Pressable style={styles.headerButton}>
                <Icon name="share" size="md" color={tokens.colors.semantic.surface.primary} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipe Info Header */}
        <View style={styles.recipeHeader}>
          <View style={styles.tagsRow}>
            <View style={[styles.vegIndicator, !recipe.isVegetarian && styles.nonVegIndicator]}>
              <View style={[styles.vegDot, !recipe.isVegetarian && styles.nonVegDot]} />
            </View>
            {recipe.tags.map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text variant="h2" style={styles.recipeTitle}>{recipe.title}</Text>

          {/* Quick Info Row */}
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <Icon name="time" size="sm" color={tokens.colors.semantic.text.secondary} />
              <Text style={styles.quickInfoText}>{recipe.cookingTime} mins</Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Icon name="user" size="sm" color={tokens.colors.semantic.text.secondary} />
              <Text style={styles.quickInfoText}>{recipe.servings} servings</Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Icon name="bar-chart" size="sm" color={tokens.colors.semantic.text.secondary} />
              <Text style={styles.quickInfoText}>{recipe.difficulty}</Text>
            </View>
          </View>

          <Text style={styles.description}>{recipe.description}</Text>
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setExpandedSection(expandedSection === 'ingredients' ? null : 'ingredients')}
          >
            <View style={styles.sectionTitleRow}>
              <Text variant="h3" style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.ingredientCount}>
                <Text style={styles.ingredientCountText}>{recipe.ingredients.length} items</Text>
              </View>
            </View>
            <Icon
              name={expandedSection === 'ingredients' ? 'chevron-up' : 'chevron-down'}
              size="sm"
              color={tokens.colors.semantic.text.secondary}
            />
          </Pressable>

          {expandedSection === 'ingredients' && (
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient) => {
                const quantity = ingredientQuantities[ingredient.id] || 0;
                const isSelected = quantity > 0;
                const isOutOfStock = !ingredient.inStock;
                const hasNoProduct = !ingredient.hasProduct;
                const isDisabled = isOutOfStock || hasNoProduct;

                return (
                  <View
                    key={ingredient.id}
                    style={[styles.ingredientItem, isDisabled && styles.ingredientItemDisabled]}
                  >
                    <Pressable
                      style={[styles.checkbox, isSelected && styles.checkboxSelected, isDisabled && styles.checkboxDisabled]}
                      onPress={() => !isDisabled && toggleIngredient(ingredient.id)}
                    >
                      {isSelected && <Icon name="check" size="xs" color={tokens.colors.semantic.surface.primary} />}
                    </Pressable>

                    <Image
                      source={{ uri: ingredient.image }}
                      width={48}
                      height={48}
                      borderRadius={8}
                      style={isDisabled ? styles.ingredientImageDisabled : undefined}
                    />

                    <View style={styles.ingredientInfo}>
                      <Text
                        variant="bodySmall"
                        weight="medium"
                        style={[styles.ingredientName, isDisabled && styles.textDisabled]}
                      >
                        {ingredient.name}
                      </Text>
                      <Text style={[styles.ingredientQuantity, isDisabled && styles.textDisabled]}>
                        {ingredient.quantity}
                      </Text>
                      {isOutOfStock && !hasNoProduct && (
                        <Text style={styles.outOfStockText}>Out of stock</Text>
                      )}
                      {hasNoProduct && (
                        <Text style={styles.noProductText}>Not available in store</Text>
                      )}
                    </View>

                    {/* Quantity controls or price */}
                    {ingredient.hasProduct && !isOutOfStock ? (
                      <View style={styles.quantitySection}>
                        <Text style={styles.priceText}>
                          ${(ingredient.price * (quantity || 1)).toFixed(2)}
                        </Text>
                        <QuantityStepper
                          quantity={quantity}
                          onIncrement={() => incrementQuantity(ingredient.id)}
                          onDecrement={() => decrementQuantity(ingredient.id)}
                          min={0}
                          max={10}
                        />
                      </View>
                    ) : (
                      <View style={styles.ingredientPrice}>
                        <Text style={styles.textDisabled}>-</Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Add All to Cart Button */}
              <Pressable
                style={[styles.addAllButton, selectedItemCount === 0 && styles.addAllButtonDisabled]}
                onPress={addAllToCart}
                disabled={selectedItemCount === 0}
              >
                <View style={styles.addAllInfo}>
                  <Text style={styles.addAllText}>
                    Add {selectedItemCount} {selectedItemCount === 1 ? 'item' : 'items'} to cart
                  </Text>
                  <Text style={styles.addAllPrice}>${selectedIngredientsTotal.toFixed(2)}</Text>
                </View>
                <Icon name="bag" size="sm" color={tokens.colors.semantic.surface.primary} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setExpandedSection(expandedSection === 'instructions' ? null : 'instructions')}
          >
            <View style={styles.sectionTitleRow}>
              <Text variant="h3" style={styles.sectionTitle}>Instructions</Text>
              <View style={styles.ingredientCount}>
                <Text style={styles.ingredientCountText}>{recipe.instructions.length} steps</Text>
              </View>
            </View>
            <Icon
              name={expandedSection === 'instructions' ? 'chevron-up' : 'chevron-down'}
              size="sm"
              color={tokens.colors.semantic.text.secondary}
            />
          </Pressable>

          {expandedSection === 'instructions' && (
            <View style={styles.instructionsList}>
              {recipe.instructions.map((instruction) => (
                <View key={instruction.step} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{instruction.step}</Text>
                  </View>
                  <View style={styles.instructionContent}>
                    <Text style={styles.instructionText}>{instruction.text}</Text>
                    {'tip' in instruction && instruction.tip && (
                      <View style={styles.tipContainer}>
                        <Icon name="bulb" size="xs" color={tokens.colors.semantic.status.warning.default} />
                        <Text style={styles.tipText}>{instruction.tip}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Nutrition Section */}
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setExpandedSection(expandedSection === 'nutrition' ? null : 'nutrition')}
          >
            <Text variant="h3" style={styles.sectionTitle}>Nutrition Info</Text>
            <Icon
              name={expandedSection === 'nutrition' ? 'chevron-up' : 'chevron-down'}
              size="sm"
              color={tokens.colors.semantic.text.secondary}
            />
          </Pressable>

          {expandedSection === 'nutrition' && (
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.protein}</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.carbs}</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.fat}</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
          )}
        </View>

        {/* Similar Recipes */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitlePadded}>You might also like</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarRecipesContent}
          >
            {SIMILAR_RECIPES.map((similarRecipe) => (
              <Pressable
                key={similarRecipe.id}
                style={styles.similarRecipeCard}
                onPress={() => router.push(`/recipes/${similarRecipe.id}`)}
              >
                <Image
                  source={{ uri: similarRecipe.image }}
                  width={120}
                  height={100}
                  borderRadius={12}
                />
                <View style={styles.similarRecipeInfo}>
                  <View style={styles.similarTagsRow}>
                    <View style={[styles.vegIndicatorSmall, !similarRecipe.isVegetarian && styles.nonVegIndicator]}>
                      <View style={[styles.vegDotSmall, !similarRecipe.isVegetarian && styles.nonVegDot]} />
                    </View>
                    <View style={styles.smallTag}>
                      <Text style={styles.smallTagText}>{similarRecipe.tags[0]}</Text>
                    </View>
                  </View>
                  <Text variant="caption" weight="medium" numberOfLines={2} style={styles.similarRecipeTitle}>
                    {similarRecipe.title}
                  </Text>
                  <View style={styles.similarTimeRow}>
                    <Icon name="time" size="xs" color={tokens.colors.semantic.status.warning.default} />
                    <Text style={styles.similarTimeText}>{similarRecipe.cookingTime} mins</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  loadingBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: tokens.spacing[4],
    marginTop: tokens.spacing[2],
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[4],
  },
  loadingText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 16,
  },
  heroContainer: {
    position: 'relative',
    height: 320,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: tokens.spacing[2],
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
  recipeHeader: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[2],
  },
  vegIndicator: {
    width: 18,
    height: 18,
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
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  nonVegDot: {
    backgroundColor: tokens.colors.semantic.status.error.default,
  },
  vegIndicatorSmall: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.status.success.default,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  vegDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  tag: {
    backgroundColor: tokens.colors.semantic.status.success.subtle,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: 4,
  },
  tagText: {
    color: tokens.colors.semantic.status.success.default,
    fontSize: 12,
    fontWeight: '500',
  },
  recipeTitle: {
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[3],
  },
  quickInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  quickInfoText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 13,
  },
  quickInfoDivider: {
    width: 1,
    height: 16,
    backgroundColor: tokens.colors.semantic.border.subtle,
    marginHorizontal: tokens.spacing[3],
  },
  description: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 14,
    lineHeight: 22,
  },
  section: {
    marginBottom: tokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  sectionTitle: {
    color: tokens.colors.semantic.text.primary,
  },
  sectionTitlePadded: {
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    color: tokens.colors.semantic.text.primary,
  },
  ingredientCount: {
    backgroundColor: tokens.colors.semantic.surface.secondary,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: 12,
  },
  ingredientCountText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 12,
  },
  ingredientsList: {
    paddingHorizontal: tokens.spacing[4],
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[3],
    paddingVertical: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  ingredientItemDisabled: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: tokens.colors.semantic.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderColor: tokens.colors.semantic.status.success.default,
  },
  checkboxDisabled: {
    borderColor: tokens.colors.semantic.border.subtle,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  ingredientImageDisabled: {
    opacity: 0.5,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  ingredientQuantity: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 12,
  },
  textDisabled: {
    color: tokens.colors.semantic.text.tertiary,
  },
  outOfStockText: {
    color: tokens.colors.semantic.status.error.default,
    fontSize: 11,
    marginTop: 2,
  },
  noProductText: {
    color: tokens.colors.semantic.text.tertiary,
    fontSize: 11,
    marginTop: 2,
  },
  ingredientPrice: {
    alignItems: 'flex-end',
  },
  quantitySection: {
    alignItems: 'flex-end',
    gap: tokens.spacing[2],
  },
  priceText: {
    color: tokens.colors.semantic.text.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  originalPriceText: {
    color: tokens.colors.semantic.text.tertiary,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderRadius: 12,
    paddingVertical: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[4],
    marginTop: tokens.spacing[4],
    marginBottom: tokens.spacing[2],
  },
  addAllButtonDisabled: {
    backgroundColor: tokens.colors.semantic.text.tertiary,
    opacity: 0.6,
  },
  addAllInfo: {
    flex: 1,
  },
  addAllText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  addAllPrice: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  instructionsList: {
    paddingHorizontal: tokens.spacing[4],
  },
  instructionItem: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
    paddingVertical: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: tokens.colors.semantic.surface.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    color: tokens.colors.semantic.text.primary,
    fontSize: 14,
    lineHeight: 22,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.status.warning.subtle,
    padding: tokens.spacing[3],
    borderRadius: 8,
    marginTop: tokens.spacing[2],
  },
  tipText: {
    flex: 1,
    color: tokens.colors.semantic.status.warning.default,
    fontSize: 13,
    fontStyle: 'italic',
  },
  nutritionGrid: {
    flexDirection: 'row',
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  nutritionItem: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 12,
    padding: tokens.spacing[3],
    alignItems: 'center',
  },
  nutritionValue: {
    color: tokens.colors.semantic.text.primary,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: tokens.spacing[1],
  },
  nutritionLabel: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 11,
  },
  similarRecipesContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  similarRecipeCard: {
    width: 120,
  },
  similarRecipeInfo: {
    marginTop: tokens.spacing[2],
  },
  similarTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    marginBottom: tokens.spacing[1],
  },
  smallTag: {
    backgroundColor: tokens.colors.semantic.status.success.subtle,
    paddingHorizontal: tokens.spacing[1],
    paddingVertical: 2,
    borderRadius: 4,
  },
  smallTagText: {
    color: tokens.colors.semantic.status.success.default,
    fontSize: 10,
    fontWeight: '500',
  },
  similarRecipeTitle: {
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[1],
  },
  similarTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  similarTimeText: {
    color: tokens.colors.semantic.text.secondary,
    fontSize: 11,
  },
});
