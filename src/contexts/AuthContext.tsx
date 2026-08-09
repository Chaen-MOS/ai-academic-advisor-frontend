import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Linking} from 'react-native';
import type {
  AuthResponse,
  Session,
  User,
} from '@supabase/supabase-js';

import {supabase} from '../config/supabase';

import {
  getCurrentSession,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '../services/auth/authService';

import {
  getCurrentUserRole,
  type UserRole,
} from '../services/auth/roleService';

type SignUpMetadata = {
  username: string;
  mobileNumber: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;

  isLoading: boolean;

  role: UserRole | null;
  isRoleLoading: boolean;

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

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [role, setRole] =
    useState<UserRole | null>(null);

  const [
    isRoleLoading,
    setIsRoleLoading,
  ] = useState(false);

  const [
    isPasswordRecovery,
    setIsPasswordRecovery,
  ] = useState(false);

  /*
   * Restore Supabase session
   * Listen for auth state changes
   * Handle password recovery deep links
   */
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

        /*
         * Mark recovery BEFORE creating
         * the temporary Supabase session.
         *
         * This prevents normal authenticated
         * screens from briefly rendering.
         */
        if (isMounted) {
          setIsPasswordRecovery(true);
          setIsLoading(false);
        }

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

        console.log(
          'Password recovery session established.',
        );
      } catch (error) {
        console.error(
          'Failed to establish recovery session:',
          error,
        );

        if (isMounted) {
          setIsPasswordRecovery(false);
        }
      }
    }

    void restoreSession();

    void Linking.getInitialURL().then(
      url => {
        void handleRecoveryUrl(url);
      },
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

          console.log(
            'TEST ACCESS TOKEN:',
            nextSession?.access_token,
          );

          if (!isMounted) {
            return;
          }

          setSession(nextSession);
          setIsLoading(false);

          if (
            event ===
            'PASSWORD_RECOVERY'
          ) {
            setIsPasswordRecovery(
              true,
            );
          }

          if (
            event === 'SIGNED_OUT'
          ) {
            setRole(null);
            setIsPasswordRecovery(
              false,
            );
          }
        },
      );

    return () => {
      isMounted = false;

      linkingSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Load RBAC role whenever a normal
   * authenticated session exists.
   *
   * Password recovery sessions should
   * NOT load the normal user role.
   */
  useEffect(() => {
    let isMounted = true;

    async function loadUserRole() {
      if (
        !session ||
        isPasswordRecovery
      ) {
        if (!session) {
          setRole(null);
        }

        return;
      }

      try {
        setIsRoleLoading(true);

        const currentRole =
          await getCurrentUserRole();

        if (!isMounted) {
          return;
        }

        setRole(currentRole);

        console.log(
          'CURRENT USER ROLE:',
          currentRole,
        );
      } catch (error) {
        console.error(
          'Failed to load user role:',
          error,
        );

        if (isMounted) {
          setRole(null);
        }
      } finally {
        if (isMounted) {
          setIsRoleLoading(false);
        }
      }
    }

    void loadUserRole();

    return () => {
      isMounted = false;
    };
  }, [
    session,
    isPasswordRecovery,
  ]);

  const value =
    useMemo<AuthContextValue>(
      () => ({
        session,

        user:
          session?.user ?? null,

        isLoading,

        role,
        isRoleLoading,

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
          setRole(null);

          setIsPasswordRecovery(
            false,
          );

          await signOut();
        },
      }),
      [
        session,
        isLoading,
        role,
        isRoleLoading,
        isPasswordRecovery,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth():
AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.',
    );
  }

  return context;
}