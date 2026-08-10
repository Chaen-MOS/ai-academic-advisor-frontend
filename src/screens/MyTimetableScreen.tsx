import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MoreVertical,
  Plus,
} from 'lucide-react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../theme';

import type {
  RootStackParamList,
} from '../types/navigation';

import {
  deleteTimetableEntry,
  getTimetable,
  importTimetable,
  previewTimetable,
  updateTimetableEntry,
  type TimetableEntry,
  type TimetablePreviewEntry,
  type UpdateTimetableEntryInput,
} from '../services/timetableApi';
import {
  EditTimetableModal,
} from '../components/timetable/EditTimetableModal';
import {
  ImportTimetableModal,
} from '../components/timetable/ImportTimetableModal';

import {
  TimetablePreviewModal,
} from '../components/timetable/TimetablePreviewModal';

import {
  cancelReminder,
  rescheduleWeeklyReminder,
  scheduleWeeklyReminder,
  syncTimetableReminders,
} from '../services/notificationService';

type MyTimetableScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    'MyTimetable'
  >;

const DAY_LABELS = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
} satisfies Record<
  TimetableEntry['day_of_week'],
  string
>;

const DAY_ORDER:
TimetableEntry['day_of_week'][] = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
];

export default function MyTimetableScreen({
  navigation,
}: MyTimetableScreenProps) {
  const [entries, setEntries] =
    useState<TimetableEntry[]>([]);
  
  const [
    isImportModalVisible,
    setIsImportModalVisible,
    ] = useState(false);

  const [
    isPreviewModalVisible,
    setIsPreviewModalVisible,
    ] = useState(false);

  const [
    previewEntries,
    setPreviewEntries,
    ] = useState<
    TimetablePreviewEntry[]
    >([]);

  const [
    isPreviewing,
    setIsPreviewing,
    ] = useState(false);

  const [
    isImporting,
    setIsImporting,
    ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    editingEntry,
    setEditingEntry,
    ] = useState<TimetableEntry | null>(
    null,
    );

    const [
    isEditModalVisible,
    setIsEditModalVisible,
    ] = useState(false);

    const [
    isSavingEntry,
    setIsSavingEntry,
    ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadTimetable() {
        try {
          setIsLoading(true);

          const result =
            await getTimetable();
        
          if (isActive) {
            setEntries(result); 
          
          try {
            await syncTimetableReminders(
                result,
            );
            } catch (error) {
            console.error(
                'Failed to sync timetable reminders:',
                error,
            );
          }

          }
        } catch (error) {
          console.error(
            'Failed to load timetable:',
            error,
          );

          if (isActive) {
            Alert.alert(
              'Unable to Load Timetable',
              error instanceof Error
                ? error.message
                : 'Failed to load timetable.',
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadTimetable();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const entriesByDay =
    useMemo(() => {
      return DAY_ORDER.map(day => ({
        day,
        entries: entries.filter(
          entry =>
            entry.day_of_week ===
            day,
        ),
      })).filter(
        group =>
          group.entries.length > 0,
      );
    }, [entries]);

  const handleImportTimetable = () => {
    setIsImportModalVisible(true);
  };

  const handlePreviewTimetable =
    async (rawText: string) => {
        try {
        setIsPreviewing(true);

        const result =
            await previewTimetable(
            rawText,
            );

        setPreviewEntries(result);

        setIsImportModalVisible(
            false,
        );

        setIsPreviewModalVisible(
            true,
        );
        } catch (error) {
        console.error(
            'Timetable preview failed:',
            error,
        );

        Alert.alert(
            'Unable to Read Timetable',
            error instanceof Error
            ? error.message
            : 'Unable to parse timetable.',
        );
        } finally {
        setIsPreviewing(false);
        }
    };

  const handleRemovePreviewEntry = (
    index: number,
    ) => {
    setPreviewEntries(
        current =>
        current.filter(
            (_, currentIndex) =>
            currentIndex !== index,
        ),
    );
  };

  const handleConfirmImport =
    async () => {
        if (
        previewEntries.length === 0
        ) {
        return;
        }

        try {
        setIsImporting(true);

        const importedEntries =
            await importTimetable(
            previewEntries,
            );

        for (
            const entry of
                importedEntries
        ) {
            if (
                !entry.is_enabled ||
                entry.reminder_minutes <= 0
            ) {
                continue;
            }

            await scheduleWeeklyReminder({
                id: entry.id,
                sourceType: 'TIMETABLE',

                title:
                entry.course_code,

                body:
                `${entry.course_name} starts in ${entry.reminder_minutes} minutes.`,

                dayOfWeek:
                entry.day_of_week,

                startTime:
                entry.start_time,

                reminderMinutes:
                entry.reminder_minutes,
            });
        }

        setEntries(
            importedEntries,
        );

        setIsPreviewModalVisible(
            false,
        );

        setIsImportModalVisible(
            false,
        );

        setPreviewEntries([]);

        Alert.alert(
            'Timetable Imported',
            `${importedEntries.length} classes were imported successfully.`,
        );
        } catch (error) {
        console.error(
            'Timetable import failed:',
            error,
        );

        Alert.alert(
            'Import Failed',
            error instanceof Error
            ? error.message
            : 'Unable to import timetable.',
        );
        } finally {
        setIsImporting(false);
        }
    };

  const handleBackToImport = () => {
    if (isImporting) {
        return;
    }

    setIsPreviewModalVisible(
        false,
    );

    setIsImportModalVisible(
        true,
    );
  };

  const handleCloseImport = () => {
    if (
        isPreviewing ||
        isImporting
    ) {
        return;
    }

    setIsImportModalVisible(
        false,
    );

    setIsPreviewModalVisible(
        false,
    );

    setPreviewEntries([]);
  };

  const handleDeleteEntry = (
    entry: TimetableEntry,
    ) => {
    Alert.alert(
        'Delete Class',
        `Delete ${entry.course_code} from your timetable?`,
        [
        {
            text: 'Cancel',
            style: 'cancel',
        },
        {
            text: 'Delete',
            style: 'destructive',

            onPress: async () => {
            try {
                await cancelReminder(
                'TIMETABLE',
                entry.id,
                )

                setEntries(current =>
                current.filter(
                    item =>
                    item.id !==
                    entry.id,
                ),
                );
            } catch (error) {
                console.error(
                'Failed to delete timetable entry:',
                error,
                );

                Alert.alert(
                'Delete Failed',
                error instanceof Error
                    ? error.message
                    : 'Unable to delete class.',
                );
            }
            },
        },
        ],
    );
  };
  
  const handleOpenEntryMenu = (
    entry: TimetableEntry,
    ) => {
    Alert.alert(
        entry.course_code,
        entry.course_name,
        [
        {
            text: 'Edit',
            onPress: () => {
                setEditingEntry(entry);
                setIsEditModalVisible(true);
            },
        },
        {
            text: 'Delete',
            style: 'destructive',
            onPress: () =>
            handleDeleteEntry(entry),
        },
        {
            text: 'Cancel',
            style: 'cancel',
        },
        ],
    );
  };
  const handleCloseEdit = () => {
    if (isSavingEntry) {
        return;
    }

    setIsEditModalVisible(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = async (
    updates: UpdateTimetableEntryInput,
    ) => {
    if (!editingEntry) {
        return;
    }

    try {
        setIsSavingEntry(true);

        const updatedEntry =
        await updateTimetableEntry(
            editingEntry.id,
            updates,
        );

        if (
            updatedEntry.is_enabled &&
            updatedEntry.reminder_minutes > 0
        ) {
            await rescheduleWeeklyReminder({
                id: updatedEntry.id,
                sourceType: 'TIMETABLE',

                title:
                updatedEntry.course_code,

                body:
                `${updatedEntry.course_name} starts in ${updatedEntry.reminder_minutes} minutes.`,

                dayOfWeek:
                updatedEntry.day_of_week,

                startTime:
                updatedEntry.start_time,

                reminderMinutes:
                updatedEntry.reminder_minutes,
             });
            } else {
            await cancelReminder(
                'TIMETABLE',
                updatedEntry.id,
            );
        }

        setEntries(current =>
        current.map(entry =>
            entry.id ===
            updatedEntry.id
            ? updatedEntry
            : entry,
        ),
        );

        setIsEditModalVisible(false);
        setEditingEntry(null);

        Alert.alert(
        'Class Updated',
        `${updatedEntry.course_code} was updated successfully.`,
        );
    } catch (error) {
        console.error(
        'Failed to update timetable entry:',
        error,
        );

        Alert.alert(
        'Update Failed',
        error instanceof Error
            ? error.message
            : 'Unable to update class.',
        );
    } finally {
        setIsSavingEntry(false);
    }
  };


  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}>
          <ArrowLeft
            size={23}
            strokeWidth={2.2}
            color={
              colors.primaryText
            }
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          My Timetable
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }>
        <View style={styles.hero}>
          <View
            style={styles.heroIcon}>
            <CalendarDays
              size={24}
              strokeWidth={2}
              color={colors.accent}
            />
          </View>

          <View style={styles.heroText}>
            <Text style={styles.title}>
              My Timetable
            </Text>

            <Text
              style={styles.subtitle}>
              View your weekly classes
              and manage reminders.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Import timetable"
          accessibilityRole="button"
          onPress={
            handleImportTimetable
          }
          style={styles.importButton}>
          <Plus
            size={18}
            strokeWidth={2.3}
            color={
              colors.primaryText
            }
          />

          <Text
            style={
              styles.importButtonText
            }>
            Import Timetable
          </Text>
        </Pressable>

        {isLoading ? (
          <View
            style={
              styles.loadingArea
            }>
            <ActivityIndicator
              size="large"
              color={colors.accent}
            />

            <Text
              style={
                styles.loadingText
              }>
              Loading timetable...
            </Text>
          </View>
        ) : entriesByDay.length ===
          0 ? (
          <View
            style={
              styles.emptyCard
            }>
            <CalendarDays
              size={32}
              strokeWidth={1.7}
              color={
                colors.secondaryText
              }
            />

            <Text
              style={
                styles.emptyTitle
              }>
              No timetable yet
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Import your timetable
              from UTAR Portal to get
              started.
            </Text>
          </View>
        ) : (
          entriesByDay.map(
            group => (
              <View
                key={group.day}
                style={
                  styles.daySection
                }>
                <Text
                  style={
                    styles.dayTitle
                  }>
                  {
                    DAY_LABELS[
                      group.day
                    ]
                  }
                </Text>

                <View
                  style={
                    styles.dayCard
                  }>
                  {group.entries.map(
                    (
                      entry,
                      index,
                    ) => (
                      <TimetableEntryRow
                        key={entry.id}
                        entry={entry}
                        isLast={
                            index ===
                            group.entries.length - 1
                        }
                        onOpenMenu={
                            handleOpenEntryMenu
                        }
                        />
                    ),
                  )}
                </View>
              </View>
            ),
          )
        )}
        </ScrollView>

      <ImportTimetableModal
        visible={
          isImportModalVisible
        }
        isPreviewing={
          isPreviewing
        }
        onClose={
          handleCloseImport
        }
        onPreview={
          handlePreviewTimetable
        }
      />

      <TimetablePreviewModal
        visible={
          isPreviewModalVisible
        }
        entries={
          previewEntries
        }
        isImporting={
          isImporting
        }
        onBack={
          handleBackToImport
        }
        onClose={
          handleCloseImport
        }
        onRemove={
          handleRemovePreviewEntry
        }
        onConfirm={
          handleConfirmImport
        }
      />

      <EditTimetableModal
        visible={isEditModalVisible}
        entry={editingEntry}
        isSaving={isSavingEntry}
        onClose={handleCloseEdit}
        onSave={handleSaveEntry}
      />
    </SafeAreaView>
  );
}

function TimetableEntryRow({
  entry,
  isLast,
  onOpenMenu,
}: {
  entry: TimetableEntry;
  isLast: boolean;
  onOpenMenu: (
    entry: TimetableEntry,
  ) => void;
}) {
  return (
    <View
      style={[
        styles.entryRow,
        isLast &&
          styles.entryRowLast,
      ]}>
      <View style={styles.timeColumn}>
        <Text style={styles.startTime}>
          {formatTime(
            entry.start_time,
          )}
        </Text>

        <Text style={styles.endTime}>
          {formatTime(
            entry.end_time,
          )}
        </Text>
      </View>

      <View style={styles.timeline}>
        <View style={styles.timelineDot} />
        {!isLast ? (
          <View
            style={styles.timelineLine}
          />
        ) : null}
      </View>

      <View style={styles.entryContent}>
        <Text
          style={
            styles.courseCode
          }>
          {entry.course_code}
        </Text>

        <Text
          numberOfLines={2}
          style={
            styles.courseName
          }>
          {entry.course_name}
        </Text>

        <View style={styles.entryMeta}>
          <Text
            style={
              styles.classType
            }>
            {formatClassType(
              entry.class_type,
            )}

            {entry.class_group
              ? ` · Group ${entry.class_group}`
              : ''}
          </Text>

          <View
            style={
              styles.reminderMeta
            }>
            <Clock3
              size={12}
              strokeWidth={2}
              color={
                colors.secondaryText
              }
            />

            <Text
              style={
                styles.reminderText
              }>
              {
                entry.reminder_minutes
              }
              m before
            </Text>
            <Pressable
                accessibilityLabel={`Options for ${entry.course_code}`}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() =>
                    onOpenMenu(entry)
                }
                style={styles.moreButton}>
                <MoreVertical
                    size={19}
                    strokeWidth={2.2}
                    color={
                    colors.secondaryText
                    }
                />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function formatTime(
  value: string,
) {
  const [
    rawHour,
    rawMinute,
  ] = value.split(':');

  let hour = Number(rawHour);
  const minute = rawMinute ?? '00';

  const period =
    hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${period}`;
}

function formatClassType(
  value: string | null,
) {
  if (value === 'L') {
    return 'Lecture';
  }

  if (value === 'P') {
    return 'Practical';
  }

  if (value === 'T') {
    return 'Tutorial';
  }

  return 'Class';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor:
      colors.softCyan,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },

  headerSpacer: {
    width: 36,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.softCyan,
  },

  heroText: {
    flex: 1,
  },

  title: {
    ...typography.cardHeading,
    color: colors.primaryText,
    fontSize: 20,
    fontWeight: '700',
  },

  subtitle: {
    ...typography.body,
    marginTop: 3,
    color:
      colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },

  importButton: {
    marginTop: spacing.lg,
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor:
      colors.accent,
  },

  importButtonText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: '700',
  },

  loadingArea: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },

  loadingText: {
    color:
      colors.secondaryText,
    fontSize: 12,
  },

  emptyCard: {
    marginTop: spacing.xl,
    minHeight: 220,
    borderWidth: 1,
    borderColor:
      'rgba(189, 200, 206, 0.55)',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor:
      colors.white,
  },
  moreButton: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: spacing.md,
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: '700',
  },

  emptyText: {
    marginTop: spacing.xs,
    color:
      colors.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  daySection: {
    marginTop: spacing.xl,
  },

  dayTitle: {
    marginBottom: spacing.sm,
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },

  dayCard: {
    borderWidth: 1,
    borderColor:
      'rgba(189, 200, 206, 0.55)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor:
      colors.white,
  },

  entryRow: {
    minHeight: 96,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor:
      '#EDF1F2',
  },

  entryRowLast: {
    borderBottomWidth: 0,
  },

  timeColumn: {
    width: 66,
  },

  startTime: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '700',
  },

  endTime: {
    marginTop: 4,
    color:
      colors.secondaryText,
    fontSize: 10,
  },

  timeline: {
    width: 22,
    alignItems: 'center',
  },

  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 3,
    backgroundColor:
      colors.accent,
  },

  timelineLine: {
    flex: 1,
    width: 1,
    marginTop: 4,
    backgroundColor:
      '#D5E8E8',
  },

  entryContent: {
    flex: 1,
    paddingLeft: spacing.xs,
  },

  courseCode: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },

  courseName: {
    marginTop: 3,
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  entryMeta: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },

  classType: {
    color:
      colors.secondaryText,
    fontSize: 11,
  },

  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  reminderText: {
    color:
      colors.secondaryText,
    fontSize: 10,
  },
});