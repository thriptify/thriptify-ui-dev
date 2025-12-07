import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Text, Image } from '@thriptify/ui-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '@thriptify/tokens/react-native';

export interface StoryItem {
  id: string;
  title: string;
  image: string;
  isNew?: boolean;
  gradientColors?: [string, string];
  onPress?: () => void;
}

export interface StoryCarouselProps {
  items: StoryItem[];
}

export function StoryCarousel({ items }: StoryCarouselProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.storyItem}
            onPress={item.onPress}
          >
            {/* Ring with gradient */}
            <View style={styles.ringContainer}>
              <LinearGradient
                colors={item.gradientColors || ['#FF6B6B', '#FFE66D']}
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
              {item.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
            <Text variant="caption" numberOfLines={1} style={styles.storyTitle}>
              {item.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
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
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  storyTitle: {
    color: tokens.colors.semantic.text.primary,
    textAlign: 'center',
    fontSize: 11,
  },
});
