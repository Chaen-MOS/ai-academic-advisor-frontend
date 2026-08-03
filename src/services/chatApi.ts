import {API_BASE_URL} from '../config/api';
import {supabase} from '../config/supabase';

export type ChatApiResponse = {
  answer: string;
};

export async function sendChatMessage(
  message: string,
): Promise<ChatApiResponse> {
  const {
    data: {session},
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session?.access_token) {
    throw new Error('You must be signed in to send a message.');
  }

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      message,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      responseText ||
        `Chat request failed with status ${response.status}`,
    );
  }

  return JSON.parse(responseText) as ChatApiResponse;
}