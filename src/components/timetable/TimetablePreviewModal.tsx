import React from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ArrowLeft,
  Clock3,
  Trash2,
  X,
} from 'lucide-react-native';

import {
  colors,
  radius,
  spacing,
} from '../../theme';

import type {
  TimetablePreviewEntry,
} from '../../services/timetableApi';

type Props = {
  visible: boolean;

  entries: TimetablePreviewEntry[];

  isImporting: boolean;

  onBack: () => void;

  onClose: () => void;

  onRemove: (
    index: number,
  ) => void;

  onConfirm: () => void;
};

const DAY_LABELS: Record<
  TimetablePreviewEntry['dayOfWeek'],
  string
> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

const DAY_ORDER:
TimetablePreviewEntry['dayOfWeek'][] = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
];

export function TimetablePreviewModal({
  visible,
  entries,
  isImporting,
  onBack,
  onClose,
  onRemove,
  onConfirm,
}: Props) {
  const sortedEntries = entries
    .map((entry, index) => ({
      entry,
      originalIndex: index,
    }))
    .sort((a, b) => {
      const dayDifference =
        DAY_ORDER.indexOf(
          a.entry.dayOfWeek,
        ) -
        DAY_ORDER.indexOf(
          b.entry.dayOfWeek,
        );

      if (dayDifference !== 0) {
        return dayDifference;
      }

      return a.entry.startTime.localeCompare(
        b.entry.startTime,
      );
    });

  const canConfirm =
    entries.length > 0 &&
    !isImporting;

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Back to timetable import"
            disabled={isImporting}
            hitSlop={8}
            onPress={onBack}
            style={styles.iconButton}>
            <ArrowLeft
              size={22}
              color={
                colors.primaryText
              }
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }>
            <Text
              style={
                styles.headerTitle
              }>
              Review Timetable
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }>
              {entries.length}{' '}
              {entries.length === 1
                ? 'class'
                : 'classes'}{' '}
              detected
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Close"
            disabled={isImporting}
            hitSlop={8}
            onPress={onClose}
            style={styles.iconButton}>
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
          showsVerticalScrollIndicator={
            false
          }>
          <View
            style={
              styles.noticeCard
            }>
            <Text
              style={
                styles.noticeTitle
              }>
              Check before importing
            </Text>

            <Text
              style={
                styles.noticeText
              }>
              Make sure the course,
              day and time are correct.
              Remove any incorrectly
              detected classes before
              continuing.
            </Text>
          </View>

          {sortedEntries.length >
          0 ? (
            sortedEntries.map(
              ({
                entry,
                originalIndex,
              }) => (
                <PreviewEntryCard
                  key={`${entry.courseCode}-${entry.dayOfWeek}-${entry.startTime}-${originalIndex}`}
                  entry={entry}
                  disabled={
                    isImporting
                  }
                  onRemove={() =>
                    onRemove(
                      originalIndex,
                    )
                  }
                />
              ),
            )
          ) : (
            <View
              style={
                styles.emptyState
              }>
              <Text
                style={
                  styles.emptyTitle
                }>
                No classes remaining
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                Go back and paste your
                timetable again.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            disabled={isImporting}
            onPress={onBack}
            style={
              styles.backButton
            }>
            <Text
              style={
                styles.backButtonText
              }>
              Back
            </Text>
          </Pressable>

          <Pressable
            disabled={!canConfirm}
            onPress={onConfirm}
            style={[
              styles.confirmButton,
              !canConfirm &&
                styles.disabled,
            ]}>
            {isImporting ? (
              <ActivityIndicator
                size="small"
                color={
                  colors.primaryText
                }
              />
            ) : (
              <Text
                style={
                  styles.confirmButtonText
                }>
                Confirm Import
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function PreviewEntryCard({
  entry,
  disabled,
  onRemove,
}: {
  entry: TimetablePreviewEntry;
  disabled: boolean;
  onRemove: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View
          style={
            styles.courseContent
          }>
          <Text
            style={
              styles.courseCode
            }>
            {entry.courseCode}
          </Text>

          <Text
            style={
              styles.courseName
            }>
            {entry.courseName}
          </Text>
        </View>

        <Pressable
          accessibilityLabel={`Remove ${entry.courseCode}`}
          disabled={disabled}
          hitSlop={8}
          onPress={onRemove}
          style={
            styles.deleteButton
          }>
          <Trash2
            size={17}
            strokeWidth={1.9}
            color={
              colors.destructive
            }
          />
        </Pressable>
      </View>

      <View style={styles.meta}>
        <Text
          style={styles.dayText}>
          {
            DAY_LABELS[
              entry.dayOfWeek
            ]
          }
        </Text>

        <View
          style={
            styles.timeBlock
          }>
          <Clock3
            size={13}
            color={
              colors.secondaryText
            }
          />

          <Text
            style={
              styles.metaText
            }>
            {formatTime(
              entry.startTime,
            )}
            {' – '}
            {formatTime(
              entry.endTime,
            )}
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.classInfo
        }>
        {formatClassType(
          entry.classType,
        )}

        {entry.classGroup
          ? ` · Group ${entry.classGroup}`
          : ''}
      </Text>
    </View>
  );
}

function formatTime(
  value: string,
) {
  const [rawHour, minute] =
    value.split(':');

  let hour =
    Number(rawHour);

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
  screen: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  header: {
    minHeight: 72,
    paddingHorizontal:
      spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      colors.softCyan,
  },

  headerText: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: '700',
  },

  headerSubtitle: {
    marginTop: 2,
    color:
      colors.secondaryText,
    fontSize: 11,
  },

  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },

  noticeCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    backgroundColor:
      colors.softCyan,
  },

  noticeTitle: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: '700',
  },

  noticeText: {
    marginTop: 4,
    color:
      colors.secondaryText,
    fontSize: 11,
    lineHeight: 17,
  },

  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor:
      'rgba(189, 200, 206, 0.55)',
    borderRadius: radius.md,
    backgroundColor:
      colors.white,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  courseContent: {
    flex: 1,
    paddingRight: spacing.sm,
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

  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  meta: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  dayText: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: '700',
  },

  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  metaText: {
    color:
      colors.secondaryText,
    fontSize: 11,
  },

  classInfo: {
    marginTop: spacing.xs,
    color:
      colors.secondaryText,
    fontSize: 11,
  },

  emptyState: {
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },

  emptyText: {
    marginTop: spacing.xs,
    color:
      colors.secondaryText,
    fontSize: 12,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor:
      '#E7ECEE',
    backgroundColor:
      colors.white,
  },

  backButton: {
    minHeight: 44,
    paddingHorizontal:
      spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      '#D3DCDF',
    borderRadius: radius.md,
  },

  backButtonText: {
    color:
      colors.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },

  confirmButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor:
      colors.accent,
  },

  confirmButtonText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.45,
  },
});