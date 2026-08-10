import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {X} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {colors, radius, spacing} from '../../theme';
import type {
  TimetableEntry,
  UpdateTimetableEntryInput,
} from '../../services/timetableApi';

type Props = {
  visible: boolean;
  entry: TimetableEntry | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (
    updates: UpdateTimetableEntryInput,
  ) => void;
};

const DAYS = [
  {value: 'MON', label: 'Mon'},
  {value: 'TUE', label: 'Tue'},
  {value: 'WED', label: 'Wed'},
  {value: 'THU', label: 'Thu'},
  {value: 'FRI', label: 'Fri'},
  {value: 'SAT', label: 'Sat'},
  {value: 'SUN', label: 'Sun'},
] as const;

const REMINDER_OPTIONS = [
  {value: 0, label: 'Off'},
  {value: 10, label: '10 min'},
  {value: 30, label: '30 min'},
  {value: 60, label: '1 hour'},
];

export function EditTimetableModal({
  visible,
  entry,
  isSaving,
  onClose,
  onSave,
}: Props) {
  const [courseCode, setCourseCode] =
    useState('');
  const [courseName, setCourseName] =
    useState('');
  const [classType, setClassType] =
    useState('');
  const [classGroup, setClassGroup] =
    useState('');
  const [dayOfWeek, setDayOfWeek] =
    useState<
      TimetableEntry['day_of_week']
    >('MON');
  const [startTime, setStartTime] =
    useState('');
  const [endTime, setEndTime] =
    useState('');
  const [
    reminderMinutes,
    setReminderMinutes,
  ] = useState(30);
  const [isEnabled, setIsEnabled] =
    useState(true);

  useEffect(() => {
    if (!entry) {
      return;
    }

    setCourseCode(entry.course_code);
    setCourseName(entry.course_name);
    setClassType(
      entry.class_type ?? '',
    );
    setClassGroup(
      entry.class_group ?? '',
    );
    setDayOfWeek(
      entry.day_of_week,
    );
    setStartTime(
      entry.start_time.slice(0, 5),
    );
    setEndTime(
      entry.end_time.slice(0, 5),
    );
    setReminderMinutes(
      entry.reminder_minutes,
    );
    setIsEnabled(
      entry.is_enabled,
    );
  }, [entry]);

  if (!entry) {
    return null;
  }

  const handleSave = () => {
    onSave({
      courseCode:
        courseCode.trim(),
      courseName:
        courseName.trim(),
      classType:
        classType.trim() || null,
      classGroup:
        classGroup.trim() || null,
      dayOfWeek,
      startTime:
        startTime.trim(),
      endTime:
        endTime.trim(),
      reminderMinutes,
      isEnabled,
    });
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
        <SafeAreaView
                edges={['top', 'bottom']}
                style={styles.screen}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Edit Class
            </Text>

            <Text
              style={styles.subtitle}>
              {entry.course_code}
            </Text>
          </View>

          <Pressable
            disabled={isSaving}
            onPress={onClose}
            style={styles.closeButton}>
            <X
              size={21}
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
          keyboardShouldPersistTaps="handled">
          <Field
            label="Course Code"
            value={courseCode}
            onChangeText={
              setCourseCode
            }
          />

          <Field
            label="Course Name"
            value={courseName}
            onChangeText={
              setCourseName
            }
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <Field
                label="Class Type"
                value={classType}
                onChangeText={
                  setClassType
                }
                placeholder="L / P / T"
              />
            </View>

            <View style={styles.flex}>
              <Field
                label="Group"
                value={classGroup}
                onChangeText={
                  setClassGroup
                }
                placeholder="1"
              />
            </View>
          </View>

          <Text style={styles.label}>
            Day
          </Text>

          <View style={styles.options}>
            {DAYS.map(day => {
              const selected =
                dayOfWeek ===
                day.value;

              return (
                <Pressable
                  key={day.value}
                  onPress={() =>
                    setDayOfWeek(
                      day.value,
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
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <Field
                label="Start Time"
                value={startTime}
                onChangeText={
                  setStartTime
                }
                placeholder="09:00"
              />
            </View>

            <View style={styles.flex}>
              <Field
                label="End Time"
                value={endTime}
                onChangeText={
                  setEndTime
                }
                placeholder="12:00"
              />
            </View>
          </View>

          <Text style={styles.label}>
            Reminder
          </Text>

          <View style={styles.options}>
            {REMINDER_OPTIONS.map(
              option => {
                const selected =
                  reminderMinutes ===
                  option.value;

                return (
                  <Pressable
                    key={option.value}
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
                      {option.label}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>

          <View
            style={
              styles.enabledRow
            }>
            <View style={styles.flex}>
              <Text
                style={
                  styles.enabledTitle
                }>
                Class Enabled
              </Text>

              <Text
                style={
                  styles.enabledDescription
                }>
                Include this class in
                your active timetable.
              </Text>
            </View>

            <Switch
              value={isEnabled}
              onValueChange={
                setIsEnabled
              }
              disabled={isSaving}
              thumbColor={
                isEnabled
                  ? colors.accent
                  : undefined
              }
            />
          </View>

          <Pressable
            disabled={isSaving}
            onPress={handleSave}
            style={[
              styles.saveButton,
              isSaving &&
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
                Save Changes
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
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
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={
          colors.secondaryText
        }
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  header: {
    minHeight: 70,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    backgroundColor:
      colors.softCyan,
  },

  title: {
    color: colors.primaryText,
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
    justifyContent: 'center',
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },

  field: {
    marginBottom: spacing.lg,
  },

  label: {
    marginBottom: spacing.xs,
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '700',
  },

  input: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor:
      'rgba(189, 200, 206, 0.75)',
    borderRadius: radius.md,
    color: colors.primaryText,
    backgroundColor:
      colors.white,
    fontSize: 13,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  flex: {
    flex: 1,
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },

  option: {
    minHeight: 34,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      '#D3DCDF',
    borderRadius: radius.md,
    backgroundColor:
      colors.white,
  },

  optionSelected: {
    borderColor: colors.accent,
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
    color: colors.primaryText,
    fontWeight: '700',
  },

  enabledRow: {
    minHeight: 68,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      '#E1E7E9',
    borderRadius: radius.md,
    backgroundColor:
      colors.white,
  },

  enabledTitle: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },

  enabledDescription: {
    marginTop: 3,
    color:
      colors.secondaryText,
    fontSize: 10,
  },

  saveButton: {
    minHeight: 44,
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor:
      colors.accent,
  },

  saveButtonText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.5,
  },
});