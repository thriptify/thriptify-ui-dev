import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '@thriptify/components';
import { useTheme } from '@thriptify/ui-elements';
import { usePathname, useRouter } from 'expo-router';

const NAV_ITEMS = [
  { id: 'index', label: 'Home', icon: 'home' },
  { id: 'recipes', label: 'Recipes', icon: 'restaurant' },
  { id: 'reorder', label: 'Order Again', icon: 'bag' },
  { id: 'categories', label: 'Categories', icon: 'grid' },
];

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // Hide tab bar on web - will implement web navigation separately
  const isWeb = Platform.OS === 'web';

  // Get current tab from pathname
  const currentTab = pathname === '/' ? 'index' : pathname.replace('/', '');

  const handleSelect = (id: string) => {
    const route = id === 'index' ? '/' : `/${id}`;
    router.push(route as any);
  };

  if (isWeb) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="recipes" />
        <Tabs.Screen name="reorder" />
        <Tabs.Screen name="categories" />
      </Tabs>
    );
  }

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="recipes" />
        <Tabs.Screen name="reorder" />
        <Tabs.Screen name="categories" />
      </Tabs>

      {/* Custom Bottom Navigation */}
      <View style={[styles.navContainer, { paddingBottom: insets.bottom + 8 }]}>
        <BottomNav
          items={NAV_ITEMS}
          selectedId={currentTab}
          onSelect={handleSelect}
          variant="floating"
          activeColor={theme.colors.primary}
          inactiveColor={theme.colors.textTertiary}
          highlightColor={theme.colors.primarySubtle}
          backgroundColor={`${theme.colors.primary}15`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
