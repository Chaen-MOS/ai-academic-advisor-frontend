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
  Bell,
  CalendarDays,
  CheckCircle2,
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
  EventModal,
  type EventFormValues,
} from '../components/events/EventModal';

import {
  createUserEvent,
  deleteUserEvent,
  getUserEvents,
  updateUserEvent,
  type UserEvent,
} from '../services/eventApi';

import {
  cancelReminder,
  scheduleOneTimeReminder,
} from '../services/notificationService';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../theme';

import type {
  RootStackParamList,
} from '../types/navigation';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'MyEvents'
  >;

export default function MyEventsScreen({
  navigation,
}: Props) {
  const [events, setEvents] =
    useState<UserEvent[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isEventModalVisible,
    setIsEventModalVisible,
  ] = useState(false);

  const [
    editingEvent,
    setEditingEvent,
  ] = useState<UserEvent | null>(
    null,
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadEvents() {
        try {
          setIsLoading(true);

          const result =
            await getUserEvents();

          if (isActive) {
            setEvents(result);
          }
        } catch (error) {
          console.error(
            'Failed to load events:',
            error,
          );

          if (isActive) {
            Alert.alert(
              'Unable to Load Events',
              error instanceof Error
                ? error.message
                : 'Failed to load events.',
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadEvents();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const {
    upcomingEvents,
    completedEvents,
  } = useMemo(() => {
    const now = new Date();

    const upcoming: UserEvent[] = [];
    const completed: UserEvent[] = [];

    for (const event of events) {
      const eventDate =
        buildEventDate(event);

      if (
        event.is_completed ||
        eventDate.getTime() <
          now.getTime()
      ) {
        completed.push(event);
      } else {
        upcoming.push(event);
      }
    }

    upcoming.sort(
      (a, b) =>
        buildEventDate(a).getTime() -
        buildEventDate(b).getTime(),
    );

    completed.sort(
      (a, b) =>
        buildEventDate(b).getTime() -
        buildEventDate(a).getTime(),
    );

    return {
      upcomingEvents: upcoming,
      completedEvents: completed,
    };
  }, [events]);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setIsEventModalVisible(true);
  };

  const handleOpenEdit = (
    event: UserEvent,
  ) => {
    setEditingEvent(event);
    setIsEventModalVisible(true);
  };

  const handleCloseModal = () => {
    if (isSaving) {
      return;
    }

    setIsEventModalVisible(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = async (
    values: EventFormValues,
  ) => {
    try {
      setIsSaving(true);

      if (editingEvent) {
        const updatedEvent =
          await updateUserEvent(
            editingEvent.id,
            {
              title:
                values.title,

              description:
                values.description ||
                null,

              eventDate:
                values.eventDate,

              eventTime:
                values.eventTime,

              reminderMinutes:
                values.reminderMinutes,
            },
          );

        setEvents(current =>
          current.map(event =>
            event.id ===
            updatedEvent.id
              ? updatedEvent
              : event,
          ),
        );

        await syncEventReminder(
          updatedEvent,
        );

        setIsEventModalVisible(false);
        setEditingEvent(null);

        Alert.alert(
          'Event Updated',
          'Your event was updated successfully.',
        );

        return;
      }

      const createdEvent =
        await createUserEvent({
          title:
            values.title,

          description:
            values.description ||
            null,

          eventDate:
            values.eventDate,

          eventTime:
            values.eventTime,

          reminderMinutes:
            values.reminderMinutes,
        });

      setEvents(current => [
        ...current,
        createdEvent,
      ]);

      await syncEventReminder(
        createdEvent,
      );

      setIsEventModalVisible(false);

      Alert.alert(
        'Event Created',
        'Your event was created successfully.',
      );
    } catch (error) {
      console.error(
        'Failed to save event:',
        error,
      );

      Alert.alert(
        'Save Failed',
        error instanceof Error
          ? error.message
          : 'Unable to save event.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenMenu = (
    event: UserEvent,
  ) => {
    Alert.alert(
      event.title,
      formatEventDateTime(
        event,
      ),
      [
        {
          text: 'Edit',
          onPress: () =>
            handleOpenEdit(event),
        },
        {
          text:
            event.is_completed
              ? 'Mark as Upcoming'
              : 'Mark as Completed',
          onPress: () => {
            void handleToggleCompleted(
              event,
            );
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            confirmDeleteEvent(
              event,
            ),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const handleToggleCompleted =
    async (
      event: UserEvent,
    ) => {
      try {
        const updatedEvent =
          await updateUserEvent(
            event.id,
            {
              isCompleted:
                !event.is_completed,
            },
          );

        setEvents(current =>
          current.map(item =>
            item.id ===
            updatedEvent.id
              ? updatedEvent
              : item,
          ),
        );

        if (
          updatedEvent.is_completed
        ) {
          await cancelReminder(
            'EVENT',
            updatedEvent.id,
          );
        } else {
          await syncEventReminder(
            updatedEvent,
          );
        }
      } catch (error) {
        Alert.alert(
          'Update Failed',
          error instanceof Error
            ? error.message
            : 'Unable to update event.',
        );
      }
    };

  const confirmDeleteEvent = (
    event: UserEvent,
  ) => {
    Alert.alert(
      'Delete Event?',
      `Are you sure you want to delete "${event.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void handleDeleteEvent(
              event,
            );
          },
        },
      ],
    );
  };

  const handleDeleteEvent =
    async (
      event: UserEvent,
    ) => {
      try {
        await deleteUserEvent(
          event.id,
        );

        await cancelReminder(
          'EVENT',
          event.id,
        );

        setEvents(current =>
          current.filter(
            item =>
              item.id !==
              event.id,
          ),
        );
      } catch (error) {
        Alert.alert(
          'Delete Failed',
          error instanceof Error
            ? error.message
            : 'Unable to delete event.',
        );
      }
    };

  return (
    <SafeAreaView
      edges={[
        'top',
        'bottom',
      ]}
      style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() =>
            navigation.goBack()
          }
          style={
            styles.headerButton
          }>
          <ArrowLeft
            size={22}
            color={
              colors.primaryText
            }
          />
        </Pressable>

        <Text
          style={
            styles.headerTitle
          }>
          My Events
        </Text>

        <Pressable
          accessibilityLabel="Create event"
          onPress={
            handleOpenCreate
          }
          style={
            styles.headerButton
          }>
          <Plus
            size={22}
            strokeWidth={2.3}
            color={
              colors.primaryText
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
        <View style={styles.hero}>
          <View
            style={
              styles.heroIcon
            }>
            <CalendarDays
              size={24}
              color={colors.accent}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.title}>
              Events & Reminders
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Keep track of deadlines,
              meetings and academic
              activities.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={
            handleOpenCreate
          }
          style={
            styles.createButton
          }>
          <Plus
            size={17}
            color={
              colors.primaryText
            }
          />

          <Text
            style={
              styles.createButtonText
            }>
            Create Event
          </Text>
        </Pressable>

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
              Loading events...
            </Text>
          </View>
        ) : (
          <>
            <EventSection
              title="UPCOMING"
              events={
                upcomingEvents
              }
              emptyText="No upcoming events"
              onOpenMenu={
                handleOpenMenu
              }
            />

            <EventSection
              title="COMPLETED / PAST"
              events={
                completedEvents
              }
              emptyText="No completed events"
              onOpenMenu={
                handleOpenMenu
              }
            />
          </>
        )}
      </ScrollView>

      <EventModal
        visible={
          isEventModalVisible
        }
        event={editingEvent}
        isSaving={isSaving}
        onClose={
          handleCloseModal
        }
        onSave={
          handleSaveEvent
        }
      />
    </SafeAreaView>
  );
}

function EventSection({
  title,
  events,
  emptyText,
  onOpenMenu,
}: {
  title: string;
  events: UserEvent[];
  emptyText: string;
  onOpenMenu: (
    event: UserEvent,
  ) => void;
}) {
  return (
    <View
      style={
        styles.section
      }>
      <Text
        style={
          styles.sectionTitle
        }>
        {title}
      </Text>

      {events.length === 0 ? (
        <View
          style={
            styles.emptyCard
          }>
          <Text
            style={
              styles.emptyText
            }>
            {emptyText}
          </Text>
        </View>
      ) : (
        events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onOpenMenu={
              onOpenMenu
            }
          />
        ))
      )}
    </View>
  );
}

function EventCard({
  event,
  onOpenMenu,
}: {
  event: UserEvent;
  onOpenMenu: (
    event: UserEvent,
  ) => void;
}) {
  return (
    <View
      style={[
        styles.eventCard,
        event.is_completed &&
          styles.completedCard,
      ]}>
      <View
        style={
          styles.eventTop
        }>
        <View style={styles.flex}>
          <Text
            style={
              styles.eventTitle
            }>
            {event.title}
          </Text>

          {event.description ? (
            <Text
              numberOfLines={2}
              style={
                styles.description
              }>
              {
                event.description
              }
            </Text>
          ) : null}
        </View>

        <Pressable
          hitSlop={8}
          onPress={() =>
            onOpenMenu(event)
          }
          style={
            styles.moreButton
          }>
          <MoreVertical
            size={19}
            color={
              colors.secondaryText
            }
          />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <CalendarDays
          size={13}
          color={
            colors.secondaryText
          }
        />

        <Text
          style={
            styles.metaText
          }>
          {formatEventDateTime(
            event,
          )}
        </Text>
      </View>

      <View style={styles.metaRow}>
        {event.is_completed ? (
          <CheckCircle2
            size={13}
            color={
              colors.accent
            }
          />
        ) : (
          <Bell
            size={13}
            color={
              colors.secondaryText
            }
          />
        )}

        <Text
          style={
            styles.metaText
          }>
          {event.is_completed
            ? 'Completed'
            : formatReminder(
                event.reminder_minutes,
              )}
        </Text>
      </View>
    </View>
  );
}

async function syncEventReminder(
  event: UserEvent,
) {
  await cancelReminder(
    'EVENT',
    event.id,
  );

  if (
    event.is_completed ||
    event.reminder_minutes <= 0
  ) {
    return;
  }

  const eventDate =
    buildEventDate(event);

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
    return;
  }

  await scheduleOneTimeReminder({
    id: event.id,
    sourceType: 'EVENT',
    title: event.title,
    body:
      event.description ??
      'Your academic event is coming up.',
    scheduledAt:
      reminderDate,
  });
}

function buildEventDate(
  event: UserEvent,
) {
  return new Date(
    `${event.event_date}T${event.event_time.slice(
      0,
      5,
    )}:00`,
  );
}

function formatEventDateTime(
  event: UserEvent,
) {
  const date =
    buildEventDate(event);

  return date.toLocaleString(
    'en-MY',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  );
}

function formatReminder(
  minutes: number,
) {
  if (minutes <= 0) {
    return 'Reminder off';
  }

  if (minutes === 1440) {
    return '1 day before';
  }

  if (minutes === 60) {
    return '1 hour before';
  }

  return `${minutes} min before`;
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    header: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal:
        spacing.md,
      backgroundColor:
        colors.softCyan,
    },

    headerButton: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color:
        colors.primaryText,
      fontSize: 16,
      fontWeight: '700',
    },

    content: {
      padding: spacing.lg,
      paddingBottom: 50,
    },

    flex: {
      flex: 1,
    },

    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },

    heroIcon: {
      width: 48,
      height: 48,
      borderRadius:
        radius.lg,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        colors.softCyan,
    },

    title: {
      ...typography.cardHeading,
      color:
        colors.primaryText,
      fontSize: 20,
      fontWeight: '700',
    },

    subtitle: {
      marginTop: 3,
      color:
        colors.secondaryText,
      fontSize: 12,
      lineHeight: 18,
    },

    createButton: {
      minHeight: 44,
      marginTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: spacing.xs,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.accent,
    },

    createButtonText: {
      color:
        colors.primaryText,
      fontSize: 12,
      fontWeight: '700',
    },

    loadingArea: {
      minHeight: 220,
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

    section: {
      marginTop: spacing.xl,
    },

    sectionTitle: {
      marginBottom:
        spacing.sm,
      color:
        colors.secondaryText,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.3,
    },

    eventCard: {
      padding: spacing.md,
      marginBottom:
        spacing.sm,
      borderWidth: 1,
      borderColor:
        'rgba(189, 200, 206, 0.55)',
      borderRadius:
        radius.md,
      backgroundColor:
        colors.white,
    },

    completedCard: {
      opacity: 0.65,
    },

    eventTop: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
    },

    eventTitle: {
      color:
        colors.primaryText,
      fontSize: 13,
      fontWeight: '700',
    },

    description: {
      marginTop: 3,
      color:
        colors.secondaryText,
      fontSize: 11,
      lineHeight: 16,
    },

    moreButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    metaRow: {
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    metaText: {
      color:
        colors.secondaryText,
      fontSize: 10,
    },

    emptyCard: {
      minHeight: 80,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1,
      borderColor:
        '#E4EAEC',
      borderRadius:
        radius.md,
      backgroundColor:
        colors.white,
    },

    emptyText: {
      color:
        colors.secondaryText,
      fontSize: 11,
    },
  });