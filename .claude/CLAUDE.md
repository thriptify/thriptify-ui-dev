# Thriptify Mobile App (UI Dev)

Customer-facing mobile app for the Thriptify grocery delivery platform.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Expo 54 + React Native 0.81.5 |
| React | 19.1.0 |
| Navigation | Expo Router (file-based) |
| Auth | Firebase (firebase) |
| State | React Context (cart, auth) |
| Storage | AsyncStorage, SecureStore |
| Animations | React Native Reanimated |
| Design System | @thriptify/tokens, ui-elements, components |

---

## Design Decisions

| Decision | Value |
|----------|-------|
| Currency | USD ($) |
| Measurements | miles / lbs |
| Address Format | US (Street, City, State, ZIP) |
| Payment Methods | Apple Pay, Google Pay, Cards |
| Delivery Promise | 2 hours |
| Typography | Poppins |
| Design Direction | Apple-like minimal |
| Dark Mode | Later phase |

---

## Project Structure

```
thriptify-ui-dev/
├── app/                        # Expo Router screens
│   ├── (tabs)/                 # Tab navigation screens
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Home tab
│   │   ├── categories.tsx      # Categories browser tab
│   │   └── reorder.tsx         # Order Again tab
│   ├── account/                # Account screens
│   │   ├── index.tsx           # Profile/menu screen
│   │   ├── profile.tsx         # Edit profile
│   │   ├── addresses.tsx       # Address management
│   │   ├── payments.tsx        # Payment methods
│   │   ├── orders.tsx          # Order history
│   │   ├── notifications.tsx   # Notification settings
│   │   └── wallet.tsx          # Thriptify Money wallet
│   ├── category/
│   │   └── [id].tsx            # Category detail with sidebar
│   ├── product/
│   │   └── [id].tsx            # Product detail
│   ├── recipes/
│   │   ├── index.tsx           # Recipe listing
│   │   └── [id].tsx            # Recipe detail
│   ├── cart.tsx                # Shopping cart
│   ├── checkout.tsx            # Multi-step checkout
│   ├── search.tsx              # Search with filters
│   ├── modal.tsx               # Modal template
│   └── _layout.tsx             # Root layout with providers
├── components/
│   ├── carousels/              # Story, Banner, Deal carousels
│   │   ├── StoryCarousel.tsx
│   │   ├── StoryViewer.tsx
│   │   ├── BannerCarousel.tsx
│   │   ├── DealCarousel.tsx
│   │   └── index.ts
│   ├── shared/                 # Reusable components
│   │   ├── ProductCard.tsx     # Product card with quantity controls
│   │   ├── QuantityStepper.tsx # Reusable +/- quantity control
│   │   ├── PriceDisplay.tsx    # Price with original/sale formatting
│   │   ├── CategoryGrid.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── HorizontalCarousel.tsx
│   │   └── styles.ts
│   ├── auth/                   # Auth components
│   │   ├── LoginScreen.tsx
│   │   ├── BiometricPrompt.tsx
│   │   └── index.ts
│   ├── home-sections/          # Home page sections
│   ├── ui/                     # Base UI components
│   ├── floating-cart-button.tsx
│   ├── SplashScreen.tsx
│   └── ...
├── contexts/
│   ├── cart-context.tsx        # Global cart state
│   └── payment-security-context.tsx
├── config/
│   ├── home-sections.ts        # Home page configuration
│   └── auth.ts                 # Auth configuration
├── constants/
│   └── theme.ts                # Theme constants
├── hooks/
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── lib/                        # Utilities
├── assets/                     # Images, fonts
└── scripts/                    # Dev scripts
```

---

## Shared Packages

All from `thriptify-libs/packages/`:

| Package | Usage |
|---------|-------|
| `@thriptify/tokens` | Colors, spacing, typography, shadows |
| `@thriptify/ui-elements` | Text, Icon, Image, Badge primitives |
| `@thriptify/components` | SearchBar, ProductCard composites |
| `@thriptify/api-types` | Zod schemas, TypeScript types, ENDPOINTS |

