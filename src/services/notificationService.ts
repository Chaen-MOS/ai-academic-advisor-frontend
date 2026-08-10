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

  // 取得目前 Notifee 已经 schedule 的 notifications
  const triggerIds =
    await notifee.getTriggerNotificationIds();

  // 先清掉已经不存在的 timetable reminder
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

  // 根据 DB 当前状态重新同步
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