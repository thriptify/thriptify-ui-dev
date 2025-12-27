import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { tokens } from '@thriptify/tokens/react-native';

const { colors, spacing, typography, radius } = tokens;

// Tip options
const TIP_OPTIONS = [
  { label: 'No Tips', value: 0 },
  { label: '$2', value: 2 },
  { label: '$5', value: 5 },
  { label: '$10', value: 10 },
  { label: '$20', value: 20 },
];

interface DeliveryReviewProps {
  orderId: string;
  driverName: string;
  driverPhoto?: string;
  onBack: () => void;
  onSubmit: (data: {
    rating: number;
    tip: number;
    comment: string;
  }) => void;
}

export function DeliveryReview({
  orderId,
  driverName,
  driverPhoto,
  onBack,
  onSubmit,
}: DeliveryReviewProps) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        tip: selectedTip,
        comment: comment.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Animated.Text
              entering={FadeIn.delay(star * 100)}
              style={[
                styles.star,
                rating >= star && styles.starFilled,
              ]}
            >
              ★
            </Animated.Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Animated.Text style={styles.backIcon}>←</Animated.Text>
        </TouchableOpacity>
        <Animated.Text style={styles.headerTitle}>Rider Review</Animated.Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Driver Info */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.driverSection}>
          {driverPhoto ? (
            <Image source={{ uri: driverPhoto }} style={styles.driverPhoto} />
          ) : (
            <View style={styles.driverPhotoPlaceholder}>
              <Animated.Text style={styles.driverPhotoText}>
                {driverName.charAt(0).toUpperCase()}
              </Animated.Text>
            </View>
          )}
          <Animated.Text style={styles.driverName}>{driverName}</Animated.Text>
          <Animated.Text style={styles.driverRole}>Delivery Driver</Animated.Text>
        </Animated.View>

        {/* Rating Section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.ratingSection}>
          <Animated.Text style={styles.sectionTitle}>
            Please Rate Delivery Service
          </Animated.Text>
          {renderStars()}
        </Animated.View>

        {/* Tip Section */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.tipSection}>
          <Animated.Text style={styles.sectionTitle}>Add Tips</Animated.Text>
          <View style={styles.tipOptions}>
            {TIP_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.tipButton,
                  selectedTip === option.value && styles.tipButtonSelected,
                ]}
                onPress={() => setSelectedTip(option.value)}
              >
                <Animated.Text
                  style={[
                    styles.tipButtonText,
                    selectedTip === option.value && styles.tipButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Comment Section */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.commentSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a Comment"
            placeholderTextColor={colors.semantic.text.tertiary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
        </Animated.View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing[4] }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          <Animated.Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Animated.Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.semantic.border.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.semantic.text.primary,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.semantic.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[6],
  },
  driverSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  driverPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing[4],
  },
  driverPhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.semantic.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  driverPhotoText: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.semantic.text.secondary,
  },
  driverName: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.semantic.text.primary,
    marginBottom: spacing[1],
  },
  driverRole: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    color: colors.semantic.text.secondary,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg,
    fontWeight: '500',
    color: colors.semantic.text.primary,
    marginBottom: spacing[4],
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  starButton: {
    padding: spacing[1],
  },
  star: {
    fontSize: 40,
    color: colors.semantic.border.primary,
  },
  starFilled: {
    color: '#FBBF24', // Amber/Gold for stars
  },
  tipSection: {
    marginBottom: spacing[6],
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tipButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.semantic.border.primary,
    backgroundColor: colors.semantic.surface.primary,
  },
  tipButtonSelected: {
    backgroundColor: colors.semantic.text.primary,
    borderColor: colors.semantic.text.primary,
  },
  tipButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.semantic.text.primary,
  },
  tipButtonTextSelected: {
    color: colors.semantic.text.inverse,
  },
  commentSection: {
    marginBottom: spacing[6],
  },
  commentInput: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    color: colors.semantic.text.primary,
    backgroundColor: colors.semantic.surface.secondary,
    borderRadius: radius.lg,
    padding: spacing[4],
    minHeight: 120,
  },
  bottomContainer: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.semantic.border.primary,
  },
  submitButton: {
    backgroundColor: colors.semantic.brand.primary.default,
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.semantic.text.inverse,
  },
});

export default DeliveryReview;
