'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

function getRedirectTo(formData: FormData) {
  const value = formData.get('callbackUrl');
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/discover';
}

export async function signInWithCredentials(_state: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: getRedirectTo(formData),
    });
  } catch (error) {
    if (error instanceof AuthError) return 'Invalid email or password.';
    throw error;
  }
}

export async function signInWithGoogle(formData: FormData) {
  await signIn('google', { redirectTo: getRedirectTo(formData) });
}
