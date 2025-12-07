import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { Text, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - tokens.spacing[4] * 2;
const BANNER_HEIGHT = 160;

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
}

export interface BannerCarouselProps {
  items: BannerItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function BannerCarousel({
  items,
  autoPlay = true,
  autoPlayInterval = 4000,
}: BannerCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Progress bar animation
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    // Reset and start progress animation
    progressAnim.setValue(0);
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: autoPlayInterval,
      useNativeDriver: false,
    });
    animation.start();

    return () => animation.stop();
  }, [activeIndex, autoPlay, autoPlayInterval, items.length, progressAnim]);

  // Auto-play effect
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % items.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (BANNER_WIDTH + tokens.spacing[3]),
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeIndex, autoPlay, autoPlayInterval, items.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (BANNER_WIDTH + tokens.spacing[3]));
    if (index !== activeIndex && index >= 0 && index < items.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + tokens.spacing[3]}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.banner,
              { backgroundColor: item.backgroundColor || tokens.colors.semantic.brand.primary.default },
            ]}
            onPress={item.onPress}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextContainer}>
                <Text
                  variant="h3"
                  style={[styles.bannerTitle, { color: item.textColor || '#FFFFFF' }]}
                >
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text
                    variant="body"
                    style={[styles.bannerSubtitle, { color: item.textColor || '#FFFFFF' }]}
                  >
                    {item.subtitle}
                  </Text>
                )}
              </View>
              <Image
                source={{ uri: item.image }}
                width={120}
                height={120}
                borderRadius={12}
                style={styles.bannerImage}
              />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Pagination Dots with Progress */}
      {items.length > 1 && (
        <View style={styles.pagination}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            >
              {index === activeIndex && autoPlay && (
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing[4],
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing[4],
    gap: tokens.spacing[3],
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing[4],
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: tokens.spacing[3],
  },
  bannerTitle: {
    marginBottom: tokens.spacing[1],
  },
  bannerSubtitle: {
    opacity: 0.9,
  },
  bannerImage: {
    position: 'absolute',
    right: tokens.spacing[3],
    bottom: tokens.spacing[2],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: tokens.spacing[3],
    gap: tokens.spacing[1],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.semantic.text.tertiary,
    overflow: 'hidden',
  },
  dotActive: {
    width: 24,
    backgroundColor: tokens.colors.semantic.border.subtle,
  },
  progressBar: {
    height: '100%',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 3,
  },
});
