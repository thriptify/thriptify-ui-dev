import React, { ReactNode } from 'react';
import { View, Pressable, ScrollView, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Text, Icon } from '@thriptify/ui-elements';
import { SearchBar } from '@thriptify/components';
import { tokens } from '@thriptify/tokens/react-native';

// Height of the collapsible part (delivery info row)
const HEADER_COLLAPSE_HEIGHT = 80;

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface CollapsibleHeaderProps {
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Callback when search is submitted */
  onSearch?: (text: string) => void;
  /** Callback when search bar is focused/pressed */
  onSearchFocus?: () => void;
  /** Optional tabs to show below search bar */
  tabs?: Tab[];
  /** Currently selected tab id */
  selectedTab?: string;
  /** Callback when tab is selected */
  onTabSelect?: (tabId: string) => void;
  /** Animated scroll value for collapsing effect */
  scrollY: Animated.Value;
  /** Children content (rendered in scrollable area) */
  children: ReactNode;
  /** Content container style */
  contentContainerStyle?: object;
}

export function CollapsibleHeader({
  searchPlaceholder = 'Search groceries, recipes...',
  onSearch,
  onSearchFocus,
  tabs,
  selectedTab,
  onTabSelect,
  scrollY,
  children,
  contentContainerStyle,
}: CollapsibleHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = React.useState('');

  // Calculate header translation (collapses the delivery info)
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_HEIGHT],
    outputRange: [0, -HEADER_COLLAPSE_HEIGHT],
    extrapolate: 'clamp',
  });

  // Opacity for delivery info (fades out as it scrolls)
  const deliveryOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Glass effect opacity (fades in as header collapses)
  const glassOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleSearchSubmit = (text: string) => {
    onSearch?.(text);
  };

  const handleSearchPress = () => {
    if (onSearchFocus) {
      onSearchFocus();
    }
  };

  // Calculate content padding based on header components
  const tabsHeight = tabs ? 80 : 0;
  const searchBarHeight = 56;
  const contentPaddingTop = insets.top + HEADER_COLLAPSE_HEIGHT + searchBarHeight + tabsHeight;

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top + tokens.spacing[2],
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        {/* Glass effect background - fades in when collapsed */}
        {Platform.OS !== 'web' && (
          <Animated.View style={[styles.glassBackground, { opacity: glassOpacity }]}>
            <BlurView intensity={80} tint="prominent" style={StyleSheet.absoluteFill} />
            <View style={styles.glassOverlay} />
          </Animated.View>
        )}

        {/* Solid background - fades out when collapsed */}
        <Animated.View
          style={[
            styles.solidBackground,
            { opacity: Animated.subtract(1, glassOpacity) },
          ]}
        />

        {/* Delivery Info - Collapses on scroll */}
        <Animated.View style={[styles.deliveryRow, { opacity: deliveryOpacity }]}>
          <View style={styles.deliveryInfo}>
            <Text variant="caption" style={styles.deliveryLabel}>Thriptify in</Text>
            <View style={styles.deliveryTimeRow}>
              <Text variant="h2" style={styles.deliveryTime}>2 hours</Text>
              <Icon name="chevron-down" size="sm" color={tokens.colors.semantic.text.primary} />
            </View>
            <Text variant="caption" style={styles.locationText}>San Francisco, CA</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton} onPress={() => router.push('/account/wallet')}>
              <Icon name="wallet" size="md" color={tokens.colors.semantic.text.primary} />
            </Pressable>
            <Pressable style={styles.headerButton} onPress={() => router.push('/account')}>
              <Icon name="user" size="md" color={tokens.colors.semantic.text.primary} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Search Bar - Becomes sticky */}
        <View style={styles.searchContainer}>
          {onSearchFocus ? (
            <Pressable onPress={handleSearchPress}>
              <View pointerEvents="none">
                <SearchBar
                  value={searchText}
                  onChangeText={setSearchText}
                  onSearch={handleSearchSubmit}
                  placeholder={searchPlaceholder}
                  showClearButton
                />
              </View>
            </Pressable>
          ) : (
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              onSearch={handleSearchSubmit}
              placeholder={searchPlaceholder}
              showClearButton
            />
          )}
        </View>

        {/* Optional Category Tabs - Becomes sticky */}
        {tabs && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
            style={styles.tabsContainer}
          >
            {tabs.map((tab) => {
              const isSelected = selectedTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => onTabSelect?.(tab.id)}
                  style={[styles.tab, isSelected && styles.tabSelected]}
                >
                  <Icon
                    name={tab.icon}
                    size="md"
                    color={isSelected ? tokens.colors.semantic.brand.primary.default : tokens.colors.semantic.text.secondary}
                  />
                  <Text
                    variant="caption"
                    style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}
                  >
                    {tab.label}
                  </Text>
                  {isSelected && <View style={styles.tabIndicator} />}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: contentPaddingTop },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingBottom: tokens.spacing[2],
    overflow: 'hidden',
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  solidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.colors.semantic.brand.primary.subtle,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: tokens.spacing[4],
    height: HEADER_COLLAPSE_HEIGHT,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryLabel: {
    color: tokens.colors.semantic.text.secondary,
    marginBottom: 2,
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  deliveryTime: {
    color: tokens.colors.semantic.text.primary,
  },
  locationText: {
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: tokens.spacing[2],
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: tokens.spacing[4],
  },
  tabsContainer: {
    maxHeight: 80,
  },
  tabsContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[4],
  },
  tab: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[2],
    minWidth: 60,
    position: 'relative',
  },
  tabSelected: {},
  tabLabel: {
    marginTop: tokens.spacing[1],
    color: tokens.colors.semantic.text.secondary,
  },
  tabLabelSelected: {
    color: tokens.colors.semantic.text.primary,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {},
});

export { HEADER_COLLAPSE_HEIGHT };
