import {v4 as uuidv4} from 'uuid';

import {API_BASE_URL} from '../config/api';
import {supabase} from '../config/supabase';

export type ApiMessage = {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  processingStatus:
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED';
  createdAt: string;
};

export type ApiConversation = {
  id: string;
  title: string;
  titleStatus:
    | 'PENDING'
    | 'GENERATED'
    | 'FALLBACK'
    | 'MANUAL';
  lastMessagePreview: string | null;
  messageCount: number;
  lastMessageAt: string;
};

export type ChatApiResponse = {
  conversation: ApiConversation;
  wasCreated: boolean;
  userMessage: ApiMessage;
  assistantMessage: ApiMessage;
};

async function getAccessToken(): Promise<string> {
  const {
    data: {session},
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session?.access_token) {
    throw new Error('You must be signed in.');
  }

  return session.access_token;
}

export async function sendChatMessage(
  message: string,
  conversationId: string | null,
): Promise<ChatApiResponse> {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    throw new Error('Message is required.');
  }

  const token = await getAccessToken();
  const clientMessageId = uuidv4();

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      conversationId,
      clientMessageId,
      message: normalizedMessage,
    }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${JSON.stringify(body)}`,
    );
  }

  if (!body?.conversation?.id) {
    throw new Error(
      `INVALID RESPONSE: ${JSON.stringify(body)}`,
    );
  }

  return body as ChatApiResponse;
}