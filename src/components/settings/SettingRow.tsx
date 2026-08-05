import React from 'react';
import {Pressable, StyleSheet, Text, View, Switch,} from 'react-native';
import {colors, spacing, typography} from '../../theme';
import type {SettingRowItem} from '../../types/app';
import {ChevronRight} from 'lucide-react-native';

type SettingRowProps = {
  item: SettingRowItem;
  onPress?: (item: SettingRowItem) => void;
  chatMemoryEnabled: boolean;
  onToggleChatMemory: (value: boolean) => void;
};

export function SettingRow({
  item,
  onPress,
  chatMemoryEnabled,
  onToggleChatMemory,
}: SettingRowProps) {
  const isSwitch = item.type === 'switch';

  return (
    <Pressable
      accessibilityRole={
        isSwitch ? 'switch' : 'button'
      }
      accessibilityLabel={item.label}
      accessibilityState={
        isSwitch
          ? {checked: chatMemoryEnabled}
          : undefined
      }
      disabled={isSwitch}
      onPress={() => onPress?.(item)}
      style={({pressed}) => [
        styles.row,
        pressed && !isSwitch && styles.pressed,
      ]}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <item.icon
            size={20}
            strokeWidth={1.8}
            color={colors.primaryText}
          />
        </View>

        <View style={styles.labelArea}>
          <Text style={styles.label}>
            {item.label}
          </Text>

          {item.id === 'memory' ? (
            <Text style={styles.description}>
              Remember important academic context
            </Text>
          ) : null}
        </View>
      </View>

      {isSwitch ? (
        <Switch
          value={chatMemoryEnabled}
          onValueChange={onToggleChatMemory}
          style={styles.switch}
          trackColor={{
            false: colors.divider,
            true: colors.softCyan,
          }}
          thumbColor={
            chatMemoryEnabled
              ? colors.accent
              : colors.white
          }
        />
      ) : (
        <Text style={styles.chevron}>{'>'}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    flexShrink: 0,
    transform: [{scaleX: 0.9}, {scaleY: 0.9}],
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginRight: spacing.sm,
  },

  iconBox: {
    width: 24,
    flexShrink: 0,
    alignItems: 'center',
  },

  labelArea: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    ...typography.body,
    color: colors.primaryText,
  },

  description: {
    ...typography.small,
    marginTop: 2,
    color: colors.secondaryText,
    flexShrink: 1,
  },

  chevron: {
    flexShrink: 0,
    color: colors.divider,
    fontSize: 24,
    lineHeight: 24,
  },

  pressed: {
    opacity: 0.65,
  },
});