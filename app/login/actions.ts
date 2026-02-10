'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const signIn = async (formData: FormData) => {
  const supabase = createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  redirect('/');
};

export const signUp = async (formData: FormData) => {
  const supabase = createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: error.message };
  }

  redirect('/settings');
};
