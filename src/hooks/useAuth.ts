'use client';

import { useSession as useNextAuthSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useNextAuthSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user ?? null;

  const signInWithGoogle = (callbackUrl?: string) => {
    void signIn('google', { callbackUrl: callbackUrl ?? '/discover' });
  };

  const signInWithCredentials = (email: string, password: string, callbackUrl?: string) => {
    void signIn('credentials', {
      email,
      password,
      callbackUrl: callbackUrl ?? '/discover',
    });
  };

  const signOutUser = () => {
    void signOut({ callbackUrl: '/auth/login' });
  };

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    signInWithCredentials,
    signOut: signOutUser,
  };
}
