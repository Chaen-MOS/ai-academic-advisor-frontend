import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
  ScreenHeader,
} from '../components/common/ScreenHeader';

import {
  NotificationCard,
} from '../components/notifications/NotificationCard';

import {
  notificationCategories,
} from '../data/mockData';

import {
  getTimetable,
  type TimetableEntry,
} from '../services/timetableApi';

import {
  getUserEvents,
  type UserEvent,
} from '../services/eventApi';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../theme';

import type {
  NotificationCategory,
  NotificationRecord,
} from '../types/app';

import type {
  RootStackParamList,
} from '../types/navigation';

type NotificationsScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    'Notifications'
  >;

type UpcomingNotification =
  NotificationRecord & {
    scheduledAt: Date;
  };

export default function NotificationsScreen({
  navigation,
}: NotificationsScreenProps) {
  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<NotificationCategory>(
      'All',
    );

  const [
    timetableEntries,
    setTimetableEntries,
  ] = useState<
    TimetableEntry[]
  >([]);

  const [
    events,
    setEvents,
  ] = useState<
    UserEvent[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadUpcoming() {
        try {
          setIsLoading(true);

          const [
            timetableResult,
            eventsResult,
          ] = await Promise.all([
            getTimetable(),
            getUserEvents(),
          ]);

          if (!isActive) {
            return;
          }

          setTimetableEntries(
            timetableResult,
          );

          setEvents(
            eventsResult,
          );
        } catch (error) {
          console.error(
            'Failed to load upcoming notifications:',
            error,
          );
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadUpcoming();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const upcomingNotifications =
    useMemo(() => {
      const now =
        new Date();

      const classNotifications =
        timetableEntries
          .map(entry =>
            buildClassNotification(
              entry,
            ),
          )
          .filter(
            (
              item,
            ): item is UpcomingNotification =>
              item !== null &&
              item.scheduledAt.getTime() >
                now.getTime(),
          );

      const eventNotifications =
        events
          .map(event =>
            buildEventNotification(
              event,
            ),
          )
          .filter(
            (
              item,
            ): item is UpcomingNotification =>
              item !== null &&
              item.scheduledAt.getTime() >
                now.getTime(),
          );

      return [
        ...classNotifications,
        ...eventNotifications,
      ].sort(
        (a, b) =>
          a.scheduledAt.getTime() -
          b.scheduledAt.getTime(),
      );
    }, [
      timetableEntries,
      events,
    ]);

  const filteredNotifications =
    useMemo(
      () =>
        selectedCategory === 'All'
          ? upcomingNotifications
          : upcomingNotifications.filter(
              item =>
                item.category ===
                selectedCategory,
            ),
      [
        selectedCategory,
        upcomingNotifications,
      ],
    );

  const renderNotification = ({
    item,
  }: {
    item: UpcomingNotification;
  }) => (
    <View>
      <Text
        style={
          styles.dateLabel
        }>
        {item.dateLabel}
      </Text>

      <NotificationCard
        notification={item}
      />
    </View>
  );

  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.screen}>
      <ScreenHeader
        title="Upcoming"
        onBackPress={() =>
          navigation.goBack()
        }
      />

      <View
        style={styles.filters}>
        {notificationCategories.map(
          category => {
            const isSelected =
              selectedCategory ===
              category;

            return (
              <Pressable
                key={category}
                accessibilityRole="button"
                accessibilityLabel={`Show ${category} reminders`}
                onPress={() =>
                  setSelectedCategory(
                    category,
                  )
                }
                style={[
                  styles.chip,
                  isSelected &&
                    styles.chipSelected,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    isSelected &&
                      styles.chipTextSelected,
                  ]}>
                  {category}
                </Text>
              </Pressable>
            );
          },
        )}
      </View>

      {isLoading ? (
        <View
          style={
            styles.loadingArea
          }>
          <ActivityIndicator
            size="large"
            color={
              colors.accent
            }
          />

          <Text
            style={
              styles.loadingText
            }>
            Loading upcoming reminders...
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.list,
            filteredNotifications.length ===
              0 &&
              styles.emptyList,
          ]}
          data={
            filteredNotifications
          }
          keyExtractor={
            item => item.id
          }
          renderItem={
            renderNotification
          }
          ListEmptyComponent={
            <View
              style={
                styles.emptyState
              }>
              <Text
                style={
                  styles.emptyTitle
                }>
                No upcoming reminders
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                Your class and event
                reminders will appear
                here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function buildClassNotification(
  entry: TimetableEntry,
): UpcomingNotification | null {
  if (
    !entry.is_enabled ||
    entry.reminder_minutes <= 0
  ) {
    return null;
  }

  const classStart =
    getNextWeeklyClassDate(
      entry.day_of_week,
      entry.start_time,
    );

  const reminderDate =
    new Date(
      classStart.getTime() -
        entry.reminder_minutes *
          60_000,
    );

  if (
    reminderDate.getTime() <=
    Date.now()
  ) {
    return null;
  }

  return {
    id:
      `timetable-${entry.id}`,

    title:
      `${entry.course_code} class reminder`,

    description:
      `${entry.course_name} starts at ${formatTime(
        entry.start_time,
      )}.`,

    category:
      'Classes',

    dateLabel:
      formatDateLabel(
        reminderDate,
      ),

    timeLabel:
      formatTimeFromDate(
        reminderDate,
      ),

    scheduledAt:
      reminderDate,
  };
}

function buildEventNotification(
  event: UserEvent,
): UpcomingNotification | null {
  if (
    event.is_completed ||
    event.reminder_minutes <= 0
  ) {
    return null;
  }

  const eventDate =
    new Date(
      `${event.event_date}T${event.event_time.slice(
        0,
        5,
      )}:00`,
    );

  const reminderDate =
    new Date(
      eventDate.getTime() -
        event.reminder_minutes *
          60_000,
    );

  if (
    reminderDate.getTime() <=
    Date.now()
  ) {
    return null;
  }

  return {
    id:
      `event-${event.id}`,

    title:
      event.title,

    description:
      event.description ??
      `Event at ${formatTimeFromDate(
        eventDate,
      )}.`,

    category:
      'Events',

    dateLabel:
      formatDateLabel(
        reminderDate,
      ),

    timeLabel:
      formatTimeFromDate(
        reminderDate,
      ),

    scheduledAt:
      reminderDate,
  };
}

function getNextWeeklyClassDate(
  dayOfWeek:
    TimetableEntry['day_of_week'],
  startTime: string,
) {
  const DAY_INDEX = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
  } as const;

  const now =
    new Date();

  const target =
    new Date();

  const [
    hourText,
    minuteText,
  ] = startTime.split(':');

  const targetDay =
    DAY_INDEX[dayOfWeek];

  let daysAhead =
    targetDay -
    now.getDay();

  if (daysAhead < 0) {
    daysAhead += 7;
  }

  target.setDate(
    now.getDate() +
      daysAhead,
  );

  target.setHours(
    Number(hourText),
    Number(minuteText),
    0,
    0,
  );

  if (
    target.getTime() <=
    now.getTime()
  ) {
    target.setDate(
      target.getDate() +
        7,
    );
  }

  return target;
}

function formatDateLabel(
  date: Date,
) {
  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

  const target =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

  const diffDays =
    Math.round(
      (target.getTime() -
        today.getTime()) /
        86_400_000,
    );

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString(
    'en-MY',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

function formatTime(
  value: string,
) {
  const [
    rawHour,
    minute,
  ] = value.split(':');

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

function formatTimeFromDate(
  date: Date,
) {
  return date.toLocaleTimeString(
    'en-MY',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    filters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      paddingHorizontal:
        spacing.lg,
      paddingVertical:
        spacing.md,
    },

    chip: {
      minHeight: 32,
      borderRadius:
        radius.pill,
      borderWidth: 1,
      borderColor:
        colors.divider,
      paddingHorizontal:
        spacing.md,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    chipSelected: {
      borderColor:
        colors.softCyan,
      backgroundColor:
        colors.softCyan,
    },

    chipText: {
      ...typography.small,
      color:
        colors.secondaryText,
      fontWeight: '700',
    },

    chipTextSelected: {
      color:
        colors.primaryText,
    },

    list: {
      padding:
        spacing.lg,
      paddingTop:
        spacing.xs,
      gap: spacing.md,
    },

    emptyList: {
      flexGrow: 1,
    },

    dateLabel: {
      ...typography.small,
      marginBottom:
        spacing.xs,
      color:
        colors.secondaryText,
      fontWeight: '700',
    },

    loadingArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      gap: spacing.sm,
    },

    loadingText: {
      color:
        colors.secondaryText,
      fontSize: 12,
    },

    emptyState: {
      flex: 1,
      minHeight: 300,
      alignItems: 'center',
      justifyContent:
        'center',
      padding:
        spacing.xl,
    },

    emptyTitle: {
      color:
        colors.primaryText,
      fontSize: 14,
      fontWeight: '700',
    },

    emptyText: {
      marginTop:
        spacing.xs,
      color:
        colors.secondaryText,
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
    },
  });