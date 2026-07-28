import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, spacing, typography} from '../../theme';

type AuthFooterLinkProps = {
  prompt: string;
  actionLabel: string;
  accessibilityLabel: string;
  onPress: () => void;
};

export function AuthFooterLink({
  prompt,
  actionLabel,
  accessibilityLabel,
  onPress,
}: AuthFooterLinkProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={spacing.xs}
        onPress={onPress}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  prompt: {
    ...typography.small,
    color: colors.secondaryText,
  },
  action: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
  },
});
