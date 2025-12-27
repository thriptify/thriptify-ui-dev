import { StyleSheet, View, Pressable, Platform, Share, Alert } from 'react-native';
import { useState } from 'react';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import * as Clipboard from 'expo-clipboard';

interface ReferralCardProps {
  referralCode: string | null;
  referralsCompleted: number;
  onViewDetails?: () => void;
}

export function ReferralCard({ referralCode, referralsCompleted, onViewDetails }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!referralCode) return;

    try {
      await Clipboard.setStringAsync(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  const handleShare = async () => {
    if (!referralCode) return;

    const shareUrl = `https://thriptify.app/join?ref=${referralCode}`;
    const message = `Join Thriptify and get $5 off your first order! Use my code ${referralCode} or click: ${shareUrl}`;

    try {
      await Share.share({
        message,
        title: 'Get $5 on Thriptify!',
        url: shareUrl, // iOS only
      });
    } catch (error) {
      // User cancelled or error
    }
  };

  if (!referralCode) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="gift" size="md" color="#FFF" />
          </View>
          <Text style={styles.title}>Refer Friends, Earn $5</Text>
        </View>
        <Text style={styles.description}>
          Complete your profile to get your referral code and start earning!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="gift" size="md" color="#FFF" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Refer Friends, Earn $5</Text>
          <Text style={styles.subtitle}>
            Your friends get $5 off their first order
          </Text>
        </View>
      </View>

      {/* Referral Code */}
      <View style={styles.codeContainer}>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <Text style={styles.code}>{referralCode}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, copied && styles.actionButtonSuccess]}
          onPress={handleCopyCode}
        >
          <Icon
            name={copied ? 'check' : 'copy'}
            size="sm"
            color={copied ? '#FFF' : tokens.colors.semantic.brand.primary.default}
          />
          <Text style={[styles.actionText, copied && styles.actionTextSuccess]}>
            {copied ? 'Copied!' : 'Copy Code'}
          </Text>
        </Pressable>

        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Icon name="share" size="sm" color="#FFF" />
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{referralsCompleted}</Text>
          <Text style={styles.statLabel}>Friends Joined</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${referralsCompleted * 5}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
      </View>

      {/* View Details Link */}
      {onViewDetails && referralsCompleted > 0 && (
        <Pressable style={styles.detailsLink} onPress={onViewDetails}>
          <Text style={styles.detailsText}>View Referral History</Text>
          <Icon name="chevron-right" size="sm" color={tokens.colors.semantic.brand.primary.default} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: 16,
    padding: 16,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: tokens.colors.semantic.text.secondary,
  },
  description: {
    fontSize: 14,
    color: tokens.colors.semantic.text.secondary,
    lineHeight: 20,
  },
  codeContainer: {
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: tokens.colors.semantic.surface.tertiary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
    borderStyle: 'dashed',
  },
  codeLabel: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: 4,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.semantic.text.primary,
    letterSpacing: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: tokens.colors.semantic.brand.primary.default,
    gap: 6,
  },
  actionButtonSuccess: {
    backgroundColor: tokens.colors.semantic.status.success.default,
    borderColor: tokens.colors.semantic.status.success.default,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.semantic.brand.primary.default,
  },
  actionTextSuccess: {
    color: '#FFF',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    gap: 6,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: 10,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: tokens.colors.semantic.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: tokens.colors.semantic.border.subtle,
    marginHorizontal: 12,
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.semantic.border.subtle,
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.semantic.brand.primary.default,
    marginRight: 4,
  },
});
