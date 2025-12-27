import { ScrollView, StyleSheet, View, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

import { useAppAuth } from '@/contexts/auth-context';
import {
  useLoyaltyDashboard,
  useDailyRewardStatus,
  spinWheel,
  redeemPoints,
  claimBadgeReward,
  joinChallenge,
  claimChallengeReward,
} from '@/hooks/use-loyalty';
import {
  PointsCard,
  ReferralCard,
  ReferralStatsModal,
  BadgesSection,
  ChallengesSection,
  DailySpinSection,
} from '@/components/rewards';
import type { CustomerBadge } from '@/hooks/use-loyalty';

// Mock referral data until API supports it
const MOCK_REFERRALS = [
  { id: '1', name: 'Sarah M.', status: 'completed' as const, date: 'Dec 15, 2024', reward: 5 },
  { id: '2', name: 'Mike J.', status: 'pending' as const, date: 'Dec 20, 2024', reward: 5 },
];

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAppAuth();
  const token = user ? (user as { spiAccessToken?: string }).spiAccessToken : null;

  // Fetch loyalty data
  const {
    data: dashboard,
    isLoading,
    error,
    refetch: refetchDashboard,
  } = useLoyaltyDashboard(token);

  const {
    data: dailyRewardStatus,
    refetch: refetchDailyReward,
  } = useDailyRewardStatus(token);

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [showReferralStats, setShowReferralStats] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDashboard(), refetchDailyReward()]);
    setRefreshing(false);
  }, [refetchDashboard, refetchDailyReward]);

  // Handle spin
  const handleSpin = async () => {
    if (!token) return null;
    try {
      const result = await spinWheel(token);
      await refetchDailyReward();
      await refetchDashboard();
      return result;
    } catch (error) {
      console.error('Spin failed:', error);
      return null;
    }
  };

  // Handle redeem points
  const handleRedeemPoints = async (points: number) => {
    if (!token) return false;
    setIsRedeeming(true);
    try {
      await redeemPoints(token, points);
      await refetchDashboard();
      return true;
    } catch (error) {
      console.error('Redeem failed:', error);
      return false;
    } finally {
      setIsRedeeming(false);
    }
  };

  // Handle badge press
  const handleBadgePress = async (badge: CustomerBadge) => {
    if (!token || badge.rewardClaimed) return;
    try {
      await claimBadgeReward(token, badge.badgeId);
      await refetchDashboard();
    } catch (error) {
      console.error('Claim badge reward failed:', error);
    }
  };

  // Handle join challenge
  const handleJoinChallenge = async (challengeId: string) => {
    if (!token) return;
    try {
      await joinChallenge(token, challengeId);
      await refetchDashboard();
    } catch (error) {
      console.error('Join challenge failed:', error);
    }
  };

  // Handle claim challenge reward
  const handleClaimChallengeReward = async (challengeId: string) => {
    if (!token) return;
    try {
      await claimChallengeReward(token, challengeId);
      await refetchDashboard();
    } catch (error) {
      console.error('Claim challenge reward failed:', error);
    }
  };

  // Calculate referral stats
  const completedReferrals = MOCK_REFERRALS.filter((r) => r.status === 'completed').length;
  const totalEarned = completedReferrals * 5;

  // Loading state
  if (isLoading && !dashboard) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
          <Text variant="h3" style={styles.headerTitle}>Rewards</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.semantic.brand.primary.default} />
        </View>
      </View>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
          <Text variant="h3" style={styles.headerTitle}>Rewards</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="warning" size="xl" color={tokens.colors.semantic.status.error.default} />
          <Text style={styles.errorText}>Failed to load rewards</Text>
          <Pressable style={styles.retryButton} onPress={() => refetchDashboard()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + tokens.spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-left" size="md" color={tokens.colors.semantic.text.primary} />
        </Pressable>
        <Text variant="h3" style={styles.headerTitle}>Rewards</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tokens.colors.semantic.brand.primary.default}
          />
        }
      >
        {/* Points Card */}
        <PointsCard
          points={dashboard?.points ?? 0}
          storeCredit={dashboard?.storeCredit ?? 0}
          currentTier={dashboard?.currentTier ?? null}
          nextTier={dashboard?.nextTier ?? null}
          lifetimePoints={dashboard?.lifetimePoints ?? 0}
          totalOrders={dashboard?.totalOrders ?? 0}
          onRedeem={handleRedeemPoints}
          isRedeeming={isRedeeming}
        />

        {/* Daily Spin */}
        <DailySpinSection
          canSpin={dailyRewardStatus?.canSpin ?? false}
          onSpin={handleSpin}
        />

        {/* Referral Card */}
        <ReferralCard
          referralCode={dashboard?.referralCode ?? null}
          referralsCompleted={completedReferrals}
          onViewDetails={() => setShowReferralStats(true)}
        />

        {/* Badges Section */}
        <BadgesSection
          badges={dashboard?.badges ?? []}
          unclaimedCount={
            (dashboard?.badges ?? []).filter((b) => b.badge.rewardType && !b.rewardClaimed).length
          }
          onBadgePress={handleBadgePress}
        />

        {/* Challenges Section */}
        <ChallengesSection
          activeChallenges={dashboard?.activeChallenges ?? []}
          userProgress={dashboard?.customerChallenges ?? []}
          onJoinChallenge={handleJoinChallenge}
          onClaimReward={handleClaimChallengeReward}
        />
      </ScrollView>

      {/* Referral Stats Modal */}
      <ReferralStatsModal
        visible={showReferralStats}
        onClose={() => setShowReferralStats(false)}
        referralCode={dashboard?.referralCode ?? ''}
        referrals={MOCK_REFERRALS}
        totalEarned={totalEarned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: tokens.spacing[4],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
