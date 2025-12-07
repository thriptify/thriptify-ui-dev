# Thriptify UI Development Guidelines

This document outlines the best practices for developing UI components in the Thriptify application.

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Before You Code](#before-you-code)
3. [Using Design Tokens](#using-design-tokens)
4. [Using Existing Components](#using-existing-components)
5. [Creating New Components](#creating-new-components)
6. [Common Patterns](#common-patterns)
7. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Design System Overview

Thriptify uses a three-tier design token system:

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 3: Component Mapped                                    │
│  (components.button, components.card, components.nav, etc.)  │
├─────────────────────────────────────────────────────────────┤
│  TIER 2: Semantic Aliases                                    │
│  (semantic.surface, semantic.text, semantic.status, etc.)    │
├─────────────────────────────────────────────────────────────┤
│  TIER 1: Primitives                                          │
│  (primitives.blue[600], primitives.gray[100], etc.)          │
└─────────────────────────────────────────────────────────────┘
```

### Packages

- **@thriptify/tokens** - Design tokens (colors, spacing, shadows, radius)
- **@thriptify/ui-elements** - Primitive UI components (Button, Text, Icon, Image, etc.)
- **@thriptify/components** - Composite business components (BottomNav, ProductCard, CartItem, etc.)

---

## Before You Code

**ALWAYS check existing resources before writing new code:**

### 1. Check for Existing Components

```bash
# Search in @thriptify/components
ls node_modules/@thriptify/components/dist/components/

# Or explore the source
ls /path/to/thriptify-libs/packages/components/src/components/
```

**Available components include:**
- Navigation: `Header`, `BottomNav`, `TabBar`, `Sidebar`, `CategoryNavBar`
- Shopping: `AddToCartButton`, `CartItem`, `QuantitySelector`, `PriceDisplay`
- Product: `ProductCard`, `CategoryTile`, `ReviewCard`, `Rating`
- Forms: `SearchBar`, `FormField`, `FilterBar`, `SortSelector`
- Layout: `EmptyState`, `ErrorState`, `ListItem`, `BottomSheet`

### 2. Check Available Tokens

```typescript
import { tokens } from '@thriptify/tokens/react-native';

// Explore what's available:
console.log(tokens.colors);   // All color tokens
console.log(tokens.spacing);  // Spacing scale
console.log(tokens.shadows);  // Shadow definitions
console.log(tokens.radius);   // Border radius values
```

### 3. Use the Theme Hook

```typescript
import { useTheme } from '@thriptify/ui-elements';

const MyComponent = () => {
  const theme = useTheme();

  // Access theme values
  console.log(theme.colors);   // Theme-aware colors
  console.log(theme.spacing);  // Spacing values
  console.log(theme.radius);   // Border radius values
  console.log(theme.shadows);  // Shadow definitions
};
```

---

## Using Design Tokens

### Colors

```typescript
// ❌ DON'T use hardcoded colors
backgroundColor: '#2E7D32'
color: '#6B7280'

// ✅ DO use semantic tokens
import { tokens } from '@thriptify/tokens/react-native';

backgroundColor: tokens.colors.semantic.status.success.default
color: tokens.colors.semantic.text.secondary

// ✅ OR use theme hook for dynamic theming
import { useTheme } from '@thriptify/ui-elements';

const theme = useTheme();
backgroundColor: theme.colors.success
color: theme.colors.textSecondary
```

### Color Token Reference

| Purpose | Token Path |
|---------|------------|
| Success/Green | `semantic.status.success.default` |
| Error/Red | `semantic.status.error.default` |
| Warning/Yellow | `semantic.status.warning.default` |
| Primary/Blue | `semantic.brand.primary.default` |
| Text Primary | `semantic.text.primary` |
| Text Secondary | `semantic.text.secondary` |
| Background | `semantic.surface.primary` |
| Border | `semantic.border.default` |

### Spacing

```typescript
// ❌ DON'T use arbitrary pixel values
padding: 16
marginBottom: 24
gap: 8

// ✅ DO use spacing tokens
import { tokens } from '@thriptify/tokens/react-native';

padding: tokens.spacing[4]      // 16px
marginBottom: tokens.spacing[6] // 24px
gap: tokens.spacing[2]          // 8px
```

### Spacing Scale

| Token | Value |
|-------|-------|
| `spacing[1]` | 4px |
| `spacing[2]` | 8px |
| `spacing[3]` | 12px |
| `spacing[4]` | 16px |
| `spacing[6]` | 24px |
| `spacing[8]` | 32px |

### Border Radius

```typescript
// ❌ DON'T use arbitrary values
borderRadius: 10
borderRadius: 9999

// ✅ DO use radius tokens
borderRadius: tokens.radius.lg   // 10px
borderRadius: tokens.radius.full // 9999 (pills/circles)
```

### Shadows

```typescript
// ❌ DON'T write custom shadow styles
boxShadow: '0 4px 16px rgba(0,0,0,0.2)'

// ✅ DO use shadow tokens
import { tokens } from '@thriptify/tokens/react-native';

// For web
boxShadow: tokens.shadows.md

// For native (Platform-specific)
...Platform.select({
  web: { boxShadow: theme.shadows.md },
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
})
```

---

## Using Existing Components

### Bottom Navigation

```typescript
import { BottomNav } from '@thriptify/components';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'cart', label: 'Cart', icon: 'bag', badge: 3 },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

<BottomNav
  items={NAV_ITEMS}
  selectedId={currentTab}
  onSelect={(id) => navigate(id)}
/>
```

### Product Card

```typescript
import { ProductCard } from '@thriptify/components';

<ProductCard
  title="Organic Avocados"
  price={4.99}
  originalPrice={6.99}
  image="https://..."
  rating={4.5}
  onPress={() => navigateToProduct(id)}
  onAddToCart={() => addToCart(item)}
/>
```

### Add to Cart Button

```typescript
import { AddToCartButton } from '@thriptify/components';

<AddToCartButton
  inCart={isInCart}
  quantity={quantity}
  onPress={handleAddToCart}
/>
```

### Search Bar

```typescript
import { SearchBar } from '@thriptify/components';

<SearchBar
  value={searchText}
  onChangeText={setSearchText}
  onSearch={handleSearch}
  placeholder="Search products..."
/>
```

---

## Creating New Components

When you need to create a new component:

### 1. Check if it should be in the design system

If the component is reusable across the app, consider adding it to `@thriptify/components`.

### 2. Use the Theme Hook

```typescript
import { useTheme } from '@thriptify/ui-elements';

export const MyComponent = () => {
  const theme = useTheme();

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      padding: theme.spacing[4],
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    }}>
      <Text style={{ color: theme.colors.text }}>
        Content here
      </Text>
    </View>
  );
};
```

### 3. Document the Component

```typescript
/**
 * MyComponent
 *
 * Brief description of what the component does.
 * Uses theme tokens for consistent styling.
 *
 * @example
 * <MyComponent title="Hello" onPress={() => {}} />
 */
export const MyComponent = ({ title, onPress }: MyComponentProps) => {
  // ...
};
```

---

## Common Patterns

### Floating Action Button

```typescript
import { useTheme } from '@thriptify/ui-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FloatingButton = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={{
        position: 'absolute',
        bottom: insets.bottom + 70,
        right: theme.spacing[4],
        backgroundColor: theme.colors.success,
        borderRadius: theme.radius.full,
        padding: theme.spacing[3],
      }}
    >
      {/* content */}
    </Pressable>
  );
};
```

### Card with Shadow

```typescript
const Card = ({ children }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing[4],
        ...Platform.select({
          web: { boxShadow: theme.shadows.card },
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          android: { elevation: 2 },
        }),
      }}
    >
      {children}
    </View>
  );
};
```

### Status Badge

```typescript
const StatusBadge = ({ status }) => {
  const theme = useTheme();

  const colors = {
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
  };

  return (
    <View style={{
      backgroundColor: colors[status],
      paddingHorizontal: theme.spacing[2],
      paddingVertical: theme.spacing[1],
      borderRadius: theme.radius.sm,
    }}>
      <Text style={{ color: theme.colors.textInverse }}>
        {status}
      </Text>
    </View>
  );
};
```

---

## Anti-Patterns to Avoid

### ❌ Hardcoded Colors

```typescript
// BAD
backgroundColor: '#2E7D32'
color: '#6B7280'
borderColor: '#E5E7EB'
```

### ❌ Arbitrary Pixel Values

```typescript
// BAD
padding: 17
marginTop: 23
borderRadius: 11
```

### ❌ Duplicating Existing Components

```typescript
// BAD - Creating custom tab bar when BottomNav exists
const CustomTabBar = () => { ... }

