import {supabase} from '../config/supabase';
import {API_BASE_URL} from '../config/api';


export type UserEvent = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string;
  reminder_minutes: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateUserEventInput = {
  title: string;
  description?: string | null;
  eventDate: string;
  eventTime: string;
  reminderMinutes: number;
};

export type UpdateUserEventInput = {
  title?: string;
  description?: string | null;
  eventDate?: string;
  eventTime?: string;
  reminderMinutes?: number;
  isCompleted?: boolean;
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

export async function getUserEvents():
Promise<UserEvent[]> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/events`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to load events.',
    );
  }

  return data.events;
}

export async function createUserEvent(
  input: CreateUserEventInput,
): Promise<UserEvent> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/events`,
    {
      method: 'POST',
      headers: {
        Authorization:
          `Bearer ${token}`,
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify(input),
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to create event.',
    );
  }

  return data.event;
}

export async function updateUserEvent(
  eventId: string,
  updates: UpdateUserEventInput,
): Promise<UserEvent> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/events/${eventId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization:
          `Bearer ${token}`,
        'Content-Type':
          'application/json',
      },
      body:
        JSON.stringify(updates),
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to update event.',
    );
  }

  return data.event;
}

export async function deleteUserEvent(
  eventId: string,
): Promise<void> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to delete event.',
    );
  }
}