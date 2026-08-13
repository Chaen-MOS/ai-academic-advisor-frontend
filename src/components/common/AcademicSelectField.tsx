import React, {useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Check,
  ChevronDown,
} from 'lucide-react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

import type {
  SelectorOption,
} from '../../types/app';

type AcademicSelectFieldProps = {
  label: string;
  value: string;
  options: SelectorOption[];
  onChange: (
    value: string,
  ) => void;
};

export function AcademicSelectField({
  label,
  value,
  options,
  onChange,
}: AcademicSelectFieldProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const selectedLabel =
    options.find(
      option =>
        option.value === value,
    )?.label ?? value;

  const handleSelect = (
    nextValue: string,
  ) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        accessibilityState={{
          expanded: isOpen,
        }}
        onPress={() =>
          setIsOpen(true)
        }
        style={({pressed}) => [
          styles.field,
          pressed &&
            styles.fieldPressed,
        ]}>
        <Text
          numberOfLines={1}
          style={styles.value}>
          {selectedLabel}
        </Text>

        <ChevronDown
          size={18}
          strokeWidth={2}
          color={
            colors.secondaryText
          }
        />
      </Pressable>

      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={() =>
          setIsOpen(false)
        }>
        <Pressable
          style={styles.overlay}
          onPress={() =>
            setIsOpen(false)
          }>
          <Pressable
            style={styles.modalCard}
            onPress={() => {}}>
            <Text
              style={
                styles.modalTitle
              }>
              {label}
            </Text>

            <FlatList
              data={options}
              keyExtractor={
                item =>
                  item.value
              }
              renderItem={({
                item,
              }) => {
                const isSelected =
                  item.value ===
                  value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      item.label
                    }
                    onPress={() =>
                      handleSelect(
                        item.value,
                      )
                    }
                    style={({pressed}) => [
                      styles.option,
                      isSelected &&
                        styles.optionSelected,
                      pressed &&
                        styles.optionPressed,
                    ]}>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected &&
                          styles.optionTextSelected,
                      ]}>
                      {item.label}
                    </Text>

                    {isSelected ? (
                      <Check
                        size={17}
                        strokeWidth={2.2}
                        color={
                          colors.accent
                        }
                      />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      gap: spacing.xxs,
    },

    label: {
      ...typography.label,
      color:
        colors.secondaryText,
    },

    field: {
      minHeight: 46,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      gap: spacing.sm,

      paddingHorizontal:
        spacing.md,

      borderWidth: 1,

      borderColor:
        colors.divider,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.white,
    },

    fieldPressed: {
      opacity: 0.72,
    },

    value: {
      ...typography.input,

      flex: 1,

      color:
        colors.primaryText,
    },

    overlay: {
      flex: 1,

      padding:
        spacing.lg,

      justifyContent:
        'center',

      backgroundColor:
        'rgba(29, 38, 38, 0.32)',
    },

    modalCard: {
      maxHeight: 360,

      borderRadius:
        radius.lg,

      backgroundColor:
        colors.white,

      borderWidth: 1,

      borderColor:
        colors.divider,

      padding:
        spacing.md,
    },

    modalTitle: {
      ...typography.body,

      color:
        colors.primaryText,

      fontWeight: '700',

      marginBottom:
        spacing.sm,
    },

    option: {
      minHeight: 46,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        spacing.sm,

      borderRadius:
        radius.md,
    },

    optionSelected: {
      backgroundColor:
        colors.softCyan,
    },

    optionPressed: {
      opacity: 0.72,
    },

    optionText: {
      ...typography.body,

      flex: 1,

      color:
        colors.primaryText,
    },

    optionTextSelected: {
      color:
        colors.primaryText,

      fontWeight: '700',
    },
  });