import { StyleSheet, View, Pressable, Modal, ScrollView, Platform } from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Referral {
  id: string;
  name: string;
  status: 'pending' | 'completed';
  date: string;
  reward: number;
}

interface ReferralStatsModalProps {
  visible: boolean;
  onClose: () => void;
  referralCode: string;
  referrals: Referral[];
  totalEarned: number;
}

export function ReferralStatsModal({
  visible,
  onClose,
  referralCode,
  referrals,
  totalEarned,
}: ReferralStatsModalProps) {
  const insets = useSafeAreaInsets();

  const pendingCount = referrals.filter((r) => r.status === 'pending').length;
  const completedCount = referrals.filter((r) => r.status === 'completed').length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Referral History</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size="md" color={tokens.colors.semantic.text.primary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{completedCount}</Text>
                <Text style={styles.summaryLabel}>Completed</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{pendingCount}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, styles.earnedValue]}>
                  ${totalEarned}
                </Text>
                <Text style={styles.summaryLabel}>Earned</Text>
              </View>
            </View>
          </View>

          {/* Your Code */}
          <View style={styles.codeSection}>
            <Text style={styles.sectionTitle}>Your Referral Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.code}>{referralCode}</Text>
            </View>
          </View>

          {/* How it works */}
          <View style={styles.howItWorks}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Share your code with friends</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>They sign up and get $5 off</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>You get $5 when they order</Text>
            </View>
          </View>

          {/* Referral List */}
          {referrals.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Your Referrals</Text>
              {referrals.map((referral) => (
                <View key={referral.id} style={styles.referralItem}>
                  <View style={styles.referralAvatar}>
                    <Text style={styles.avatarText}>
                      {referral.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralName}>{referral.name}</Text>
                    <Text style={styles.referralDate}>{referral.date}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      referral.status === 'completed'
                        ? styles.completedBadge
                        : styles.pendingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        referral.status === 'completed'
                          ? styles.completedText
                          : styles.pendingText,
                      ]}
                    >
                      {referral.status === 'completed'
                        ? `+$${referral.reward}`
                        : 'Pending'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {referrals.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="users" size="xl" color={tokens.colors.semantic.text.quaternary} />
              <Text style={styles.emptyTitle}>No referrals yet</Text>
              <Text style={styles.emptyText}>
                Share your code with friends to start earning!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.semantic.border.subtle,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
  },
  earnedValue: {
    color: tokens.colors.semantic.status.success.default,
  },
  summaryLabel: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: tokens.colors.semantic.border.subtle,
  },
  codeSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
    borderStyle: 'dashed',
  },
  code: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.semantic.brand.primary.default,
    letterSpacing: 2,
  },
  howItWorks: {
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  stepText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.primary,
  },
  listSection: {
    marginBottom: 16,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.semantic.text.primary,
  },
  referralDate: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadge: {
    backgroundColor: `${tokens.colors.semantic.status.success.default}15`,
  },
  pendingBadge: {
    backgroundColor: tokens.colors.semantic.surface.tertiary,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  completedText: {
    color: tokens.colors.semantic.status.success.default,
  },
  pendingText: {
    color: tokens.colors.semantic.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
