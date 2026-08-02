import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {colors, radius, typography} from '../../theme';

type PrimaryButtonProps = {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  variant?: 'cyan' | 'white' | 'accent';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  accessibilityLabel,
  onPress,
  variant = 'cyan',
  style,
  disabled = false,
}: PrimaryButtonProps) {
  const isWhite = variant === 'white';
  const isAccent = variant === 'accent';

  return (
   <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      style={({pressed}) => [
        styles.button,
        style,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text
        style={[
          styles.label,
          isWhite && styles.whiteLabel,
          isAccent && styles.accentLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cyanButton: {
    backgroundColor: colors.softCyan,
  },
  whiteButton: {
    minHeight: 38,
    borderRadius: radius.xs,
    backgroundColor: colors.white,
  },
  accentButton: {
    backgroundColor: colors.accent,
  },
  label: {
    ...typography.button,
    color: colors.primaryText,
  },
  whiteLabel: {
    color: colors.indigo,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  accentLabel: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.5,
  },
});
