import { API_BASE_URL } from "../config/api";
import {supabase} from '../config/supabase';

export type TimetableEntry = {
  id: string;
  user_id: string;
  course_code: string;
  course_name: string;
  class_type: string | null;
  class_group: string | null;
  day_of_week:
    | 'MON'
    | 'TUE'
    | 'WED'
    | 'THU'
    | 'FRI'
    | 'SAT'
    | 'SUN';
  start_time: string;
  end_time: string;
  reminder_minutes: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type TimetableResponse = {
  entries: TimetableEntry[];
};

async function getAccessToken() {
  const {
    data: {session},
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error(
      'Authentication required.',
    );
  }

  return session.access_token;
}

export async function getTimetable():
Promise<TimetableEntry[]> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/timetable`,
    {
      method: 'GET',
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    },
  );

  const rawBody =
    await response.text();

  let data:
    | TimetableResponse
    | {
        error?: string;
      };

  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Invalid server response: ${rawBody.slice(
        0,
        200,
      )}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      'error' in data && data.error
        ? data.error
        : 'Failed to load timetable.',
    );
  }

  return (
    data as TimetableResponse
  ).entries;
}

export type TimetablePreviewEntry = {
  courseCode: string;
  courseName: string;
  classType: string | null;
  classGroup: string | null;
  dayOfWeek:
    | 'MON'
    | 'TUE'
    | 'WED'
    | 'THU'
    | 'FRI'
    | 'SAT'
    | 'SUN';
  startTime: string;
  endTime: string;
};

type TimetablePreviewResponse = {
  entries: TimetablePreviewEntry[];
  entryCount: number;
};

type TimetableImportResponse = {
  entries: TimetableEntry[];
  entryCount: number;
};

export async function previewTimetable(
  rawText: string,
): Promise<TimetablePreviewEntry[]> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/timetable/preview`,
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        rawText,
      }),
    },
  );

  const rawBody =
    await response.text();

  let data:
    | TimetablePreviewResponse
    | {
        error?: string;
      };

  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Invalid server response: ${rawBody.slice(
        0,
        200,
      )}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      'error' in data && data.error
        ? data.error
        : 'Failed to preview timetable.',
    );
  }

  return (
    data as TimetablePreviewResponse
  ).entries;
}

export async function importTimetable(
  entries: TimetablePreviewEntry[],
): Promise<TimetableEntry[]> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/timetable/import`,
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        entries,
      }),
    },
  );

  const rawBody =
    await response.text();

  let data:
    | TimetableImportResponse
    | {
        error?: string;
      };

  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Invalid server response: ${rawBody.slice(
        0,
        200,
      )}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      'error' in data && data.error
        ? data.error
        : 'Failed to import timetable.',
    );
  }

  return (
    data as TimetableImportResponse
  ).entries;
}

export type UpdateTimetableEntryInput = {
  courseCode?: string;
  courseName?: string;
  classType?: string | null;
  classGroup?: string | null;
  dayOfWeek?:
    | 'MON'
    | 'TUE'
    | 'WED'
    | 'THU'
    | 'FRI'
    | 'SAT'
    | 'SUN';
  startTime?: string;
  endTime?: string;
  reminderMinutes?: number;
  isEnabled?: boolean;
};

type UpdateTimetableEntryResponse = {
  entry: TimetableEntry;
};

type DeleteTimetableEntryResponse = {
  success: boolean;
  entryId: string;
};

export async function updateTimetableEntry(
  entryId: string,
  updates: UpdateTimetableEntryInput,
): Promise<TimetableEntry> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/timetable/${entryId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    },
  );

  const rawBody =
    await response.text();

  let data:
    | UpdateTimetableEntryResponse
    | {error?: string};

  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Invalid server response: ${rawBody.slice(
        0,
        200,
      )}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      'error' in data && data.error
        ? data.error
        : 'Failed to update timetable entry.',
    );
  }

  return (
    data as UpdateTimetableEntryResponse
  ).entry;
}

export async function deleteTimetableEntry(
  entryId: string,
): Promise<string> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/timetable/${entryId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const rawBody =
    await response.text();

  let data:
    | DeleteTimetableEntryResponse
    | {error?: string};

  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Invalid server response: ${rawBody.slice(
        0,
        200,
      )}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      'error' in data && data.error
        ? data.error
        : 'Failed to delete timetable entry.',
    );
  }

  return (
    data as DeleteTimetableEntryResponse
  ).entryId;
}