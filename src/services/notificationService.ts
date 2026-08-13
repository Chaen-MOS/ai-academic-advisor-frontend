import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import type {
  TimetableEntry,
} from './timetableApi';

import type {
  UserEvent,
} from './eventApi';

const REMINDER_CHANNEL_ID =
  'academic-reminders';

export type ReminderSourceType =
  | 'TIMETABLE'
  | 'EVENT';

type BaseReminderInput = {
  id: string;
  sourceType: ReminderSourceType;
  title: string;
  body: string;
};

type OneTimeReminderInput =
  BaseReminderInput & {
    scheduledAt: Date;
  };

type WeeklyReminderInput =
  BaseReminderInput & {
    dayOfWeek:
      | 'MON'
      | 'TUE'
      | 'WED'
      | 'THU'
      | 'FRI'
      | 'SAT'
      | 'SUN';

    startTime: string;

    reminderMinutes: number;
  };

const DAY_INDEX = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
} as const;

export async function initializeNotifications() {
  const settings =
    await notifee.requestPermission();

  const permissionGranted =
    settings.authorizationStatus ===
      AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus ===
      AuthorizationStatus.PROVISIONAL;

  if (!permissionGranted) {
    return false;
  }

  await notifee.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: 'Academic Reminders',
    importance:
      AndroidImportance.HIGH,
    vibration: true,
  });

  return true;
}

function buildNotificationId(
  sourceType: ReminderSourceType,
  sourceId: string,
) {
  return `${sourceType.toLowerCase()}-${sourceId}`;
}

export async function scheduleOneTimeReminder({
  id,
  sourceType,
  title,
  body,
  scheduledAt,
}: OneTimeReminderInput) {
  const permissionGranted =
    await initializeNotifications();

  if (!permissionGranted) {
    throw new Error(
      'Notification permission was not granted.',
    );
  }

  if (
    scheduledAt.getTime() <=
    Date.now()
  ) {
    throw new Error(
      'Reminder time must be in the future.',
    );
  }

  const notificationId =
    buildNotificationId(
      sourceType,
      id,
    );

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp:
      scheduledAt.getTime(),
  };

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title,
      body,

      android: {
        channelId:
          REMINDER_CHANNEL_ID,

        pressAction: {
          id: 'default',
        },
      },
    },
    trigger,
  );

  return notificationId;
}

export async function scheduleWeeklyReminder({
  id,
  sourceType,
  title,
  body,
  dayOfWeek,
  startTime,
  reminderMinutes,
}: WeeklyReminderInput) {
  const permissionGranted =
    await initializeNotifications();

  if (!permissionGranted) {
    throw new Error(
      'Notification permission was not granted.',
    );
  }

  if (reminderMinutes <= 0) {
    await cancelReminder(
      sourceType,
      id,
    );

    return null;
  }

  const notificationId =
    buildNotificationId(
      sourceType,
      id,
    );

  const firstTrigger =
    calculateNextWeeklyTrigger({
      dayOfWeek,
      startTime,
      reminderMinutes,
    });

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp:
      firstTrigger.getTime(),
    repeatFrequency:
      RepeatFrequency.WEEKLY,
  };

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title,
      body,

      android: {
        channelId:
          REMINDER_CHANNEL_ID,

        pressAction: {
          id: 'default',
        },
      },
    },
    trigger,
  );

  return notificationId;
}

export async function cancelReminder(
  sourceType: ReminderSourceType,
  sourceId: string,
) {
  const notificationId =
    buildNotificationId(
      sourceType,
      sourceId,
    );

  await notifee.cancelNotification(
    notificationId,
  );
}

export async function rescheduleWeeklyReminder(
  input: WeeklyReminderInput,
) {
  await cancelReminder(
    input.sourceType,
    input.id,
  );

  return scheduleWeeklyReminder(
    input,
  );
}

