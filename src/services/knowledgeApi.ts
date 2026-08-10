import {supabase} from '../config/supabase';
import {API_BASE_URL} from '../config/api';

export type KnowledgeDocumentProcessingStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

  

export type KnowledgeDocument = {
  id: string;
  title: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  category: string | null;
  description: string | null;
  uploaded_by: string;
  processing_status:
    KnowledgeDocumentProcessingStatus;
  processing_error: string | null;
  is_enabled: boolean;
  accessible_roles:
    KnowledgeAccessRole[];
  version: number;
  created_at: string;
  updated_at: string;
};

type KnowledgeDocumentsResponse = {
  documents: KnowledgeDocument[];
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

export async function getKnowledgeDocuments(): Promise<
  KnowledgeDocument[]
> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/knowledge`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data =
    (await response.json()) as
      | KnowledgeDocumentsResponse
      | {
          error?: string;
        };

  if (!response.ok) {
    throw new Error(
      'error' in data && data.error
        ? data.error
        : 'Failed to load knowledge documents.',
    );
  }

  return (
    data as KnowledgeDocumentsResponse
  ).documents;
}

export async function setKnowledgeDocumentEnabled(
  documentId: string,
  isEnabled: boolean,
): Promise<KnowledgeDocument> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/knowledge/${documentId}/enabled`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        isEnabled,
      }),
    },
  );

  const data = (await response.json()) as {
    document?: KnowledgeDocument;
    error?: string;
  };

  if (!response.ok || !data.document) {
    throw new Error(
      data.error ??
        'Failed to update knowledge document.',
    );
  }

  return data.document;
}

export type KnowledgeAccessRole =
  | 'STUDENT'
  | 'LECTURER'
  | 'ADMIN';

export type UploadKnowledgePdfInput = {
  file: {
    uri: string;
    name: string;
    type: string;
  };

  title?: string;

  accessibleRoles:
    KnowledgeAccessRole[];
};

type UploadKnowledgePdfResponse = {
  document: KnowledgeDocument;
  chunkCount: number;
};

export async function uploadKnowledgePdf(
  input: UploadKnowledgePdfInput,
): Promise<UploadKnowledgePdfResponse> {
  const token = await getAccessToken();

  const formData = new FormData();

  formData.append(
    'file',
    {
      uri: input.file.uri,
      name: input.file.name,
      type:
        input.file.type ||
        'application/pdf',
    } as any,
  );

  if (input.title?.trim()) {
    formData.append(
      'title',
      input.title.trim(),
    );
  }

  formData.append(
    'accessibleRoles',
    JSON.stringify(
        input.accessibleRoles,
    ),
  );

  const response = await fetch(
    `${API_BASE_URL}/api/knowledge/upload`,
    {
      method: 'POST',
      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      /*
       * Important:
       * Do NOT manually set Content-Type here.
       *
       * React Native must generate the multipart
       * boundary automatically.
       */
      body: formData,
    },
  );

  const rawBody =
    await response.text();

  let data:
    | UploadKnowledgePdfResponse
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
      'error' in data &&
      data.error
        ? data.error
        : 'Failed to upload PDF.',
    );
  }

  return data as UploadKnowledgePdfResponse;
}

export async function deleteKnowledgeDocument(
  documentId: string,
): Promise<void> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/knowledge/${documentId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const rawBody = await response.text();

  let data: {
    success?: boolean;
    documentId?: string;
    error?: string;
  };

  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Invalid server response: ${rawBody.slice(0, 200)}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error ??
        'Failed to delete knowledge document.',
    );
  }
}

export async function updateKnowledgeDocumentAccess(
  documentId: string,
  accessibleRoles: KnowledgeAccessRole[],
): Promise<KnowledgeDocument> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/knowledge/${documentId}/access`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessibleRoles,
      }),
    },
  );

  const rawBody = await response.text();

  let data: {
    document?: KnowledgeDocument;
    error?: string;
  };

  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Invalid server response: ${rawBody.slice(0, 200)}`,
    );
  }

  if (!response.ok || !data.document) {
    throw new Error(
      data.error ??
        'Failed to update document access.',
    );
  }

  return data.document;
}