// GOOD - Use existing component
import { BottomNav } from '@thriptify/components';
```

### ❌ Inline Styles Without Theme

```typescript
// BAD
<View style={{ backgroundColor: 'white', padding: 16 }}>

// GOOD
const theme = useTheme();
<View style={{
  backgroundColor: theme.colors.surface,
  padding: theme.spacing[4]
}}>
```

### ❌ Platform-Specific Shadows Without Abstraction

```typescript
// BAD - Inconsistent shadow handling
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,

// GOOD - Use Platform.select with theme
...Platform.select({
  web: { boxShadow: theme.shadows.md },
  ios: { shadowColor: '#000', shadowOffset: {...}, ... },
  android: { elevation: 4 },
})
```

---

## Quick Reference

### Import Cheatsheet

```typescript
// Tokens
import { tokens } from '@thriptify/tokens/react-native';

// UI Elements (primitives)
import {
  Button,
  Text,
  Icon,
  Image,
  Badge,
  useTheme
} from '@thriptify/ui-elements';

// Components (composites)
import {
  BottomNav,
  Header,
  ProductCard,
  CartItem,
  AddToCartButton,
  SearchBar,
  CategoryTile,
} from '@thriptify/components';
```

### Token Access

```typescript
// Direct token access
tokens.colors.semantic.status.success.default
tokens.colors.primitives.yellow[400]
tokens.spacing[4]
tokens.radius.lg
tokens.shadows.md

// Theme hook access
const theme = useTheme();
theme.colors.success
theme.colors.primary
theme.spacing[4]
theme.radius.lg
```

---

## Summary

1. **Always check existing components first** before creating new ones
2. **Use design tokens** for all colors, spacing, radius, and shadows
3. **Use the `useTheme` hook** for dynamic theming support
4. **Document new components** with JSDoc comments
5. **Follow the token hierarchy**: Semantic > Primitives
6. **Keep components consistent** with the design system
