import {
  getTimetable,
} from './timetableApi';

import {
  getUserEvents,
} from './eventApi';

import {
  getProfile,
} from './profileApi';

import {
  cancelAllEventReminders,
  cancelAllTimetableReminders,
  syncEventReminders,
  syncTimetableReminders,
} from './notificationService';

export async function syncAcademicReminders() {
  const [
    timetableEntries,
    events,
    profileResult,
  ] = await Promise.all([
    getTimetable(),
    getUserEvents(),
    getProfile(),
  ]);

  const {
    enable_class_reminders,
    enable_event_reminders,
  } = profileResult.profile;

  if (enable_class_reminders) {
    await syncTimetableReminders(
      timetableEntries,
    );
  } else {
    await cancelAllTimetableReminders();
  }

  if (enable_event_reminders) {
    await syncEventReminders(
      events,
    );
  } else {
    await cancelAllEventReminders();
  }
}