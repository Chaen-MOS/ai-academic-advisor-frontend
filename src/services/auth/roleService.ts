import {API_BASE_URL} from '../../config/api';
import {supabase} from '../../config/supabase';

export type UserRole =
  | 'STUDENT'
  | 'LECTURER'
  | 'ADMIN';

type CurrentUserResponse = {
  user: {
    id: string;
    email: string | null;
    role: UserRole;
  };
};

async function getAccessToken(): Promise<string> {
  const {
    data: {session},
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const token = session?.access_token;

  if (!token) {
    throw new Error(
      'Authentication required.',
    );
  }

  return token;
}

export async function getCurrentUserRole():
Promise<UserRole> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/auth/me`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      `Failed to load user role: ${response.status}`,
    );
  }

  if (
    !body?.user?.role ||
    !['STUDENT', 'LECTURER', 'ADMIN'].includes(
      body.user.role,
    )
  ) {
    throw new Error(
      'Invalid role returned by server.',
    );
  }

  return body.user.role as UserRole;
}