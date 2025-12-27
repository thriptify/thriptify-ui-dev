import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Icon } from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';

export interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional callback when "See All" is pressed */
  onSeeAll?: () => void;
  /** Optional left icon configuration */
  leftIcon?: {
    name: string;
    color?: string;
  };
  /** Custom "See All" text */
  seeAllText?: string;
}

export function SectionHeader({
  title,
  onSeeAll,
  leftIcon,
  seeAllText = 'See all',
}: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {leftIcon && (
          <Icon
            name={leftIcon.name as any}
            size="md"
            color={leftIcon.color || tokens.colors.semantic.text.primary}
          />
        )}
        <Text variant="h3" style={styles.title}>
          {title}
        </Text>
      </View>
      {onSeeAll && (
        <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>{seeAllText}</Text>
          <Icon
            name="chevron-right"
            size="sm"
            color={tokens.colors.semantic.brand.primary.default}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  title: {
    color: tokens.colors.semantic.text.primary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[1],
  },
  seeAllText: {
    color: tokens.colors.semantic.brand.primary.default,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: String(tokens.typography.fontWeight.medium) as '500',
  },
});

export default SectionHeader;
