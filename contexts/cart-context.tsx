import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppAuth } from '@/contexts/auth-context';
import * as Crypto from 'expo-crypto';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const DEVICE_ID_KEY = '@thriptify/device_id';

// Types
export interface CartItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  weight: string;
  isVegetarian?: boolean;
}

interface ApiCartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string | null;
    unit: string;
    unitSize?: string | null;
    compareAtPrice: number | null;
    dietaryTags?: string[];
    inStock: boolean;
  };
}

interface ApiCart {
  id: string;
  items: ApiCartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  handlingFee: number;
  total: number;
  freeDeliveryThreshold: number;
  freeDeliveryProgress: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  handlingFee: number;
  total: number;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, 'quantity' | 'productId'> & { productId?: string }) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (productId: string) => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Default values for fees (used as fallback)
const DEFAULT_DELIVERY_FEE = 2.99;
const DEFAULT_HANDLING_FEE = 0.99;
const FREE_DELIVERY_THRESHOLD = 35;

interface CartProviderProps {
  children: ReactNode;
}

// Convert API cart item to local cart item
function apiItemToLocal(apiItem: ApiCartItem): CartItem {
  return {
    id: apiItem.id,
    productId: apiItem.product.id,
    title: apiItem.product.name,
    image: apiItem.product.imageUrl || '',
    price: apiItem.unitPrice,
    originalPrice: apiItem.product.compareAtPrice || undefined,
    quantity: apiItem.quantity,
    weight: apiItem.product.unitSize || apiItem.product.unit || '',
    isVegetarian: apiItem.product.dietaryTags?.includes('vegetarian'),
  };
}

