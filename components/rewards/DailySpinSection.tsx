import { StyleSheet, View, Pressable, Platform, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DailySpinSectionProps {
  canSpin: boolean;
  onSpin?: () => Promise<{ type: string; value: number } | null>;
}

export function DailySpinSection({ canSpin, onSpin }: DailySpinSectionProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ type: string; value: number } | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const handleSpin = async () => {
    if (!canSpin || isSpinning || !onSpin) return;

    setIsSpinning(true);
    setResult(null);

    // Start spin animation
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    try {
      const spinResult = await onSpin();
      setResult(spinResult);
    } catch (error) {
      // Error handling
    } finally {
      setIsSpinning(false);
    }
  };

  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'],
  });

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'points':
        return 'star-fill';
      case 'credit':
      case 'store_credit':
        return 'wallet';
      case 'discount':
        return 'tag-fill';
      case 'free_delivery':
        return 'truck';
      default:
        return 'gift';
    }
  };

  const getRewardLabel = (type: string, value: number) => {
    switch (type) {
      case 'points':
        return `${value} Points`;
      case 'credit':
      case 'store_credit':
        return `$${value} Credit`;
      case 'discount':
        return `${value}% Off`;
      case 'free_delivery':
        return 'Free Delivery';
      default:
        return `${value}`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Reward</Text>
        {!canSpin && !result && (
          <View style={styles.nextSpinBadge}>
            <Icon name="clock" size="xs" color={tokens.colors.semantic.text.secondary} />
            <Text style={styles.nextSpinText}>Come back tomorrow!</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        {/* Wheel */}
        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              { transform: [{ rotate: spinRotation }] },
            ]}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF9800', '#FFD54F', '#4CAF50', '#2196F3', '#9C27B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.wheelGradient}
            >
              <Icon name="gift" size="xl" color="#FFF" />
            </LinearGradient>
          </Animated.View>
          <View style={styles.wheelPointer}>
            <Icon name="caret-up-fill" size="md" color={tokens.colors.semantic.brand.primary.default} />
          </View>
        </View>

        {/* Result */}
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>You won!</Text>
            <View style={styles.resultBadge}>
              <Icon
                name={getRewardIcon(result.type)}
                size="md"
                color={tokens.colors.semantic.status.success.default}
              />
              <Text style={styles.resultValue}>
                {getRewardLabel(result.type, result.value)}
              </Text>
            </View>
          </View>
        )}

        {/* Spin Button */}
        {canSpin && !result && (
          <Pressable
            style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
            onPress={handleSpin}
            disabled={isSpinning}
          >
            <Text style={styles.spinButtonText}>
              {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
            </Text>
          </Pressable>
        )}

        {/* Already spun message */}
        {!canSpin && !result && (
          <View style={styles.alreadySpunMessage}>
            <Icon name="check-circle" size="md" color={tokens.colors.semantic.status.success.default} />
            <Text style={styles.alreadySpunText}>
              You've already spun today!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  nextSpinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextSpinText: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
  },
  card: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  wheelContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wheel: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  wheelGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelPointer: {
    position: 'absolute',
    bottom: -10,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 8,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tokens.colors.semantic.status.success.default + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.semantic.status.success.default,
  },
  spinButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  alreadySpunMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alreadySpunText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
  },
});