### Import Examples

```typescript
// Design tokens
import { colors, spacing, typography } from "@thriptify/tokens";

// UI primitives
import { Text, Icon, Badge } from "@thriptify/ui-elements";

// Composite components
import { SearchBar, ProductCard } from "@thriptify/components";

// API types
import type { Product, Category } from "@thriptify/api-types";
import { ENDPOINTS } from "@thriptify/api-types";
```

---

## Key Patterns

### Cart Context

```typescript
// Wrap app in CartProvider (app/_layout.tsx)
import { CartProvider } from "@/contexts/cart-context";

// Use in components
import { useCart } from "@/contexts/cart-context";

const { items, addItem, removeItem, updateQuantity, total, itemCount } = useCart();
```

### Navigation

```typescript
// Expo Router navigation
import { useRouter, useLocalSearchParams } from "expo-router";

const router = useRouter();

// Navigate to screens
router.push("/cart");
router.push(`/product/${productId}`);
router.push(`/category/${categoryId}`);

// Get route params
const { id } = useLocalSearchParams<{ id: string }>();
```

### Safe Area Handling

```typescript
import { useSafeAreaInsets } from "react-native-safe-area-context";

const insets = useSafeAreaInsets();

<View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
```

### Platform-Specific Shadows

```typescript
import { Platform } from "react-native";

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
  web: {
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
});
```

### Floating Cart Button

Add to any screen for cart access:

```typescript
import { FloatingCartButton } from "@/components/floating-cart-button";

// At the end of your screen's JSX
<FloatingCartButton />
```

### QuantityStepper Component

Reusable +/- quantity control used across the app:

```typescript
import { QuantityStepper } from "@/components/shared/QuantityStepper";

// Default variant (for lists like recipe ingredients)
<QuantityStepper
  quantity={2}
  onIncrement={() => setQty(q => q + 1)}
  onDecrement={() => setQty(q => q - 1)}
  min={0}
  max={10}
/>

// Compact variant (for ProductCard)
<QuantityStepper
  quantity={1}
  onIncrement={handleIncrement}
  onDecrement={handleDecrement}
  variant="compact"
  size="sm"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `quantity` | `number` | required | Current quantity value |
| `onIncrement` | `() => void` | required | Called when + is pressed |
| `onDecrement` | `() => void` | required | Called when - is pressed |
| `min` | `number` | `0` | Minimum allowed quantity |
| `max` | `number` | `99` | Maximum allowed quantity |
| `variant` | `'default' \| 'compact'` | `'default'` | Visual style |
| `size` | `'sm' \| 'md'` | `'md'` | Size of the control |
| `disabled` | `boolean` | `false` | Disable the control |

**Variants:**
- `default`: Gray background with outlined minus / green plus buttons (for lists)
- `compact`: Solid green pill with white icons (for ProductCard overlays)

**Used in:**
- `ProductCard.tsx` - Cart quantity in product cards
- `app/recipes/[id].tsx` - Ingredient quantities for "Add to Cart"

---

## Recipe Hooks

### useRecipe

Fetches basic recipe data (description, steps, nutrition):

```typescript
import { useRecipe } from "@/hooks/use-api";

const { data: recipe, isLoading, error, refetch } = useRecipe(recipeId);
// Returns: RecipeListItem with ingredients, steps, tags, etc.
```

### useShoppableRecipe

Fetches recipe with linked products for ingredients (for Add to Cart):

```typescript
import { useShoppableRecipe } from "@/hooks/use-api";

const { data: shoppableRecipe, isLoading } = useShoppableRecipe(recipeId);

// Each ingredient includes:
// - selectedProduct: { id, name, price, imageUrl, inStock }
// - sizeGroups: alternative product options by size
// - totalProducts: count of matching products
```

**ShoppableRecipe structure:**
```typescript
interface ShoppableRecipe {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  servings: number;
  ingredients: ShoppableIngredient[];
  summary: {
    totalItems: number;
    itemsWithProducts: number;
    estimatedTotal: number;
  };
}

