import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, Image } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface BrandCardProps {
  id: string;
  name: string;
  logoUrl: string | null;
  onPress?: () => void;
}

export function BrandCard({
  name,
  logoUrl,
  onPress,
}: BrandCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {logoUrl ? (
        <Image
          source={{ uri: logoUrl }}
          width={80}
          height={80}
          borderRadius={tokens.radius.lg}
          style={styles.logo}
        />
      ) : (
        <Pressable style={styles.placeholder}>
          <Text variant="h3" style={styles.placeholderText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </Pressable>
      )}
      <Text variant="bodySmall" weight="medium" numberOfLines={2} style={styles.name}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    alignItems: 'center',
  },
  logo: {
    marginBottom: tokens.spacing[2],
  },
  placeholder: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.colors.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing[2],
  },
  placeholderText: {
    color: tokens.colors.semantic.text.tertiary,
  },
  name: {
    textAlign: 'center',
    color: tokens.colors.semantic.text.primary,
  },
});