function calculateNextWeeklyTrigger({
  dayOfWeek,
  startTime,
  reminderMinutes,
}: {
  dayOfWeek:
    WeeklyReminderInput['dayOfWeek'];
  startTime: string;
  reminderMinutes: number;
}) {
  const [
    hourText,
    minuteText,
  ] = startTime.split(':');

  const hour =
    Number(hourText);

  const minute =
    Number(minuteText);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    throw new Error(
      'Invalid class start time.',
    );
  }

  const now =
    new Date();

  const target =
    new Date();

  const targetDay =
    DAY_INDEX[dayOfWeek];

  let daysAhead =
    targetDay - now.getDay();

  if (daysAhead < 0) {
    daysAhead += 7;
  }

  target.setDate(
    now.getDate() +
      daysAhead,
  );

  target.setHours(
    hour,
    minute,
    0,
    0,
  );

  target.setMinutes(
    target.getMinutes() -
      reminderMinutes,
  );

  if (
    target.getTime() <=
    now.getTime()
  ) {
    target.setDate(
      target.getDate() + 7,
    );
  }

  return target;
}

export async function syncTimetableReminders(
  entries: TimetableEntry[],
) {
  const permissionGranted =
    await initializeNotifications();

  if (!permissionGranted) {
    return;
  }

  const expectedIds = new Set(
    entries.map(entry =>
      buildNotificationId(
        'TIMETABLE',
        entry.id,
      ),
    ),
  );

  const triggerIds =
    await notifee.getTriggerNotificationIds();

  for (const notificationId of triggerIds) {
    if (
      notificationId.startsWith(
        'timetable-',
      ) &&
      !expectedIds.has(
        notificationId,
      )
    ) {
      await notifee.cancelNotification(
        notificationId,
      );
    }
  }

  for (const entry of entries) {
    if (
      !entry.is_enabled ||
      entry.reminder_minutes <= 0
    ) {
      await cancelReminder(
        'TIMETABLE',
        entry.id,
      );

      continue;
    }

    await rescheduleWeeklyReminder({
      id: entry.id,
      sourceType: 'TIMETABLE',

      title: entry.course_code,

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
}

function buildEventReminderBody(
  reminderMinutes: number,
) {
  if (reminderMinutes === 1440) {
    return 'This event is coming up in 1 day.';
  }

  if (reminderMinutes === 60) {
    return 'This event is coming up in 1 hour.';
  }

  return `This event is coming up in ${reminderMinutes} minutes.`;
}

export async function syncEventReminders(
  events: UserEvent[],
) {
  const permissionGranted =
    await initializeNotifications();

  if (!permissionGranted) {
    return;
  }

  const expectedIds = new Set(
    events
      .filter(
        event =>
          !event.is_completed &&
          event.reminder_minutes > 0,
      )
      .map(event =>
        buildNotificationId(
          'EVENT',
          event.id,
        ),
      ),
  );

  const triggerIds =
    await notifee.getTriggerNotificationIds();

  // remove complete, not exist, reminder off noti
  for (const notificationId of triggerIds) {
    if (
      notificationId.startsWith(
        'event-',
      ) &&
      !expectedIds.has(
        notificationId,
      )
    ) {
      await notifee.cancelNotification(
        notificationId,
      );
    }
  }

  //sync the event status based on database
  for (const event of events) {
    await cancelReminder(
      'EVENT',
      event.id,
    );

    if (
      event.is_completed ||
      event.reminder_minutes <= 0
    ) {
      continue;
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

    // Not reshcedule for the expired event
    if (
      reminderDate.getTime() <=
      Date.now()
    ) {
      continue;
    }

    await scheduleOneTimeReminder({
      id: event.id,
      sourceType: 'EVENT',

      title: event.title,

      body: buildEventReminderBody(
        event.reminder_minutes,
      ),

      scheduledAt:
        reminderDate,
    });
  }
}

export async function cancelAllTimetableReminders() {
  const triggerIds =
    await notifee.getTriggerNotificationIds();

  for (const notificationId of triggerIds) {
    if (
      notificationId.startsWith(
        'timetable-',
      )
    ) {
      await notifee.cancelNotification(
        notificationId,
      );
    }
  }
}

export async function cancelAllEventReminders() {
  const triggerIds =
    await notifee.getTriggerNotificationIds();

  for (const notificationId of triggerIds) {
    if (
      notificationId.startsWith(
        'event-',
      )
    ) {
      await notifee.cancelNotification(
        notificationId,
      );
    }
  }
}