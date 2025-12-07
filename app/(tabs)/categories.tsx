import { StyleSheet, View, Animated } from 'react-native';
import { useRef } from 'react';
import { useRouter } from 'expo-router';
import { Text } from '@thriptify/ui-elements';
import { CategoryTile } from '@thriptify/components';
import { tokens } from '@thriptify/tokens/react-native';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { CollapsibleHeader } from '@/components/collapsible-header';

// Category groups
const CATEGORY_GROUPS = [
  {
    id: 'grocery',
    title: 'Grocery & Kitchen',
    categories: [
      { id: 'vegetables', title: 'Vegetables & Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop' },
      { id: 'rice', title: 'Rice, Grains & Pasta', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
      { id: 'oil', title: 'Oil, Ghee & Spices', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop' },
      { id: 'dairy', title: 'Dairy, Bread & Eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop' },
      { id: 'bakery', title: 'Bakery & Biscuits', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop' },
      { id: 'cereals', title: 'Dry Fruits & Cereals', image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=200&h=200&fit=crop' },
      { id: 'meat', title: 'Meat & Seafood', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop' },
      { id: 'kitchen', title: 'Kitchenware', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'snacks',
    title: 'Snacks & Drinks',
    categories: [
      { id: 'chips', title: 'Chips & Snacks', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&h=200&fit=crop' },
      { id: 'chocolates', title: 'Sweets & Chocolates', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=200&fit=crop' },
      { id: 'drinks', title: 'Drinks & Juices', image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&h=200&fit=crop' },
      { id: 'tea', title: 'Tea, Coffee & Milk', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop' },
      { id: 'noodles', title: 'Noodles & Sauces', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop' },
      { id: 'spreads', title: 'Jams & Spreads', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop' },
      { id: 'frozen', title: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=200&h=200&fit=crop' },
      { id: 'icecream', title: 'Ice Cream', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'beauty',
    title: 'Beauty & Personal Care',
    categories: [
      { id: 'skincare', title: 'Skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop' },
      { id: 'haircare', title: 'Hair Care', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=200&h=200&fit=crop' },
      { id: 'makeup', title: 'Makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&h=200&fit=crop' },
      { id: 'fragrance', title: 'Fragrances', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'household',
    title: 'Household & Cleaning',
    categories: [
      { id: 'cleaning', title: 'Cleaning Supplies', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200&h=200&fit=crop' },
      { id: 'laundry', title: 'Laundry', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=200&h=200&fit=crop' },
      { id: 'fresheners', title: 'Air Fresheners', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop' },
      { id: 'tissue', title: 'Tissue & Disposables', image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=200&h=200&fit=crop' },
    ],
  },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

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
        {CATEGORY_GROUPS.map((group) => (
          <View key={group.id} style={styles.categoryGroup}>
            <Text variant="h3" style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.categoryGrid}>
              {group.categories.map((category) => (
                <CategoryTile
                  key={category.id}
                  title={category.title}
                  image={{ uri: category.image }}
                  size="md"
                  onPress={() => handleCategoryPress(category.id)}
                />
              ))}
            </View>
          </View>
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
  categoryGroup: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
  },
  groupTitle: {
    marginBottom: tokens.spacing[3],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[2],
  },
});
