import React, { ReactNode, useState, useEffect } from 'react';
import { View, Pressable, ScrollView, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Text, Icon } from '@thriptify/ui-elements';
import { SearchBar } from '@thriptify/components';
import { tokens } from '@thriptify/tokens/react-native';
import { useLocation, formatAddressShort } from '@/contexts/location-context';

// Delivery slot configuration
const DELIVERY_SLOTS = [
  { start: 10, end: 12, cutoff: 10 },
  { start: 12, end: 14, cutoff: 12 },
  { start: 14, end: 16, cutoff: 14 },
  { start: 16, end: 18, cutoff: 16 },
  { start: 18, end: 20, cutoff: 18 },
];

function formatSlotTime(hour: number): string {
  if (hour === 12) return '12 PM';
  if (hour === 0) return '12 AM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

function getNextDeliverySlot(): { slot: typeof DELIVERY_SLOTS[0] | null; minutesRemaining: number } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  for (const slot of DELIVERY_SLOTS) {
    if (currentHour < slot.cutoff) {
      const minutesRemaining = (slot.cutoff - currentHour) * 60 - currentMinutes;
      return { slot, minutesRemaining };
    }
  }

  // After last slot, show tomorrow's first slot
  return { slot: DELIVERY_SLOTS[0], minutesRemaining: -1 };
}

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
  const [slotInfo, setSlotInfo] = useState(getNextDeliverySlot());
  const { deliveryAddress, formattedDeliveryTime, isBrowseMode } = useLocation();

  // Get display location
  const locationDisplay = deliveryAddress
    ? formatAddressShort(deliveryAddress)
    : 'Set delivery location';

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setSlotInfo(getNextDeliverySlot());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Format remaining time
  const getTimeRemainingText = () => {
    if (slotInfo.minutesRemaining < 0) {
      return 'Order now for tomorrow';
    }
    if (slotInfo.minutesRemaining < 60) {
      return `Order in ${slotInfo.minutesRemaining} min`;
    }
    const hours = Math.floor(slotInfo.minutesRemaining / 60);
    const mins = slotInfo.minutesRemaining % 60;
    return mins > 0 ? `Order in ${hours}h ${mins}m` : `Order in ${hours}h`;
  };

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
          <Pressable style={styles.deliveryInfo} onPress={() => router.push('/delivery-slots')}>
            <View style={styles.locationRow}>
              <Icon name="location" size="sm" color={tokens.colors.semantic.text.secondary} />
              <Text variant="caption" style={styles.locationText}>{locationDisplay}</Text>
              <Icon name="chevron-down" size="xs" color={tokens.colors.semantic.text.tertiary} />
            </View>
            {deliveryAddress && !isBrowseMode && (
              <View style={styles.slotInfo}>
                <View style={styles.slotTimeRow}>
                  <Text variant="bodySmall" weight="semibold" style={styles.slotLabel}>Est. delivery</Text>
                  <Text variant="bodySmall" weight="semibold" style={styles.slotTime}>
                    {formattedDeliveryTime || 'Checking...'}
                  </Text>
                </View>
                {slotInfo.slot && (
                  <View style={styles.countdownRow}>
                    <Icon name="clock" size="xs" color={tokens.colors.semantic.status.success.default} />
                    <Text variant="caption" style={styles.countdownText}>
                      {getTimeRemainingText()}
                    </Text>
                  </View>
                )}
              </View>
            )}
            {isBrowseMode && (
              <View style={styles.slotInfo}>
                <Text variant="caption" style={styles.browseModeText}>
                  Browse mode - ordering disabled
                </Text>
              </View>
            )}
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.coinsButton} onPress={() => router.push('/account/wallet')}>
              <Text style={styles.thunderEmoji}>⚡</Text>
              <Text variant="caption" weight="semibold" style={styles.coinsText}>2,450</Text>
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
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.65)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  solidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'android' ? '#E8F0FE' : tokens.colors.semantic.brand.primary.muted,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    marginBottom: tokens.spacing[2],
  },
  locationText: {
    color: tokens.colors.semantic.text.secondary,
  },
  slotInfo: {
    gap: tokens.spacing[1],
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  slotTime: {
    color: tokens.colors.semantic.text.primary,
  },
  slotLabel: {
    color: tokens.colors.semantic.text.secondary,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  countdownText: {
    color: tokens.colors.semantic.status.success.default,
  },
  browseModeText: {
    color: tokens.colors.semantic.status.warning.default,
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  coinsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
    paddingLeft: tokens.spacing[1],
    paddingRight: tokens.spacing[3],
    paddingVertical: tokens.spacing[1],
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.semantic.status.warning.subtle,
  },
  thunderEmoji: {
    fontSize: 16,
  },
  coinsText: {
    color: tokens.colors.semantic.status.warning.default,
  },
  headerButton: {
    width: tokens.spacing[10],
    height: tokens.spacing[10],
    borderRadius: tokens.spacing[5],
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