interface ShoppableIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string | null;
  selectedProduct: ShoppableProductOption | null;
  sizeGroups: SizeGroup[];
  totalProducts: number;
}
```

**Usage in Recipe Detail:**
The recipe detail page uses both hooks:
1. `useRecipe` for description, steps, nutrition
2. `useShoppableRecipe` for ingredient product data

Ingredients without linked products show "Not available in store" and cannot be added to cart.

---

## Implementation Status

### Completed

| Feature | Screen(s) |
|---------|-----------|
| Home | `app/(tabs)/index.tsx` - Header, search, categories, products |
| Categories Tab | `app/(tabs)/categories.tsx` - Full category browser |
| Order Again Tab | `app/(tabs)/reorder.tsx` - Previous orders, frequently bought |
| Category Detail | `app/category/[id].tsx` - Sidebar nav, filters, product grid |
| Product Detail | `app/product/[id].tsx` - Gallery, variants, info, related |
| Cart | `app/cart.tsx` - Items, pricing, suggestions, tips |
| Checkout | `app/checkout.tsx` - Multi-step (address, delivery, payment) |
| Recipes | `app/recipes/` - Listing, detail, ingredients, instructions |
| Search | `app/search.tsx` - Results, filters, recent searches |
| Account | `app/account/` - Profile, addresses, payments, orders, notifications |
| Wallet | `app/account/wallet.tsx` - Thriptify Money, transactions |

### Pending

| Feature | Priority | Notes |
|---------|----------|-------|
| Onboarding flow | P1 | First-time user experience |
| Location selection | P1 | Address picker, delivery zone check |
| Push notifications | P1 | Expo Notifications integration |
| Deep linking | P2 | Universal links for sharing |
| Error states | P1 | API error handling UI |
| Loading states | P1 | Skeleton loaders |
| Empty states | P1 | No results, empty cart, etc. |
| Offline handling | P2 | Cache, offline mode |
| Auth integration | P0 | ✅ Firebase auth connected |
| API integration | P0 | Replace mock data with real API |

---

## Quick Commands

```bash
# Start Expo dev server
npm run start

# Platform-specific
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # Web browser

# With shared libs watch mode
npm run dev:ios      # iOS + watch tokens/ui-elements/components
npm run dev:android  # Android + watch libs
npm run dev:web      # Web + watch libs

# Linting
npm run lint
```

---

## API Integration (TODO)

When connecting to the backend API:

```typescript
// Use ENDPOINTS from shared package
import { ENDPOINTS } from "@thriptify/api-types";
import type { Product, Category } from "@thriptify/api-types";

// API base URL from env
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Example fetch
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_URL}${ENDPOINTS.products.list}`);
  const data = await response.json();
  return data.data;
};
```

### Environment Variables

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=thriptify-5534c.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=thriptify-5534c
```

---

## Reference Materials

- **Blinkit UI References:** `/Users/pavanikondapalli/Downloads/Blinkit/`
- **Technical Doc:** `thriptify-docs/technical/05-mobile-app.md`
- **Developer Guide:** `DEVELOPER_GUIDE.md` (in this repo)
- **Development Guidelines:** `DEVELOPMENT_GUIDELINES.md` (in this repo)
- **Progress Tracking:** `PROGRESS.md` (in this repo)

---

## Related Projects

| Project | Path | Purpose |
|---------|------|---------|
| API | `../thriptify-api/` | Backend API |
| Libs | `../thriptify-libs/` | Shared packages |
| Docs | `../thriptify-docs/` | Technical documentation |
| Admin | `../thriptify-admin/` | Admin dashboard |

See `/Users/pavanikondapalli/projects/thriptify/.claude/CLAUDE.md` for full project context.
