import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, spacing, typography} from '../../theme';
import type {SettingRowItem} from '../../types/app';
import {ChevronRight} from 'lucide-react-native';

type SettingRowProps = {
  item: SettingRowItem;
  onPress?: (item: SettingRowItem) => void;
};

export function SettingRow({item, onPress}: SettingRowProps) {
  const Icon = item.icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={() => onPress?.(item)}
      style={({pressed}) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
            <Icon
              size={20}
              strokeWidth={1.8}
              color={colors.primaryText}
            />
          </View>
        <Text style={styles.label}>{item.label}</Text>
      </View>
      <ChevronRight
          size={18}
          strokeWidth={2}
          color={colors.secondaryText}
      />
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
