import {API_BASE_URL} from '../config/api';
import {supabase} from '../config/supabase';

export type StudentProfile = {
  user_id: string;
  full_name: string;
  preferred_name: string;
  student_id: string;
  programme: string;
  faculty: string;
  current_year: number | null;
  current_trimester: string | null;
  academic_standing:
    | 'NORMAL'
    | 'PROBATION'
    | 'WARNING'
    | 'TERMINATED'
    | 'GRADUATED';
  cgpa: number | null;
  credits_earned: number | null;
  total_credits_required: number | null;
  mobile_number: string | null;
  avatar_url: string | null;
  profile_source: 'SELF_DECLARED';
  is_verified: boolean;
  chat_memory_enabled: boolean;
  enable_class_reminders: boolean;
  enable_event_reminders: boolean;
  career_interest: string | null;
};

type ProfileResponse = {
  profile: StudentProfile;
  notice: string;
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

export async function getProfile(): Promise<ProfileResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? 'Unable to load profile.');
  }

  return body as ProfileResponse;
}

export async function updateProfile(
  profile: Partial<{
    fullName: string;
    preferredName: string;
    studentId: string;
    programme: string;
    faculty: string;
    currentYear: number | null;
    currentTrimester: string | null;
    academicStanding:
      | 'NORMAL'
      | 'PROBATION'
      | 'WARNING'
      | 'TERMINATED'
      | 'GRADUATED';
    cgpa: number | null;
    creditsEarned: number | null;
    totalCreditsRequired: number | null;
    mobileNumber: string | null;
    avatarUrl: string | null;
    chatMemoryEnabled: boolean;
    enableClassReminders: boolean;
    enableEventReminders: boolean;
    careerInterest: string | null;
  }>,
): Promise<ProfileResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
        body.message ??
        body.error ??
        'Unable to update profile.',
    );
    }
  return body as ProfileResponse;
}