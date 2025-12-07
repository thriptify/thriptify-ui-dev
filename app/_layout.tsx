import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartProvider } from '@/contexts/cart-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <CartProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[id]"
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="cart"
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="checkout"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen
            name="search"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen name="account/index" options={{ headerShown: false }} />
          <Stack.Screen name="account/profile" options={{ headerShown: false }} />
          <Stack.Screen name="account/addresses" options={{ headerShown: false }} />
          <Stack.Screen name="account/payments" options={{ headerShown: false }} />
          <Stack.Screen name="account/orders" options={{ headerShown: false }} />
          <Stack.Screen name="account/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="account/wallet" options={{ headerShown: false }} />
          <Stack.Screen name="recipes/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="recipes/[id]"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CartProvider>
  );
}
