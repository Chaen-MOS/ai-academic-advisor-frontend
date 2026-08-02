import {supabase} from '../../config/supabase';

type SignUpMetadata = {
  username: string;
  mobileNumber: string;
};

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: SignUpMetadata,
) {
  const {data, error} = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        username: metadata.username,
        mobile_number: metadata.mobileNumber,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signInWithEmail(
  email: string,
  password: string,
) {
  const {data, error} = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const {error} = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function requestPasswordReset(email: string) {
  const {error} = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentSession() {
  const {data, error} = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}