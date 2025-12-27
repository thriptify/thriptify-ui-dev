import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppAuth } from '@/contexts/auth-context';
import { Text, Image } from '@thriptify/ui-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '@thriptify/tokens/react-native';
import { ENDPOINTS } from '@thriptify/api-types';
import { StoryViewer, Story } from './StoryViewer';

const VIEWED_STORIES_KEY = '@thriptify/viewed_stories';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface StoryItem {
  id: string;
  title: string;
  image: string;
  isNew?: boolean;
  gradientColors?: [string, string];
  slides?: {
    id: string;
    image: string;
    caption?: string;
    link?: {
      text: string;
      url: string;
    };
  }[];
}

export interface StoryCarouselProps {
  items: StoryItem[];
  onStoryViewed?: () => void; // Callback to refresh data after viewing
}

export function StoryCarousel({ items, onStoryViewed }: StoryCarouselProps) {
  const { isAuthenticated, getToken } = useAppAuth();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load viewed stories from AsyncStorage on mount (for guests only)
  useEffect(() => {
    // Only load once, and only for guests
    if (hasLoadedRef.current) return;

    const loadViewedStories = async () => {
      try {
        if (!isAuthenticated) {
          const stored = await AsyncStorage.getItem(VIEWED_STORIES_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setViewedStories(new Set(parsed));
          }
        }
      } catch (error) {
        console.warn('Failed to load viewed stories:', error);
      } finally {
        hasLoadedRef.current = true;
        setIsLoaded(true);
      }
    };
    loadViewedStories();
  }, [isAuthenticated]);

  // Save viewed stories to AsyncStorage (for guests only)
  const saveViewedStories = useCallback(async (stories: Set<string>) => {
    if (isAuthenticated) return; // Don't use AsyncStorage for authenticated users
    try {
      await AsyncStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify([...stories]));
    } catch (error) {
      console.warn('Failed to save viewed stories:', error);
    }
  }, [isAuthenticated]);

  // Mark story as viewed on server (for authenticated users)
  const markStoryViewedOnServer = useCallback(async (storyId: string) => {
    if (!isAuthenticated) return;
    try {
      const token = await getToken();
      if (!token) return;

      await fetch(`${API_URL}${ENDPOINTS.content.storyView(storyId)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.warn('Failed to mark story as viewed on server:', error);
    }
  }, [isAuthenticated, getToken]);

  // Mark story as viewed
  const markAsViewed = useCallback((storyId: string) => {
    if (isAuthenticated) {
      // For authenticated users: call API
      markStoryViewedOnServer(storyId);
    } else {
      // For guests: use local storage
      setViewedStories(prev => {
        if (prev.has(storyId)) return prev;
        const updated = new Set(prev).add(storyId);
        saveViewedStories(updated);
        return updated;
      });
    }

    // Also update local state for immediate UI feedback
    setViewedStories(prev => {
      if (prev.has(storyId)) return prev;
      return new Set(prev).add(storyId);
    });
  }, [isAuthenticated, markStoryViewedOnServer, saveViewedStories]);

  // Sort items: unviewed first, viewed at the end
  const sortedItems = useMemo(() => {
    if (!isLoaded) return items;

    const unviewed: StoryItem[] = [];
    const viewed: StoryItem[] = [];

    for (const item of items) {
      // For authenticated users: use API's isNew flag (server knows what they've seen)
      // For guests: use local viewedStories state
      const isViewed = isAuthenticated
        ? (item.isNew === false || viewedStories.has(item.id))
        : viewedStories.has(item.id);

      if (isViewed) {
        viewed.push(item);
      } else {
        unviewed.push(item);
      }
    }

    return [...unviewed, ...viewed];
  }, [items, viewedStories, isLoaded, isAuthenticated]);

  const handleStoryPress = (index: number) => {
    // Don't mark as viewed here - it will be marked when the story ends
    // Marking here would cause sortedItems to re-sort, making the index wrong
    setSelectedStoryIndex(index);
    setViewerVisible(true);
  };

  const handleClose = () => {
    setViewerVisible(false);
    // Trigger refresh to get updated viewed state from server
    if (isAuthenticated && onStoryViewed) {
      onStoryViewed();
    }
  };

  const handleStoryEnd = (storyId: string) => {
    markAsViewed(storyId);
  };

  // Convert sorted StoryItem to Story format for viewer
  const storiesForViewer: Story[] = useMemo(() =>
    sortedItems.map(item => ({
      id: item.id,
      title: item.title,
      avatar: item.image,
      gradientColors: item.gradientColors,
      slides: item.slides || [
        {
          id: `${item.id}-1`,
          image: item.image,
          caption: `Explore ${item.title}`,
          link: {
            text: 'Shop Now',
            url: `/category/${item.id}`,
          },
        },
      ],
    })),
  [sortedItems]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sortedItems.map((item, index) => {
          const isViewed = viewedStories.has(item.id) || item.isNew === false;
          const showNewBadge = item.isNew && !viewedStories.has(item.id);
          return (
            <Pressable
              key={item.id}
              style={styles.storyItem}
              onPress={() => handleStoryPress(index)}
            >
              {/* Ring with gradient */}
              <View style={styles.ringContainer}>
                {isViewed ? (
                  <View style={styles.viewedRing}>
                    <View style={styles.innerRing}>
                      <Image
                        source={{ uri: item.image }}
                        width={56}
                        height={56}
                        borderRadius={28}
                      />
                    </View>
                  </View>
                ) : (
                  <LinearGradient
                    colors={item.gradientColors || [tokens.colors.primitives.red[400], tokens.colors.primitives.yellow[300]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientRing}
                  >
                    <View style={styles.innerRing}>
                      <Image
                        source={{ uri: item.image }}
                        width={56}
                        height={56}
                        borderRadius={28}
                      />
                    </View>
                  </LinearGradient>
                )}
                {showNewBadge && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
              <Text variant="caption" numberOfLines={1} style={styles.storyTitle}>
                {item.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Story Viewer Modal */}
      <StoryViewer
        visible={viewerVisible}
        stories={storiesForViewer}
        initialStoryIndex={selectedStoryIndex}
        onClose={handleClose}
        onStoryEnd={handleStoryEnd}
      />
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
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  ringContainer: {
    position: 'relative',
    marginBottom: tokens.spacing[1],
  },
  gradientRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewedRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: tokens.colors.semantic.border.default,
  },
  innerRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: tokens.colors.semantic.surface.primary,
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -14,
    backgroundColor: tokens.colors.semantic.status.success.default,
    paddingHorizontal: tokens.spacing[1],
    paddingVertical: 1,
    borderRadius: tokens.radius.sm,
  },
  newBadgeText: {
    color: tokens.colors.semantic.text.inverse,
    fontSize: tokens.typography.fontSize.xs - 4,
    fontWeight: String(tokens.typography.fontWeight.bold) as '700',
  },
  storyTitle: {
    color: tokens.colors.semantic.text.primary,
    textAlign: 'center',
    fontSize: tokens.typography.fontSize.xs - 1,
  },
});
