import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Text, Card, Button, Icon, CardContent, Divider } from '@thriptify/ui-elements';
import {
  ProductCard,
  RecipeCard,
  SearchBar,
  FormField,
  ContentModal,
  DatePicker,
  TimePicker,
  QuantitySelector,
  BottomSheet,
  EmptyState,
  ErrorState,
  Form,
  ListItem,
  Rating,
  PriceDisplay,
  CartItem,
  AddToCartButton,
  ImageGallery,
  FilterBar,
  SortSelector,
  Header,
  BottomNav,
  Sidebar,
  ReviewCard,
  TabBar,
  CategoryTile,
  CategoryNavBar,
  SubCategoryTile,
  ResponsiveGrid,
} from '@thriptify/components';
import { tokens } from '@thriptify/tokens/react-native';
import { useState } from 'react';

export default function ComponentsScreen() {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(new Date());
  const [quantity, setQuantity] = useState(1);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [rating, setRating] = useState(3.5);
  const [inCart, setInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [selectedNavTab, setSelectedNavTab] = useState('home');
  const [showSidebar, setShowSidebar] = useState(false);

  const filters = [
    { id: 'organic', label: 'Organic', count: 24 },
    { id: 'vegan', label: 'Vegan', count: 12 },
    { id: 'glutenFree', label: 'Gluten Free', count: 8 },
    { id: 'local', label: 'Local', count: 15 },
  ];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'newest', label: 'Newest First' },
    { id: 'priceAsc', label: 'Price: Low to High' },
    { id: 'priceDesc', label: 'Price: High to Low' },
  ];

  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'cart', label: 'Cart', icon: 'cart', badge: 3 },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ];

  const tabItems = [
    { id: 'all', label: 'All' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'dairy', label: 'Dairy' },
  ];

  const listItems = [
    { id: '1', title: 'Fresh Apples', subtitle: 'Organic, 1kg', leftIcon: 'nutrition' },
    { id: '2', title: 'Milk', subtitle: 'Whole, 1L', leftIcon: 'water', badge: 'New' },
    { id: '3', title: 'Bread', subtitle: 'Whole wheat', leftIcon: 'cube' },
  ];

  const galleryImages = [
    { uri: 'https://picsum.photos/400/300?random=1' },
    { uri: 'https://picsum.photos/400/300?random=2' },
    { uri: 'https://picsum.photos/400/300?random=3' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h1" style={styles.title}>Components Showcase</Text>
      <Text variant="body" style={styles.subtitle}>
        Composite components built from ui-elements
      </Text>

      {/* ProductCard Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>ProductCard Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Product display card with image, title, price, and actions
        </Text>
        
        <View style={styles.productCardExamples}>
          <ProductCard
            title="Organic Apples"
            description="Fresh organic apples from local farm"
            price={4.99}
            badge="New"
            badgeVariant="success"
            actionLabel="Add to Cart"
            onAction={() => console.log('Add to cart')}
            onPress={() => console.log('Card pressed')}
          />
          <ProductCard
            title="Premium Coffee"
            description="Single origin coffee beans"
            price={12.99}
            badge="Sale"
            badgeVariant="danger"
            actionLabel="Buy Now"
            onAction={() => console.log('Buy now')}
            section="groceries"
          />
          <ProductCard
            title="Recipe Card Example"
            description="Delicious pasta recipe with fresh ingredients"
            price="Free"
            badge="Popular"
            badgeVariant="info"
            actionLabel="View Recipe"
            onAction={() => console.log('View recipe')}
            section="recipes"
          />
        </View>
      </View>

      {/* RecipeCard Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>RecipeCard Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Recipe display card with image, title, time, servings, and difficulty
        </Text>
        
        <View style={styles.recipeCardExamples}>
          <RecipeCard
            title="Pasta Carbonara"
            description="Classic Italian pasta dish with eggs, cheese, and bacon"
            time={30}
            servings={4}
            difficulty="medium"
            badge="Popular"
            badgeVariant="success"
            actionLabel="View Recipe"
            onAction={() => console.log('View recipe')}
            section="recipes"
          />
          <RecipeCard
            title="Quick Breakfast"
            description="Simple and delicious morning meal"
            time={15}
            servings={2}
            difficulty="easy"
            badge="New"
            badgeVariant="info"
            actionLabel="Cook Now"
            onAction={() => console.log('Cook now')}
          />
        </View>
      </View>

      {/* SearchBar Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>SearchBar Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Search input with icon and clear button
        </Text>
        
        <View style={styles.searchBarExamples}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            onSearch={(text) => console.log('Search:', text)}
            placeholder="Search products..."
            showClearButton
          />
          <SearchBar
            placeholder="Search without clear button"
            showClearButton={false}
          />
        </View>
      </View>

      {/* FormField Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>FormField Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Complete form field with label, input, error handling, and helper text
        </Text>
        
        <View style={styles.formFieldExamples}>
          <FormField
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            required
          />
          <FormField
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
            required
            helperText="Must be at least 8 characters"
          />
          <FormField
            label="Email with Error"
            placeholder="Invalid email"
            value="invalid-email"
            error="Please enter a valid email address"
            required
          />
        </View>
      </View>

      {/* DatePicker Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>DatePicker Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Date selection input with platform-specific pickers
        </Text>
        
        <View style={styles.datePickerExamples}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Choose a date"
          />
          <DatePicker
            label="Delivery Date"
            value={deliveryDate}
            onChange={setDeliveryDate}
            placeholder="Select delivery date"
            minimumDate={new Date()}
            helperText="Select a future date for delivery"
            section="groceries"
          />
          <DatePicker
            label="Date with Error"
            value={undefined}
            onChange={setSelectedDate}
            placeholder="Invalid date"
            error="Please select a valid date"
          />
          <DatePicker
            label="Disabled Date Picker"
            value={new Date()}
            onChange={setSelectedDate}
            disabled
          />
        </View>
      </View>

      {/* TimePicker Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>TimePicker Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Time selection input with platform-specific pickers
        </Text>
        
        <View style={styles.timePickerExamples}>
          <TimePicker
            label="Select Time"
            value={selectedTime}
            onChange={setSelectedTime}
            placeholder="Choose a time"
          />
          <TimePicker
            label="Delivery Time"
            value={undefined}
            onChange={setSelectedTime}
            placeholder="Select delivery time"
            helperText="Choose your preferred delivery time"
            section="groceries"
          />
        </View>
      </View>

      {/* QuantitySelector Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>QuantitySelector Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Increment/decrement input for quantity selection
        </Text>
        
        <View style={styles.quantitySelectorExamples}>
          <QuantitySelector
            label="Quantity"
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={10}
            size="md"
          />
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            size="sm"
          />
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={5}
            size="lg"
            section="groceries"
          />
        </View>
      </View>

      {/* BottomSheet Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>BottomSheet Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Bottom sheet overlay for mobile interactions
        </Text>
        
        <View style={styles.bottomSheetExamples}>
          <Button variant="primary" onPress={() => setBottomSheetVisible(true)}>
            Open Bottom Sheet
          </Button>
        </View>
      </View>

      <BottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        title="Bottom Sheet Example"
        dismissible
        showCloseButton
      >
        <Text variant="body" style={{ marginBottom: tokens.spacing[4] }}>
          This is a bottom sheet. You can add any content here.
        </Text>
        <Button variant="primary" onPress={() => setBottomSheetVisible(false)}>
          Close Bottom Sheet
        </Button>
      </BottomSheet>

      {/* EmptyState Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>EmptyState Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Empty list state with icon, title, description, and optional action
        </Text>
        
        <View style={styles.emptyStateExamples}>
          <EmptyState
            icon="inbox"
            title="No items found"
            description="Start adding items to see them here"
            actionLabel="Add Item"
            onAction={() => console.log('Add item')}
          />
        </View>
      </View>

      {/* ErrorState Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>ErrorState Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Error display with icon, message, and optional retry action
        </Text>
        
        <View style={styles.errorStateExamples}>
          <ErrorState
            title="Failed to load"
            message="Unable to fetch data. Please check your connection and try again."
            retryLabel="Retry"
            onRetry={() => console.log('Retry')}
          />
        </View>
      </View>

      {/* ContentModal Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>ContentModal Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Dialog/modal overlay with backdrop and close functionality
        </Text>

        <View style={styles.modalExamples}>
          <Button variant="primary" onPress={() => setModalVisible(true)}>
            Open Modal
          </Button>
        </View>
      </View>

      <ContentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Example Modal"
        size="md"
        dismissible
        showCloseButton
      >
        <Text variant="body" style={{ marginBottom: tokens.spacing[4] }}>
          This is a modal dialog. You can add any content here.
        </Text>
        <Button variant="primary" onPress={() => setModalVisible(false)}>
          Close Modal
        </Button>
      </ContentModal>

      {/* ListItem Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>ListItem Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          List item with icon, title, subtitle, and actions
        </Text>

        <View style={styles.listItemExamples}>
          {listItems.map((item) => (
            <ListItem
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              leftIcon={item.leftIcon}
              badge={item.badge}
              rightIcon="chevron-right"
              onPress={() => console.log('Pressed:', item.title)}
            />
          ))}
        </View>
      </View>

      {/* Rating Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Rating Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Star rating display and input
        </Text>

        <View style={styles.ratingExamples}>
          <Rating value={4} showValue />
          <Rating value={rating} editable onChange={setRating} showValue />
          <Rating value={3.5} size="lg" />
        </View>
      </View>

      {/* PriceDisplay Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>PriceDisplay Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Formatted price with optional original price
        </Text>

        <View style={styles.priceDisplayExamples}>
          <PriceDisplay price={9.99} size="lg" />
          <PriceDisplay price={7.99} originalPrice={12.99} size="md" />
          <PriceDisplay price={199} currency="INR" size="md" />
        </View>
      </View>

      {/* CartItem Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>CartItem Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Shopping cart item with quantity controls
        </Text>

        <View style={styles.cartItemExamples}>
          <CartItem
            image={{ uri: 'https://picsum.photos/100/100?random=3' }}
            title="Organic Avocados"
            description="Pack of 3"
            price={8.99}
            quantity={2}
            onQuantityChange={(q) => console.log('Quantity:', q)}
            onRemove={() => console.log('Remove')}
          />
        </View>
      </View>

      {/* AddToCartButton Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>AddToCartButton Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Add to cart button with quantity state
        </Text>

        <View style={styles.addToCartExamples}>
          <AddToCartButton
            onPress={() => {
              setInCart(!inCart);
              if (!inCart) setCartQuantity(1);
              else setCartQuantity(0);
            }}
            inCart={inCart}
            quantity={cartQuantity}
          />
          <AddToCartButton
            label="Buy Now"
            variant="outline"
            onPress={() => console.log('Buy now')}
          />
        </View>
      </View>

      {/* ImageGallery Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>ImageGallery Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Image carousel/gallery with navigation
        </Text>

        <View style={styles.imageGalleryExamples}>
          <ImageGallery
            images={galleryImages}
            showThumbnails
            showNavigation
          />
        </View>
      </View>

      {/* FilterBar Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>FilterBar Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Filter chips for product filtering
        </Text>

        <View style={styles.filterBarExamples}>
          <FilterBar
            filters={filters}
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
            showCounts
          />
          <Text variant="caption" colorScheme="muted" style={{ marginTop: 8 }}>
            Selected: {selectedFilters.join(', ') || 'None'}
          </Text>
        </View>
      </View>

      {/* SortSelector Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>SortSelector Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Sort dropdown for product ordering
        </Text>

        <View style={styles.sortSelectorExamples}>
          <SortSelector
            options={sortOptions}
            selectedId={selectedSort}
            onChange={setSelectedSort}
          />
        </View>
      </View>

      {/* Header Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Header Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Page header with title and actions
        </Text>

        <View style={styles.headerExamples}>
          <Header
            title="Products"
            leftAction={
              <Pressable style={{ padding: 8 }}>
                <Icon name="arrow-left" size="md" />
              </Pressable>
            }
            rightActions={[
              <Pressable key="search" style={{ padding: 8 }}>
                <Icon name="search" size="md" />
              </Pressable>,
              <Pressable key="cart" style={{ padding: 8 }}>
                <Icon name="cart" size="md" />
              </Pressable>,
            ]}
          />
        </View>
      </View>

      {/* TabBar Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>TabBar Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Horizontal tab navigation
        </Text>

        <View style={styles.tabBarExamples}>
          <TabBar
            items={tabItems}
            selectedId={selectedNavTab}
            onSelect={setSelectedNavTab}
          />
        </View>
      </View>

      {/* BottomNav Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>BottomNav Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Bottom navigation bar with icons
        </Text>

        <View style={styles.bottomNavExamples}>
          <Card variant="outlined">
            <CardContent>
              <BottomNav
                items={navItems}
                selectedId={selectedNavTab}
                onSelect={setSelectedNavTab}
              />
            </CardContent>
          </Card>
          <Text variant="caption" colorScheme="muted" style={{ marginTop: 8 }}>
            Normally fixed at bottom of screen
          </Text>
        </View>
      </View>

      {/* ReviewCard Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>ReviewCard Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Customer review display card
        </Text>

        <View style={styles.reviewCardExamples}>
          <ReviewCard
            reviewerName="John Doe"
            rating={4.5}
            review="Great quality products! The apples were fresh and crispy. Will definitely order again."
            date={new Date('2024-01-15')}
            verified
          />
        </View>
      </View>

      {/* CategoryTile Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>CategoryTile Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Category selection tile with icon
        </Text>

        <View style={styles.categoryTileExamples}>
          <CategoryTile
            title="Fruits"
            icon="nutrition"
            onPress={() => console.log('Fruits')}
          />
          <CategoryTile
            title="Vegetables"
            icon="leaf"
            onPress={() => console.log('Vegetables')}
          />
          <CategoryTile
            title="Dairy"
            icon="water"
            onPress={() => console.log('Dairy')}
          />
        </View>
      </View>

      {/* SubCategoryTile Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>SubCategoryTile Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Subcategory tile with image
        </Text>

        <View style={styles.subCategoryTileExamples}>
          <SubCategoryTile
            title="Organic Fruits"
            image={{ uri: 'https://picsum.photos/100/100?random=10' }}
            icon="leaf"
            onPress={() => console.log('Organic Fruits')}
          />
          <SubCategoryTile
            title="Tropical"
            image={{ uri: 'https://picsum.photos/100/100?random=11' }}
            icon="star"
            active
            onPress={() => console.log('Tropical')}
          />
        </View>
      </View>

      {/* CategoryNavBar Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>CategoryNavBar Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Category navigation header
        </Text>

        <View style={styles.categoryNavBarExamples}>
          <CategoryNavBar
            categoryName="Groceries"
            onBack={() => console.log('Back')}
            onSearchPress={() => console.log('Search')}
          />
        </View>
      </View>

      {/* ResponsiveGrid Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>ResponsiveGrid Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Responsive grid layout for products
        </Text>

        <View style={styles.responsiveGridExamples}>
          <Text variant="caption" colorScheme="muted" style={{ marginBottom: 8 }}>
            Responsive grid with 2 columns on mobile
          </Text>
          <ResponsiveGrid columns={{ mobile: 2, tablet: 3, desktop: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} variant="outlined">
                <CardContent>
                  <Text>Item {i}</Text>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </View>
      </View>

      {/* Sidebar Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Sidebar Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Side navigation panel
        </Text>

        <View style={styles.sidebarExamples}>
          <Button onPress={() => setShowSidebar(true)}>Open Sidebar</Button>
          <Sidebar
            visible={showSidebar}
            onClose={() => setShowSidebar(false)}
            position="left"
          >
            <View style={{ padding: 16, gap: 12 }}>
              <Text variant="h4">Menu</Text>
              <Divider />
              <Text>Home</Text>
              <Text>Products</Text>
              <Text>Cart</Text>
              <Text>Profile</Text>
              <Divider />
              <Button variant="outline" onPress={() => setShowSidebar(false)}>Close</Button>
            </View>
          </Sidebar>
        </View>
      </View>

      {/* Form Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Form Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Form wrapper with validation support
        </Text>

        <View style={styles.formExamples}>
          <Form onSubmit={() => console.log('Form submitted')}>
            <FormField
              label="Username"
              placeholder="Enter username"
              required
            />
            <FormField
              label="Email"
              placeholder="Enter email"
              required
            />
            <Button type="submit">Submit Form</Button>
          </Form>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  content: {
    padding: tokens.spacing[4],
  },
  title: {
    marginBottom: tokens.spacing[2],
  },
  subtitle: {
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[8],
  },
  section: {
    marginBottom: tokens.spacing[8],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  sectionTitle: {
    marginBottom: tokens.spacing[2],
  },
  sectionDescription: {
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[4],
  },
  productCardExamples: {
    gap: tokens.spacing[4],
  },
  searchBarExamples: {
    gap: tokens.spacing[4],
  },
  formFieldExamples: {
    gap: tokens.spacing[4],
  },
  datePickerExamples: {
    gap: tokens.spacing[4],
  },
  recipeCardExamples: {
    gap: tokens.spacing[4],
  },
  timePickerExamples: {
    gap: tokens.spacing[4],
  },
  quantitySelectorExamples: {
    gap: tokens.spacing[4],
  },
  bottomSheetExamples: {
    gap: tokens.spacing[3],
    alignItems: 'flex-start',
  },
  emptyStateExamples: {
    gap: tokens.spacing[4],
  },
  errorStateExamples: {
    gap: tokens.spacing[4],
  },
  modalExamples: {
    gap: tokens.spacing[3],
    alignItems: 'flex-start',
  },
  listItemExamples: {
    gap: tokens.spacing[2],
  },
  ratingExamples: {
    gap: tokens.spacing[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  priceDisplayExamples: {
    gap: tokens.spacing[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cartItemExamples: {
    gap: tokens.spacing[4],
  },
  addToCartExamples: {
    gap: tokens.spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageGalleryExamples: {
    gap: tokens.spacing[4],
  },
  filterBarExamples: {
    gap: tokens.spacing[2],
  },
  sortSelectorExamples: {
    gap: tokens.spacing[3],
    alignItems: 'flex-start',
  },
  headerExamples: {
    gap: tokens.spacing[4],
  },
  tabBarExamples: {
    gap: tokens.spacing[4],
  },
  bottomNavExamples: {
    gap: tokens.spacing[2],
  },
  reviewCardExamples: {
    gap: tokens.spacing[4],
  },
  categoryTileExamples: {
    gap: tokens.spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subCategoryTileExamples: {
    gap: tokens.spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryNavBarExamples: {
    gap: tokens.spacing[4],
  },
  responsiveGridExamples: {
    gap: tokens.spacing[4],
  },
  sidebarExamples: {
    gap: tokens.spacing[3],
    alignItems: 'flex-start',
  },
  formExamples: {
    gap: tokens.spacing[4],
  },
});