export function CartProvider({ children }: CartProviderProps) {
  const { isAuthenticated, getToken } = useAppAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartData, setCartData] = useState<ApiCart | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Track previous sign-in state for cart merge
  const wasSignedInRef = useRef<boolean | undefined>(undefined);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Generate or retrieve device ID for guest carts
  useEffect(() => {
    const initDeviceId = async () => {
      try {
        let storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (!storedId) {
          storedId = Crypto.randomUUID();
          await AsyncStorage.setItem(DEVICE_ID_KEY, storedId);
        }
        setDeviceId(storedId);
      } catch {
        // Fallback to random ID if storage fails
        setDeviceId(Crypto.randomUUID());
      }
    };
    initDeviceId();
  }, []);

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    if (!deviceId) return;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
      };

      if (isAuthenticated) {
        const token = await getTokenRef.current();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/cart`, { headers });

      // 404 means no cart exists yet - this is normal, not an error
      if (response.status === 404) {
        setCartData(null);
        setItems([]);
        return;
      }

      if (!response.ok) {
        // Only log unexpected errors (not 404)
        if (__DEV__) {
          console.warn('[Cart] Fetch failed:', response.status);
        }
        return;
      }

      const data = await response.json();
      const cart = data.cart as ApiCart;

      setCartData(cart);
      setItems(cart.items.map(apiItemToLocal));
    } catch (err) {
      // Silently fail - network errors are expected when API is down
      if (__DEV__) {
        console.warn('[Cart] Network error - API may be offline');
      }
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, isAuthenticated]);

  // Initial cart fetch
  useEffect(() => {
    if (deviceId) {
      fetchCart();
    }
  }, [deviceId, fetchCart]);

  // Merge guest cart when user signs in
  useEffect(() => {
    const mergeCartOnSignIn = async () => {
      if (isAuthenticated && wasSignedInRef.current === false && deviceId) {
        try {
          const token = await getTokenRef.current();
          if (!token) return;

          const response = await fetch(`${API_BASE_URL}/api/v1/cart/merge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ deviceId }),
          });

          if (response.ok) {
            // Refresh cart after merge
            await fetchCart();
          }
        } catch {
          // Silently fail - merge is optional
        }
      }

      wasSignedInRef.current = isAuthenticated;
    };

    mergeCartOnSignIn();
  }, [isAuthenticated, deviceId, fetchCart]);

  // Add item to cart
  const addItem = useCallback(async (item: Omit<CartItem, 'quantity' | 'productId'> & { productId?: string }) => {
    if (!deviceId) return;

    const productId = item.productId || item.id;
    setIsSyncing(true);

    // Optimistic update
    setItems(prev => {
      const existingItem = prev.find(i => i.productId === productId || i.id === productId);
      if (existingItem) {
        return prev.map(i =>
          (i.productId === productId || i.id === productId)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, productId, quantity: 1 } as CartItem];
    });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
      };

      if (isAuthenticated) {
        const token = await getTokenRef.current();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/cart/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to add item');
      }

      const data = await response.json();
      if (data.cart) {
        // Update cart totals from response
        setCartData(prev => ({ ...prev, ...data.cart }));
        // Only update items if the response includes them, otherwise keep optimistic update
        if (data.cart.items && Array.isArray(data.cart.items)) {
          setItems(data.cart.items.map(apiItemToLocal));
        }
      }
    } catch {
      // Revert optimistic update on failure
      await fetchCart();
    } finally {
      setIsSyncing(false);
    }
  }, [deviceId, isAuthenticated, fetchCart]);

  // Remove item from cart
  const removeItem = useCallback(async (productId: string) => {
    if (!deviceId) return;

    setIsSyncing(true);

    // Optimistic update
    setItems(prev => prev.filter(item => item.productId !== productId && item.id !== productId));

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
      };

      if (isAuthenticated) {
        const token = await getTokenRef.current();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/cart/items/${productId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      const data = await response.json();
      if (data.cart) {
        setCartData(prev => ({ ...prev, ...data.cart }));
        if (data.cart.items && Array.isArray(data.cart.items)) {
          setItems(data.cart.items.map(apiItemToLocal));
        }
      }
    } catch {
      // Revert optimistic update on failure
      await fetchCart();
    } finally {
      setIsSyncing(false);
    }
  }, [deviceId, isAuthenticated, fetchCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!deviceId) return;

    if (quantity <= 0) {
      return removeItem(productId);
    }

    setIsSyncing(true);

    // Optimistic update
    setItems(prev =>
      prev.map(item =>
        (item.productId === productId || item.id === productId)
          ? { ...item, quantity }
          : item
      )
    );

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
      };

      if (isAuthenticated) {
        const token = await getTokenRef.current();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/cart/items/${productId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      const data = await response.json();
      if (data.cart) {
        setCartData(prev => ({ ...prev, ...data.cart }));
        if (data.cart.items && Array.isArray(data.cart.items)) {
          setItems(data.cart.items.map(apiItemToLocal));
        }
      }
    } catch {
      // Revert optimistic update on failure
      await fetchCart();
    } finally {
      setIsSyncing(false);
    }
  }, [deviceId, isAuthenticated, fetchCart, removeItem]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!deviceId) return;

    setIsSyncing(true);

    // Optimistic update
    setItems([]);
    setCartData(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
      };

      if (isAuthenticated) {
        const token = await getTokenRef.current();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
    } catch {
      // Revert optimistic update on failure
      await fetchCart();
    } finally {
      setIsSyncing(false);
    }
  }, [deviceId, isAuthenticated, fetchCart]);

  // Get quantity for a specific product
  const getItemQuantity = useCallback((productId: string) => {
    const item = items.find(i => i.productId === productId || i.id === productId);
    return item?.quantity || 0;
  }, [items]);

  // Computed values - use items as source of truth to avoid mismatch
  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return cartData?.subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartData, items]);

  const deliveryFee = useMemo(() => {
    if (cartData) return cartData.deliveryFee;
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  }, [cartData, subtotal]);

  const handlingFee = useMemo(() => {
    return cartData?.handlingFee ?? DEFAULT_HANDLING_FEE;
  }, [cartData]);

  const total = useMemo(() => {
    return cartData?.total ?? (subtotal + deliveryFee + handlingFee);
  }, [cartData, subtotal, deliveryFee, handlingFee]);

  const value = useMemo(() => ({
    items,
    itemCount,
    subtotal,
    deliveryFee,
    handlingFee,
    total,
    isLoading,
    isSyncing,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    refreshCart: fetchCart,
  }), [
    items,
    itemCount,
    subtotal,
    deliveryFee,
    handlingFee,
    total,
    isLoading,
    isSyncing,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    fetchCart,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Helper to get savings
export function getCartSavings(items: CartItem[]): number {
  return items.reduce((savings, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return savings + (item.originalPrice - item.price) * item.quantity;
    }
    return savings;
  }, 0);
}
