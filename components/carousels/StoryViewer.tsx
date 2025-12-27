import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
  Platform,
} from 'react-native';
import { Text, Image, Icon } from '@thriptify/ui-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '@thriptify/tokens/react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story slide

export interface StorySlide {
  id: string;
  image: string;
  caption?: string;
  link?: {
    text: string;
    url: string;
  };
}

export interface Story {
  id: string;
  title: string;
  avatar: string;
  slides: StorySlide[];
  gradientColors?: [string, string];
}

export interface StoryViewerProps {
  visible: boolean;
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
  onStoryEnd?: (storyId: string) => void;
}

export function StoryViewer({
  visible,
  stories,
  initialStoryIndex,
  onClose,
  onStoryEnd,
}: StoryViewerProps) {
  const insets = useSafeAreaInsets();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const currentStory = stories[currentStoryIndex];
  const currentSlide = currentStory?.slides[currentSlideIndex];

  // Reset when modal opens or story changes
  useEffect(() => {
    if (visible) {
      setCurrentStoryIndex(initialStoryIndex);
      setCurrentSlideIndex(0);
      progressAnim.setValue(0);
    }
  }, [visible, initialStoryIndex]);

  // Progress bar animation
  useEffect(() => {
    if (!visible || isPaused || !currentStory) return;

    progressAnim.setValue(0);
    progressAnimation.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });

    progressAnimation.current.start(({ finished }) => {
      if (finished) {
        goToNextSlide();
      }
    });

    return () => {
      progressAnimation.current?.stop();
    };
  }, [visible, currentStoryIndex, currentSlideIndex, isPaused]);

  const goToNextSlide = () => {
    if (currentSlideIndex < currentStory.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      progressAnim.setValue(0);
    } else {
      // Move to next story
      if (currentStoryIndex < stories.length - 1) {
        onStoryEnd?.(currentStory.id);
        setCurrentStoryIndex(currentStoryIndex + 1);
        setCurrentSlideIndex(0);
        progressAnim.setValue(0);
      } else {
        // End of all stories
        onStoryEnd?.(currentStory.id);
        onClose();
      }
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      progressAnim.setValue(0);
    } else {
      // Move to previous story
      if (currentStoryIndex > 0) {
        const prevStory = stories[currentStoryIndex - 1];
        setCurrentStoryIndex(currentStoryIndex - 1);
        setCurrentSlideIndex(prevStory.slides.length - 1);
        progressAnim.setValue(0);
      }
    }
  };

  const handleTap = (event: any) => {
    const tapX = event.nativeEvent.locationX;
    if (tapX < SCREEN_WIDTH / 3) {
      goToPreviousSlide();
    } else if (tapX > (SCREEN_WIDTH * 2) / 3) {
      goToNextSlide();
    }
  };

  const handleLongPressIn = () => {
    setIsPaused(true);
    progressAnimation.current?.stop();
  };

  const handleLongPressOut = () => {
    setIsPaused(false);
  };

  // Swipe down to close
  const panY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < 50;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        }
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  if (!visible || !currentStory || !currentSlide) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: panY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Story Image */}
        <Pressable
          style={styles.imageContainer}
          onPress={handleTap}
          onLongPress={handleLongPressIn}
          onPressOut={handleLongPressOut}
          delayLongPress={200}
        >
          <Image
            source={{ uri: currentSlide.image }}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            resizeMode="cover"
            style={styles.storyImage}
          />

          {/* Top gradient for visibility */}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent']}
            style={styles.topGradient}
          />

          {/* Bottom gradient for caption */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.bottomGradient}
          />
        </Pressable>

        {/* Progress bars */}
        <View style={[styles.progressContainer, { top: insets.top + 8 }]}>
          {currentStory.slides.map((slide, index) => (
            <View key={slide.id} style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width:
                      index < currentSlideIndex
                        ? '100%'
                        : index === currentSlideIndex
                        ? progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={[styles.header, { top: insets.top + 20 }]}>
          <View style={styles.userInfo}>
            <LinearGradient
              colors={currentStory.gradientColors || ['#FF6B6B', '#FFE66D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <View style={styles.avatarInner}>
                <Image
                  source={{ uri: currentStory.avatar }}
                  width={32}
                  height={32}
                  borderRadius={16}
                />
              </View>
            </LinearGradient>
            <Text style={styles.username}>{currentStory.title}</Text>
            <Text style={styles.timeAgo}>
              {currentSlideIndex + 1}/{currentStory.slides.length}
            </Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size="md" color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Caption */}
        {currentSlide.caption && (
          <View style={[styles.captionContainer, { bottom: insets.bottom + 20 }]}>
            <Text style={styles.caption}>{currentSlide.caption}</Text>
            {currentSlide.link && (
              <Pressable style={styles.linkButton}>
                <Icon name="chevron-up" size="sm" color="#FFFFFF" />
                <Text style={styles.linkText}>{currentSlide.link.text}</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Navigation hints */}
        <View style={styles.navHints}>
          <Pressable style={styles.navArea} onPress={goToPreviousSlide} />
          <Pressable style={styles.navArea} onPress={goToNextSlide} />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageContainer: {
    flex: 1,
  },
  storyImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  progressContainer: {
    position: 'absolute',
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  header: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#000000',
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeAgo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    alignSelf: 'center',
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  navHints: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  navArea: {
    flex: 1,
  },
});
