import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ArrowUpRight} from 'lucide-react-native';
import {colors, radius, spacing, typography} from '../../theme';

type QuickQuestionButtonProps = {
  label: string;
  onPress: () => void;
};

export function QuickQuestionButton({label, onPress}: QuickQuestionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({pressed}) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.iconCircle}>
        <View>
          <ArrowUpRight
            size={18}
            strokeWidth={1.8}
            color={colors.primaryText}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    flex: 1,
    flexBasis: '47%',
    borderRadius: radius.xl,
    backgroundColor: colors.softCyan,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  label: {
    ...typography.small,
    flex: 1,
    color: colors.primaryText,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.primaryText,
    fontSize: 14,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.72,
  },
});
