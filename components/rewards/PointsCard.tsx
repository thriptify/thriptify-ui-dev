import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { LoyaltyDashboard } from '@/hooks/use-loyalty';

interface PointsCardProps {
  dashboard: LoyaltyDashboard;
  onRedeemPress?: () => void;
}

export function PointsCard({ dashboard, onRedeemPress }: PointsCardProps) {
  const { points, tier, storeCredit } = dashboard;
  const currentTier = tier.current;
  const nextTierPoints = tier.nextTierPoints;

  // Calculate progress to next tier
  const progressPercent = nextTierPoints
    ? Math.min(100, (points.current / (points.current + nextTierPoints)) * 100)
    : 100;

  // Get tier color
  const tierColors: Record<string, [string, string]> = {
    standard: ['#6B7280', '#4B5563'],
    silver: ['#9CA3AF', '#6B7280'],
    gold: ['#F59E0B', '#D97706'],
    platinum: ['#8B5CF6', '#7C3AED'],
  };

  const tierGradient = currentTier
    ? tierColors[currentTier.slug] || tierColors.standard
    : tierColors.standard;

  return (
    <View style={styles.container}>
      {/* Main Points Card */}
      <LinearGradient
        colors={[tokens.colors.semantic.brand.primary.default, tokens.colors.semantic.brand.primary.hover]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.pointsLabel}>Available Points</Text>
            <Text style={styles.pointsValue}>{points.current.toLocaleString()}</Text>
          </View>
          <View style={styles.tierBadge}>
            <LinearGradient
              colors={tierGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tierGradient}
            >
              <Icon name="star-fill" size="xs" color="#FFF" />
              <Text style={styles.tierText}>{currentTier?.name || 'Standard'}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Progress to next tier */}
        {nextTierPoints && nextTierPoints > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {nextTierPoints.toLocaleString()} pts to next tier
            </Text>
          </View>
        )}

        {/* Credit Value */}
        <View style={styles.creditRow}>
          <Text style={styles.creditLabel}>Worth in store credit:</Text>
          <Text style={styles.creditValue}>${points.creditValue.toFixed(2)}</Text>
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{points.lifetime.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Lifetime Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${storeCredit.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Store Credit</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{dashboard.stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
      </View>

      {/* Redeem Button */}
      {points.creditValue > 0 && onRedeemPress && (
        <Pressable style={styles.redeemButton} onPress={onRedeemPress}>
          <Icon name="gift" size="sm" color={tokens.colors.semantic.brand.primary.default} />
          <Text style={styles.redeemText}>Redeem Points</Text>
          <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.text.tertiary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: tokens.colors.semantic.brand.primary.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  pointsValue: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '700',
  },
  tierBadge: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  tierGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  tierText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  creditLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  creditValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    marginTop: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: tokens.colors.semantic.border.subtle,
    marginVertical: 4,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    marginTop: 12,
    padding: 14,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  redeemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
});
