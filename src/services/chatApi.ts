import {API_BASE_URL} from '../config/api';

export type ChatApiResponse = {
  answer: string;
};

export async function sendChatMessage(
  studentId: string,
  message: string,
): Promise<ChatApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      studentId,
      message,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      responseText || `Chat request failed with status ${response.status}`,
    );
  }

  try {
    return JSON.parse(responseText) as ChatApiResponse;
  } catch {
    throw new Error('The backend returned invalid JSON.');
  }
}