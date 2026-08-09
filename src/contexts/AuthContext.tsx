import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Linking} from 'react-native';
import type {AuthResponse,Session, User} from '@supabase/supabase-js';
import {supabase} from '../config/supabase';
import {
  getCurrentSession,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '../services/auth/authService';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;

  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (
    value: boolean,
  ) => void;

  signIn: (
    email: string,
    password: string,
  ) => Promise<void>;

  signUp: (
    email: string,
    password: string,
    metadata: SignUpMetadata,
  ) => Promise<AuthResponse['data']>;

  logout: () => Promise<void>;
};

type SignUpMetadata = {
  username: string;
  mobileNumber: string;
};
const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
  let isMounted = true;

  async function restoreSession() {
    try {
      const currentSession =
        await getCurrentSession();

      if (isMounted) {
        setSession(currentSession);
      }
    } catch (error) {
      console.error(
        'Failed to restore session:',
        error,
      );
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }

  async function handleRecoveryUrl(
    url: string | null,
  ) {
    if (!url) {
      return;
    }

    console.log(
      'Recovery deep link received:',
      url.split('#')[0],
    );

    try {
      const fragment =
        url.split('#')[1];

      if (!fragment) {
        return;
      }

      const params =
        new URLSearchParams(fragment);

      const accessToken =
        params.get('access_token');

      const refreshToken =
        params.get('refresh_token');

      const type =
        params.get('type');

      if (
        type !== 'recovery' ||
        !accessToken ||
        !refreshToken
      ) {
        return;
      }

      setIsPasswordRecovery(true);
      setIsLoading(false);


      const {data, error} =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (error) {
        throw error;
      }

      if (!isMounted) {
        return;
      }

      setSession(data.session);
      setIsPasswordRecovery(true);
      setIsLoading(false);

      console.log(
        'Password recovery session established.',
      );
    } catch (error) {
      console.error(
        'Failed to establish recovery session:',
        error,
      );
    }
  }

  void restoreSession();

  void Linking.getInitialURL().then(
    url => handleRecoveryUrl(url),
  );

  const linkingSubscription =
    Linking.addEventListener(
      'url',
      event => {
        void handleRecoveryUrl(
          event.url,
        );
      },
    );

  const {
    data: {subscription},
  } =
    supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        console.log(
          'SUPABASE AUTH EVENT:',
          event,
        );

        setSession(nextSession);
        setIsLoading(false);

        if (
          event ===
          'PASSWORD_RECOVERY'
        ) {
          setIsPasswordRecovery(true);
        }

        if (
          event === 'SIGNED_OUT'
        ) {
          setIsPasswordRecovery(false);
        }
      },
    );

  return () => {
    isMounted = false;
    linkingSubscription.remove();
    subscription.unsubscribe();
  };
}, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,

      isPasswordRecovery,
      setIsPasswordRecovery,

      async signIn(
        email: string,
        password: string,
      ) {
        await signInWithEmail(
          email,
          password,
        );
      },

      async signUp(
        email: string,
        password: string,
        metadata: SignUpMetadata,
      ) {
        return signUpWithEmail(
          email,
          password,
          metadata,
        );
      },

      async logout() {
        setIsPasswordRecovery(false);
        await signOut();
      },
    }),
    [
      session,
      isLoading,
      isPasswordRecovery,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}