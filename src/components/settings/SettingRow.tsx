import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, spacing, typography} from '../../theme';
import type {SettingRowItem} from '../../types/app';

type SettingRowProps = {
  item: SettingRowItem;
  onPress?: (item: SettingRowItem) => void;
};

export function SettingRow({item, onPress}: SettingRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={() => onPress?.(item)}
      style={({pressed}) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <Text style={styles.label}>{item.label}</Text>
      </View>
      <Text style={styles.chevron}>{'>'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 24,
    alignItems: 'center',
  },
  icon: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
  },
  label: {
    ...typography.body,
    color: colors.primaryText,
  },
  chevron: {
    color: colors.divider,
    fontSize: 24,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.65,
  },
});
