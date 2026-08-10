import React, {
  useEffect,
  useState,
} from 'react';

import {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

import {
  CalendarDays,
  Clock3,
  X,
} from 'lucide-react-native';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  colors,
  radius,
  spacing,
} from '../../theme';

import type {
  UserEvent,
} from '../../services/eventApi';

export type EventFormValues = {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  reminderMinutes: number;
};

type Props = {
  visible: boolean;
  event?: UserEvent | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (
    values: EventFormValues,
  ) => void;
};

const REMINDER_OPTIONS = [
  {
    value: 0,
    label: 'Off',
  },
  {
    value: 10,
    label: '10 min',
  },
  {
    value: 30,
    label: '30 min',
  },
  {
    value: 60,
    label: '1 hour',
  },
  {
    value: 1440,
    label: '1 day',
  },
];

export function EventModal({
  visible,
  event = null,
  isSaving,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] =
    useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    eventDate,
    setEventDate,
  ] = useState('');

  const [
    eventTime,
    setEventTime,
  ] = useState('');

  const [
    reminderMinutes,
    setReminderMinutes,
  ] = useState(30);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (event) {
      setTitle(event.title);

      setDescription(
        event.description ?? '',
      );

      setEventDate(
        event.event_date,
      );

      setEventTime(
        event.event_time.slice(
          0,
          5,
        ),
      );

      setReminderMinutes(
        event.reminder_minutes,
      );

      return;
    }

    setTitle('');
    setDescription('');
    setEventDate('');
    setEventTime('');
    setReminderMinutes(30);
  }, [event, visible]);

  const handleSave = () => {
    if (
      !title.trim() ||
      !eventDate.trim() ||
      !eventTime.trim()
    ) {
      return;
    }

    onSave({
      title: title.trim(),

      description:
        description.trim(),

      eventDate:
        eventDate.trim(),

      eventTime:
        eventTime.trim(),

      reminderMinutes,
    });
  };

  const isEditing =
    Boolean(event);

  const canSave =
    title.trim().length > 0 &&
    eventDate.trim().length > 0 &&
    eventTime.trim().length > 0 &&
    !isSaving;

  const openDatePicker = () => {
    const initialDate =
      eventDate
        ? new Date(
            `${eventDate}T12:00:00`,
          )
        : new Date();

    DateTimePickerAndroid.open({
      value: initialDate,
      mode: 'date',
      minimumDate: new Date(),

      onValueChange: (
        _event,
        selectedDate,
      ) => {
        if (!selectedDate) {
          return;
        }

        setEventDate(
          formatDateForApi(
            selectedDate,
          ),
        );
      },
    });
  };

  const openTimePicker = () => {
    const initialTime =
      buildTimePickerDate(
        eventTime,
      );

    DateTimePickerAndroid.open({
      value: initialTime,
      mode: 'time',
      is24Hour: false,

      onValueChange: (
        _event,
        selectedDate,
      ) => {
        if (!selectedDate) {
          return;
        }

        setEventTime(
          formatTimeForApi(
            selectedDate,
          ),
        );
      },
    });
  };

  function formatDateForApi(
    date: Date,
  ) {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        date.getDate(),
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function formatTimeForApi(
    date: Date,
  ) {
    const hour =
      String(
        date.getHours(),
      ).padStart(2, '0');

    const minute =
      String(
        date.getMinutes(),
      ).padStart(2, '0');

    return `${hour}:${minute}`;
  }

  function buildTimePickerDate(
    value: string,
  ) {
    const date =
      new Date();

    if (!value) {
      return date;
    }

    const [hour, minute] =
      value.split(':');

    date.setHours(
      Number(hour),
      Number(minute),
      0,
      0,
    );

    return date;
  }

  

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <SafeAreaView
        edges={[
          'top',
          'bottom',
        ]}
        style={styles.screen}>
        <View
          style={styles.header}>
          <View style={styles.flex}>
            <Text
              style={styles.title}>
              {isEditing
                ? 'Edit Event'
                : 'Create Event'}
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Personal academic
              reminder
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            disabled={isSaving}
            hitSlop={8}
            onPress={onClose}
            style={
              styles.closeButton
            }>
            <X
              size={21}
              strokeWidth={2}
              color={
                colors.secondaryText
              }
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }>
          <Field
            label="Event Title"
            value={title}
            onChangeText={
              setTitle
            }
            placeholder="e.g. Applied ML Assignment"
          />

          <View
            style={
              styles.field
            }>
            <Text
              style={
                styles.label
              }>
              Description
            </Text>

            <TextInput
              multiline
              value={description}
              onChangeText={
                setDescription
              }
              placeholder="Add notes or details..."
              placeholderTextColor={
                colors.secondaryText
              }
              style={[
                styles.input,
                styles.descriptionInput,
              ]}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>
                Date
              </Text>

              <Pressable
                onPress={openDatePicker}
                style={styles.pickerField}>
                <CalendarDays
                  size={17}
                  color={
                    colors.secondaryText
                  }
                />

                <Text
                  style={[
                    styles.pickerText,
                    !eventDate &&
                      styles.placeholderText,
                  ]}>
                  {eventDate
                    ? formatDisplayDate(
                        eventDate,
                      )
                    : 'Select date'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.flex}>
              <Text style={styles.label}>
                Time
              </Text>

              <Pressable
                onPress={openTimePicker}
                style={styles.pickerField}>
                <Clock3
                  size={17}
                  color={
                    colors.secondaryText
                  }
                />

                <Text
                  style={[
                    styles.pickerText,
                    !eventTime &&
                      styles.placeholderText,
                  ]}>
                  {eventTime
                    ? formatDisplayTime(
                        eventTime,
                      )
                    : 'Select time'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={
              styles.reminderSection
            }>
            <Text
              style={
                styles.label
              }>
              Reminder
            </Text>

            <Text
              style={
                styles.helperText
              }>
              Notify me before
              this event
            </Text>

            <View
              style={
                styles.options
              }>
              {REMINDER_OPTIONS.map(
                option => {
                  const selected =
                    reminderMinutes ===
                    option.value;

                  return (
                    <Pressable
                      key={
                        option.value
                      }
                      onPress={() =>
                        setReminderMinutes(
                          option.value,
                        )
                      }
                      style={[
                        styles.option,
                        selected &&
                          styles.optionSelected,
                      ]}>
                      <Text
                        style={[
                          styles.optionText,
                          selected &&
                            styles.optionTextSelected,
                        ]}>
                        {
                          option.label
                        }
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={handleSave}
            style={[
              styles.saveButton,
              !canSave &&
                styles.disabled,
            ]}>
            {isSaving ? (
              <ActivityIndicator
                size="small"
                color={
                  colors.primaryText
                }
              />
            ) : (
              <Text
                style={
                  styles.saveButtonText
                }>
                {isEditing
                  ? 'Save Changes'
                  : 'Create Event'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (
    value: string,
  ) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor={
          colors.secondaryText
        }
        style={styles.input}
      />
    </View>
  );
}
function formatDisplayDate(
  value: string,
) {
  const date =
    new Date(
      `${value}T12:00:00`,
    );

  return date.toLocaleDateString(
    'en-MY',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

function formatDisplayTime(
  value: string,
) {
  const [hourText, minute] =
    value.split(':');

  let hour =
    Number(hourText);

  const period =
    hour >= 12
      ? 'PM'
      : 'AM';

  hour %= 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${period}`;
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    header: {
      minHeight: 64,
      paddingHorizontal:
        spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      backgroundColor:
        colors.softCyan,
    },

    flex: {
      flex: 1,
    },

    title: {
      color:
        colors.primaryText,
      fontSize: 18,
      fontWeight: '700',
    },

    subtitle: {
      marginTop: 2,
      color:
        colors.secondaryText,
      fontSize: 11,
    },

    closeButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    content: {
      padding: spacing.lg,
      paddingBottom: 40,
    },

    field: {
      marginBottom:
        spacing.lg,
    },

    label: {
      marginBottom:
        spacing.xs,
      color:
        colors.primaryText,
      fontSize: 11,
      fontWeight: '700',
    },

    helperText: {
      marginTop: -4,
      marginBottom:
        spacing.sm,
      color:
        colors.secondaryText,
      fontSize: 10,
    },

    input: {
      minHeight: 42,
      paddingHorizontal:
        spacing.md,
      borderWidth: 1,
      borderColor:
        'rgba(189, 200, 206, 0.75)',
      borderRadius:
        radius.md,
      backgroundColor:
        colors.white,
      color:
        colors.primaryText,
      fontSize: 13,
    },

    descriptionInput: {
      minHeight: 100,
      paddingTop:
        spacing.md,
      paddingBottom:
        spacing.md,
    },

    row: {
      flexDirection: 'row',
      gap: spacing.md,
    },

    reminderSection: {
      marginTop:
        spacing.xs,
    },

    options: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },

    option: {
      minHeight: 34,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1,
      borderColor:
        '#D3DCDF',
      borderRadius:
        radius.md,
      backgroundColor:
        colors.white,
    },

    optionSelected: {
      borderColor:
        colors.accent,
      backgroundColor:
        colors.softCyan,
    },

    optionText: {
      color:
        colors.secondaryText,
      fontSize: 11,
      fontWeight: '600',
    },

    optionTextSelected: {
      color:
        colors.primaryText,
      fontWeight: '700',
    },

    saveButton: {
      minHeight: 44,
      marginTop:
        spacing.xl,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius:
        radius.md,
      backgroundColor:
        colors.accent,
    },

    saveButtonText: {
      color:
        colors.primaryText,
      fontSize: 12,
      fontWeight: '700',
    },

    disabled: {
      opacity: 0.45,
    },
    pickerField: {
      minHeight: 44,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor:
        'rgba(189, 200, 206, 0.75)',
      borderRadius: radius.md,
      backgroundColor:
        colors.white,
    },

    pickerText: {
      flex: 1,
      color: colors.primaryText,
      fontSize: 12,
    },

    placeholderText: {
      color:
        colors.secondaryText,
    },
  });