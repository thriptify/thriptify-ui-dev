import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Text } from '@thriptify/ui-elements';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Colors extracted from the icon
const ICON_COLORS = {
  sageGreen: '#B5CC9E',
  sageGreenLight: '#C8DDB3',
  sageGreenDark: '#9BBD82',
  gold: '#D4A12A',
  darkGreen: '#2D6A4F',
  navy: '#4A5A7A',
  orange: '#D35400',
};

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // 1. Logo appears and scales up
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 2. Hold for a moment
      Animated.delay(1000),
      // 3. Fade out everything
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <LinearGradient
        colors={[ICON_COLORS.sageGreenLight, ICON_COLORS.sageGreen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoIcon}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.logoText}>Thriptify</Text>
        </Animated.View>

        {/* Decorative elements - using icon colors */}
        <View style={[styles.decorativeCircle1, { backgroundColor: ICON_COLORS.gold }]} />
        <View style={[styles.decorativeCircle2, { backgroundColor: ICON_COLORS.darkGreen }]} />
        <View style={[styles.decorativeCircle3, { backgroundColor: ICON_COLORS.navy }]} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 24,
  },
  logoText: {
    fontSize: 38,
    fontWeight: '700',
    color: ICON_COLORS.darkGreen,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.2,
    right: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: SCREEN_WIDTH * 0.25,
    opacity: 0.15,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -SCREEN_WIDTH * 0.3,
    left: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    opacity: 0.12,
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: SCREEN_WIDTH * 0.1,
    right: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    borderRadius: SCREEN_WIDTH * 0.2,
    opacity: 0.1,
  },
});
