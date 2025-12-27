import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import type { Challenge, CustomerChallenge } from '@/hooks/use-loyalty';

interface ChallengesSectionProps {
  activeChallenges: Challenge[];
  userProgress: CustomerChallenge[];
  onJoinChallenge?: (challengeId: string) => void;
  onClaimReward?: (challengeId: string) => void;
}

export function ChallengesSection({
  activeChallenges,
  userProgress,
  onJoinChallenge,
  onClaimReward,
}: ChallengesSectionProps) {
  // Map user progress by challenge ID
  const progressMap = new Map(userProgress.map((p) => [p.challengeId, p]));

  // Get active challenges with progress
  const challengesWithProgress = activeChallenges.map((challenge) => ({
    challenge,
    progress: progressMap.get(challenge.id),
  }));

  if (challengesWithProgress.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Challenges</Text>
        <View style={styles.emptyState}>
          <Icon name="target" size="lg" color={tokens.colors.semantic.text.quaternary} />
          <Text style={styles.emptyText}>No active challenges right now</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenges</Text>

      {challengesWithProgress.map(({ challenge, progress }) => {
        const isJoined = !!progress;
        const isCompleted = progress?.isCompleted;
        const canClaim = isCompleted && !progress?.rewardClaimed;
        const progressPercent = progress
          ? Math.min(100, (progress.currentProgress / challenge.targetValue) * 100)
          : 0;

        // Calculate days remaining
        const endsAt = new Date(challenge.endsAt);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        return (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIcon}>
                <Icon name="target" size="md" color="#FFF" />
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <Text style={styles.challengeDesc} numberOfLines={2}>
                  {challenge.description}
                </Text>
              </View>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardAmount}>+{challenge.rewardValue}</Text>
                <Text style={styles.rewardType}>
                  {challenge.rewardType === 'points' ? 'pts' : '$'}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            {isJoined && (
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercent}%` },
                      isCompleted && styles.progressComplete,
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress.currentProgress} / {challenge.targetValue}
                </Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.challengeFooter}>
              <Text style={styles.timeRemaining}>
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ends today'}
              </Text>

              {!isJoined && onJoinChallenge && (
                <Pressable
                  style={styles.joinButton}
                  onPress={() => onJoinChallenge(challenge.id)}
                >
                  <Text style={styles.joinText}>Join Challenge</Text>
                </Pressable>
              )}

              {canClaim && onClaimReward && (
                <Pressable
                  style={styles.claimButton}
                  onPress={() => onClaimReward(challenge.id)}
                >
                  <Icon name="gift" size="sm" color="#FFF" />
                  <Text style={styles.claimText}>Claim Reward</Text>
                </Pressable>
              )}

              {isJoined && !canClaim && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 12,
  },
  emptyState: {
    padding: 24,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    alignItems: 'center',
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
  emptyText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 8,
  },
  challengeCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 18,
  },
  rewardBadge: {
    backgroundColor: tokens.colors.semantic.status.success.default + '15',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    marginLeft: 8,
  },
  rewardAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.semantic.status.success.default,
  },
  rewardType: {
    fontSize: 10,
    color: tokens.colors.semantic.status.success.default,
  },
  progressSection: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: tokens.colors.semantic.status.success.default,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    color: tokens.colors.semantic.text.secondary,
  },
  challengeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  timeRemaining: {
    flex: 1,
    fontSize: 12,
    color: tokens.colors.semantic.text.tertiary,
  },
  joinButton: {
    backgroundColor: tokens.colors.semantic.brand.primary.default + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.semantic.brand.primary.default,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: tokens.colors.semantic.status.success.default,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  statusBadge: {
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.semantic.text.secondary,
  },
});
