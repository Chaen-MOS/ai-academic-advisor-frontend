import {API_BASE_URL} from '../config/api';
import {supabase} from '../config/supabase';

export type ConversationListItem = {
  id: string;
  title: string;
  titleStatus:
    | 'PENDING'
    | 'GENERATED'
    | 'FALLBACK'
    | 'MANUAL';
  lastMessagePreview: string | null;
  messageCount: number;
  createdAt: string;
  lastMessageAt: string;
};

export type ConversationMessage = {
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

type ConversationListResponse = {
  conversations: ConversationListItem[];
};

type ConversationMessagesResponse = {
  conversation: {
    id: string;
    title: string;
    titleStatus:
      | 'PENDING'
      | 'GENERATED'
      | 'FALLBACK'
      | 'MANUAL';
  };
  messages: ConversationMessage[];
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

export async function getConversations(): Promise<
  ConversationListItem[]
> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/conversations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body.error ?? 'Unable to load conversations.',
    );
  }

  return (body as ConversationListResponse).conversations;
}

export async function getConversationMessages(
  conversationId: string,
): Promise<ConversationMessagesResponse> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body.error ?? 'Unable to load conversation messages.',
    );
  }

  return body as ConversationMessagesResponse;
}

export async function deleteConversation(
  conversationId: string,
): Promise<void> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const text = await response.text();

  console.log('DELETE STATUS:', response.status);
  console.log('DELETE BODY:', text);

  if (!response.ok) {
    throw new Error(text);
  }
}

export async function retryAssistantMessage(
  conversationId: string,
  assistantMessageId: string,
): Promise<ConversationMessage> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}/messages/${assistantMessageId}/retry`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body.message ??
        body.error ??
        'Unable to retry response.',
    );
  }

  return body.assistantMessage as ConversationMessage;
}