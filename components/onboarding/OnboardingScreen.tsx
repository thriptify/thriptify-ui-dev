import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { tokens } from '@thriptify/tokens/react-native';

const { width, height } = Dimensions.get('window');
const { colors, spacing, typography, radius } = tokens;

// Onboarding slide data
// Images are optional - will show placeholder if not found
const SLIDES = [
  {
    id: '1',
    // Replace with actual image: require('@/assets/images/onboarding/slide1.png')
    image: null,
    emoji: '🛒',
    title: 'Fresh Groceries\nDelivered Fast',
    description: 'Get fresh produce and pantry essentials delivered to your door in as little as 2 hours.',
  },
  {
    id: '2',
    // Replace with actual image: require('@/assets/images/onboarding/slide2.png')
    image: null,
    emoji: '🚚',
    title: 'We Deliver to\nYour Doorstep',
    description: 'Track your order in real-time and know exactly when your groceries will arrive.',
  },
  {
    id: '3',
    // Replace with actual image: require('@/assets/images/onboarding/slide3.png')
    image: null,
    emoji: '🥗',
    title: 'All Your Kitchen\nNeeds in One Place',
    description: 'From fresh vegetables to daily essentials, find everything you need for your kitchen.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderSlide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={item.image} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderContainer}>
              <Animated.Text style={styles.placeholderEmoji}>{item.emoji}</Animated.Text>
            </View>
          )}
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.pagination}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.textContent}>
            <Animated.Text style={styles.title}>{item.title}</Animated.Text>
            <Animated.Text style={styles.description}>{item.description}</Animated.Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip Button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + spacing[4] }]}
        onPress={handleSkip}
      >
        <Animated.Text style={styles.skipText}>Skip</Animated.Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      />

      {/* Next Button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing[8] }]}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Animated.Text style={styles.nextButtonIcon}>→</Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.surface.primary,
  },
  skipButton: {
    position: 'absolute',
    right: spacing[6],
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  skipText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.semantic.brand.primary.default,
    marginRight: spacing[1],
  },
  slide: {
    width,
    flex: 1,
  },
  imageContainer: {
    height: height * 0.55,
    backgroundColor: colors.semantic.surface.secondary,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.semantic.surface.secondary,
  },
  placeholderEmoji: {
    fontSize: 120,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.semantic.surface.primary,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    marginTop: -radius['3xl'],
    paddingHorizontal: spacing[8],
    paddingTop: spacing[8],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.border.primary,
    marginHorizontal: spacing[1],
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.semantic.brand.primary.default,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: 28,
    fontWeight: '700',
    color: colors.semantic.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: 36,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    color: colors.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.semantic.brand.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.semantic.brand.primary.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonIcon: {
    fontSize: 24,
    color: colors.semantic.text.inverse,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
