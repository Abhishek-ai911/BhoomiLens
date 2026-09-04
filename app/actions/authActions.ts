'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Server action to securely authenticate an officer via Supabase Auth.
 * Sets the authentication session cookies strictly on the server.
 */
export async function loginOfficerAction(formData: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const { email, password } = formData;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { success: false, error: 'Please provide a valid government or authorized officer email address.' };
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return { success: false, error: 'Password is required to authenticate.' };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Invalid officer credentials. Please verify your email and password.',
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: 'Unable to establish an officer session. Please try again.',
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  } catch (err: any) {
    console.error('Officer login error:', err);
    return {
      success: false,
      error: err?.message || 'An unexpected authentication error occurred.',
    };
  }
}

/**
 * Server action to log out an officer and clear their session.
 */
export async function logoutOfficerAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Officer logout error:', err);
  }
  redirect('/login');
}
