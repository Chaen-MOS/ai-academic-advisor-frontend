import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {SettingRow} from './SettingRow';
import {colors, radius, spacing, typography} from '../../theme';
import type {SettingRowItem} from '../../types/app';

type SettingSectionProps = {
  title: string;
  rows: SettingRowItem[];
  onRowPress?: (item: SettingRowItem) => void;
  chatMemoryEnabled: boolean;
  onToggleChatMemory: (value: boolean) => void;
};

export function SettingSection({
  title,
  rows,
  onRowPress,
  chatMemoryEnabled,
  onToggleChatMemory,
}: SettingSectionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {rows.map((row, index) => (
        <View key={row.id}>
          <SettingRow
            item={row}
            onPress={onRowPress}
            chatMemoryEnabled={chatMemoryEnabled}
            onToggleChatMemory={onToggleChatMemory}
          />

          {index < rows.length - 1 ? (
            <View style={styles.divider} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.small,
    marginBottom: spacing.xs,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
});
