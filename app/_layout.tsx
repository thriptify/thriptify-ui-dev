import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import * as SplashScreenExpo from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { StripeProvider } from '@stripe/stripe-react-native';
import {
  useFonts,
  Kanit_300Light,
  Kanit_400Regular,
  Kanit_500Medium,
  Kanit_600SemiBold,
  Kanit_700Bold,
} from '@expo-google-fonts/kanit';
import 'react-native-reanimated';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartProvider } from '@/contexts/cart-context';
import { PaymentSecurityProvider } from '@/contexts/payment-security-context';
import { AuthProvider, useAppAuth } from '@/contexts/auth-context';
import { LocationProvider } from '@/contexts/location-context';
import { SplashScreen } from '@/components/SplashScreen';
import { LoginScreen } from '@/components/auth';
import { OnboardingScreen } from '@/components/onboarding';
import { SKIP_AUTH_FOR_DEV } from '@/config/auth';

const ONBOARDING_COMPLETED_KEY = 'thriptify_onboarding_completed';

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Keep native splash screen visible while we load
SplashScreenExpo.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isGuest, continueAsGuest, isLoading: isAuthLoading, setPendingReferralCode } = useAppAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [skipAuth, setSkipAuth] = useState(SKIP_AUTH_FOR_DEV);

  // Hide native splash when custom splash is ready
  useEffect(() => {
    if (showSplash) {
      SplashScreenExpo.hideAsync();
    }
  }, [showSplash]);

  // Check if onboarding has been completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        setShowOnboarding(completed !== 'true');
      } catch {
        setShowOnboarding(true);
      }
    };
    checkOnboarding();
  }, []);

  // Handle deep links for referrals
  // Link format: thriptify://join?ref=CODE or https://thriptify.app/join?ref=CODE
  useEffect(() => {
    const handleDeepLink = (url: string | null) => {
      if (!url) return;

      try {
        const { path, queryParams } = Linking.parse(url);
        console.log('[DeepLink] Received:', url, 'Path:', path, 'Params:', queryParams);

        // Handle referral links
        if (queryParams?.ref) {
          const referralCode = String(queryParams.ref).toUpperCase();
          console.log('[DeepLink] Referral code found:', referralCode);
          setPendingReferralCode(referralCode);
        }
      } catch (error) {
        console.error('[DeepLink] Error parsing URL:', error);
      }
    };

    // Handle initial URL (app opened via deep link)
    Linking.getInitialURL().then(handleDeepLink);

    // Handle URL while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [setPendingReferralCode]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
    setShowOnboarding(false);
  };

  const handleSkipAuth = () => {
    setSkipAuth(true);
  };

  const handleContinueAsGuest = async () => {
    await continueAsGuest();
    // Go directly to home - location modal will show there
  };

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show onboarding for first-time users
  if (showOnboarding === null) {
    return null; // Loading onboarding state
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Wait for auth to be ready
  if (isAuthLoading) {
    return null;
  }

  // Show login screen if not authenticated and not guest (unless skipped for dev)
  if (!isAuthenticated && !isGuest && !skipAuth) {
    return (
      <LoginScreen
        onSkip={handleSkipAuth}
        showSkip={SKIP_AUTH_FOR_DEV}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  return (
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
        <Stack.Screen name="account/security-test" options={{ headerShown: false }} />
        <Stack.Screen name="account/favorites" options={{ headerShown: false }} />
        <Stack.Screen name="rewards" options={{ headerShown: false }} />
        <Stack.Screen name="recipes" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Load Kanit fonts
  const [fontsLoaded] = useFonts({
    Kanit_300Light,
    Kanit_400Regular,
    Kanit_500Medium,
    Kanit_600SemiBold,
    Kanit_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Load resources (fonts, data, etc.) if needed
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        // Native splash is hidden in RootLayoutNav when custom splash shows
      }
    }

    prepare();
  }, []);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.thriptify" // For Apple Pay (optional)
    >
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <PaymentSecurityProvider>
              <RootLayoutNav />
            </PaymentSecurityProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
