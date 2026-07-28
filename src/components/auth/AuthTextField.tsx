import React from 'react';
import {StyleSheet, Text, TextInput, View, type TextInputProps} from 'react-native';

import {colors, spacing, typography} from '../../theme';

type AuthTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  variant?: 'light' | 'indigo';
};

export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  variant = 'light',
}: AuthTextFieldProps) {
  const isIndigo = variant === 'indigo';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isIndigo && styles.indigoLabel]}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isIndigo ? '#AEB5D9' : colors.mutedText}
        secureTextEntry={secureTextEntry}
        selectionColor={isIndigo ? colors.white : colors.accent}
        style={[styles.input, isIndigo && styles.indigoInput]}
        value={value}
      />
      <View style={[styles.line, isIndigo && styles.indigoLine]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
  },
  label: {
    ...typography.label,
    color: colors.secondaryText,
  },
  indigoLabel: {
    color: '#E8ECFF',
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    ...typography.input,
    minHeight: 26,
    padding: 0,
    color: colors.primaryText,
  },
  indigoInput: {
    color: '#AEB5D9',
    fontSize: 15,
  },
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inputLine,
  },
  indigoLine: {
    backgroundColor: colors.indigoLine,
  },
});
