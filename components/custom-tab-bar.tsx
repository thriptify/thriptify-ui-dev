import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

const ACTIVE_COLOR = tokens.colors.semantic.brand.primary.default;
const INACTIVE_COLOR = tokens.colors.semantic.text.tertiary;

const TAB_ICONS: Record<string, any> = {
  index: 'house.fill',
  reorder: 'bag.fill',
  categories: 'square.grid.2x2.fill',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  reorder: 'Order Again',
  categories: 'Categories',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabBarWrapper}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.tabBarOverlay} />
        <View style={styles.tabBarContent}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                <View style={styles.iconWrapper}>
                  {isFocused && (
                    <LinearGradient
                      colors={[tokens.colors.primitives.yellow[100], tokens.colors.primitives.yellow[200], tokens.colors.primitives.yellow[300]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeGradient}
                    />
                  )}
                  <IconSymbol
                    size={18}
                    name={TAB_ICONS[route.name]}
                    color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
                  ]}
                >
                  {TAB_LABELS[route.name]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBarWrapper: {
    flexDirection: 'row',
    borderRadius: tokens.radius.xl + tokens.radius.md,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: tokens.shadows.md,
        }
      : {
          shadowColor: tokens.colors.primitives.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 6,
        }),
  },
  tabBarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.colors.semantic.glass.surface.light,
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingVertical: tokens.spacing[1] + 2,
    paddingHorizontal: tokens.spacing[4],
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 36,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeGradient: {
    position: 'absolute',
    width: 36,
    height: 24,
    borderRadius: tokens.radius.xl,
  },
  label: {
    fontSize: tokens.typography.fontSize.xs - 3,
    fontWeight: String(tokens.typography.fontWeight.medium) as '500',
    marginTop: -2,
  },
});
