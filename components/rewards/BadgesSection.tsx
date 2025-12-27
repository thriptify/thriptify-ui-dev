import { StyleSheet, View, ScrollView, Pressable, Platform } from 'react-native';
import { Text, Icon, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import type { CustomerBadge } from '@/hooks/use-loyalty';

interface BadgesSectionProps {
  badges: CustomerBadge[];
  unclaimedCount: number;
  onBadgePress?: (badge: CustomerBadge) => void;
  onViewAll?: () => void;
}

export function BadgesSection({ badges, unclaimedCount, onBadgePress, onViewAll }: BadgesSectionProps) {
  if (badges.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Badges</Text>
        </View>
        <View style={styles.emptyState}>
          <Icon name="award" size="lg" color={tokens.colors.semantic.text.quaternary} />
          <Text style={styles.emptyText}>Complete orders to earn badges!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Badges</Text>
          {unclaimedCount > 0 && (
            <View style={styles.unclaimedBadge}>
              <Text style={styles.unclaimedText}>{unclaimedCount} to claim</Text>
            </View>
          )}
        </View>
        {onViewAll && (
          <Pressable onPress={onViewAll}>
            <Text style={styles.viewAll}>See All</Text>
          </Pressable>
        )}
      </View>

      {/* Badges Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesScroll}
      >
        {badges.map((customerBadge) => {
          const { badge, rewardClaimed } = customerBadge;
          const hasReward = badge.rewardType && badge.rewardValue && !rewardClaimed;

          return (
            <Pressable
              key={customerBadge.id}
              style={styles.badgeItem}
              onPress={() => onBadgePress?.(customerBadge)}
            >
              <View style={[styles.badgeIcon, hasReward && styles.badgeIconHighlight]}>
                {badge.imageUrl ? (
                  <Image
                    source={{ uri: badge.imageUrl }}
                    width={40}
                    height={40}
                    borderRadius={8}
                  />
                ) : (
                  <Icon name="award" size="lg" color={tokens.colors.semantic.brand.primary.default} />
                )}
                {hasReward && (
                  <View style={styles.claimDot} />
                )}
              </View>
              <Text style={styles.badgeName} numberOfLines={2}>
                {badge.name}
              </Text>
              {hasReward && (
                <Text style={styles.rewardText}>
                  +{badge.rewardValue} {badge.rewardType === 'points' ? 'pts' : '$'}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  unclaimedBadge: {
    backgroundColor: tokens.colors.semantic.status.error.default,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unclaimedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.brand.primary.default,
  },
  badgesScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  badgeItem: {
    width: 80,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: tokens.colors.semantic.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  badgeIconHighlight: {
    borderWidth: 2,
    borderColor: tokens.colors.semantic.status.success.default,
  },
  claimDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: tokens.colors.semantic.status.error.default,
    borderWidth: 2,
    borderColor: tokens.colors.semantic.surface.secondary,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.semantic.status.success.default,
    marginTop: 2,
  },
  emptyState: {
    marginHorizontal: 16,
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
});
