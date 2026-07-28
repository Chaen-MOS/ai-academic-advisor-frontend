import React, {useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {colors, radius, spacing, typography} from '../../theme';
import type {SelectorOption} from '../../types/app';

type AcademicSelectFieldProps = {
  label: string;
  value: string;
  options: SelectorOption[];
  onChange: (value: string) => void;
};

export function AcademicSelectField({
  label,
  value,
  options,
  onChange,
}: AcademicSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel =
    options.find(option => option.value === value)?.label ?? value;

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        onPress={() => setIsOpen(true)}
        style={styles.field}>
        <Text style={styles.value}>{selectedLabel}</Text>
        <Text style={styles.chevron}>v</Text>
      </Pressable>

      <Modal transparent visible={isOpen} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({item}) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => handleSelect(item.value)}
                  style={styles.option}>
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
  field: {
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inputLine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    ...typography.input,
    color: colors.primaryText,
  },
  chevron: {
    color: colors.secondaryText,
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    backgroundColor: 'rgba(29, 38, 38, 0.32)',
  },
  modalCard: {
    maxHeight: 320,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.md,
  },
  modalTitle: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  option: {
    paddingVertical: spacing.sm,
  },
  optionText: {
    ...typography.body,
    color: colors.primaryText,
  },
});
