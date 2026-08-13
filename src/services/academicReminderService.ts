import {
  getTimetable,
} from './timetableApi';

import {
  getUserEvents,
} from './eventApi';

import {
  syncEventReminders,
  syncTimetableReminders,
} from './notificationService';

export async function syncAcademicReminders() {
  const [
    timetableEntries,
    events,
  ] = await Promise.all([
    getTimetable(),
    getUserEvents(),
  ]);

  await Promise.all([
    syncTimetableReminders(
      timetableEntries,
    ),

    syncEventReminders(
      events,
    ),
  ]);
}