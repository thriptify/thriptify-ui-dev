import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useLocation, formatAddressShort } from '@/contexts/location-context';
import { useRouter } from 'expo-router';

interface BrowseModeBannerProps {
  onChangeAddress?: () => void;
}

export function BrowseModeBanner({ onChangeAddress }: BrowseModeBannerProps) {
  const { isBrowseMode, deliveryAddress } = useLocation();
  const router = useRouter();

  if (!isBrowseMode) {
    return null;
  }

  const location = deliveryAddress ? formatAddressShort(deliveryAddress) : 'your location';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Icon name="alert" size="sm" color={tokens.colors.semantic.status.warning.default} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Browse Mode</Text>
          <Text style={styles.subtitle}>
            We don't deliver to {location} yet. You can browse but ordering is disabled.
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.changeButton}
        onPress={onChangeAddress || (() => router.push('/account/addresses'))}
      >
        <Text style={styles.changeButtonText}>Change</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${tokens.colors.semantic.status.warning.default}15`,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: `${tokens.colors.semantic.status.warning.default}30`,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.semantic.status.warning.default,
  },
  subtitle: {
    fontSize: 12,
    color: tokens.colors.semantic.text.secondary,
    marginTop: 2,
  },
  changeButton: {
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    backgroundColor: tokens.colors.semantic.status.warning.default,
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BrowseModeBanner;
