import {supabase} from '../config/supabase';
import {API_BASE_URL} from '../config/api';

export type SupportTicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED';

export type SupportTicket = {
  id: string;
  user_id: string;

  subject: string;
  message: string;

  status: SupportTicketStatus;

  assigned_to: string | null;
  assignedToName: string | null;

  lecturer_reply: string | null;

  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type CreateSupportTicketInput = {
  subject: string;
  message: string;
};

export type UpdateStaffTicketInput = {
  status?: SupportTicketStatus;
  assignToMe?: boolean;
  lecturerReply?: string | null;
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

async function parseResponse(
  response: Response,
) {
  const rawBody =
    await response.text();

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Invalid server response: ${rawBody.slice(0, 200)}`,
    );
  }
}

export async function createSupportTicket(
  input: CreateSupportTicketInput,
): Promise<SupportTicket> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/support/tickets`,
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
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to create support request.',
    );
  }

  return data.ticket;
}

export async function getMySupportTickets():
Promise<SupportTicket[]> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/support/tickets/mine`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    },
  );

  const data =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to load support requests.',
    );
  }

  return data.tickets ?? [];
}

export async function resolveSupportTicket(
  ticketId: string,
): Promise<SupportTicket> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/support/tickets/${ticketId}/resolve`,
    {
      method: 'PATCH',
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    },
  );

  const data =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to resolve support request.',
    );
  }

  return data.ticket;
}

export async function deleteSupportTicket(
  ticketId: string,
): Promise<void> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/support/tickets/${ticketId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    },
  );

  const data =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to delete support request.',
    );
  }
}

export async function getStaffSupportTickets():
Promise<SupportTicket[]> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/support/tickets`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    },
  );

  const data =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to load support tickets.',
    );
  }

  return data.tickets ?? [];
}

export async function updateSupportTicketAsStaff(
  ticketId: string,
  updates: UpdateStaffTicketInput,
): Promise<SupportTicket> {
  const token =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/support/tickets/${ticketId}`,
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
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to update support ticket.',
    );
  }

  return data.ticket;
}