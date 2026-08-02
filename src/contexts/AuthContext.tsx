import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<AuthResponse['data']>;
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

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const currentSession = await getCurrentSession();

        if (isMounted) {
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,

      async signIn(email, password) {
        await signInWithEmail(email, password);
      },

      async signUp(email, password, metadata) {
        return signUpWithEmail(email, password, metadata);
      },

      async logout() {
        await signOut();
      },
    }),
    [session, isLoading],
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