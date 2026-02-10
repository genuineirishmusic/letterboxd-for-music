'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ensureProfileRow } from '@/lib/profile';

export const AuthForm = () => {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoadingSignIn(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoadingSignIn(false);
      return;
    }

    if (data.user) {
      await ensureProfileRow(supabase, data.user);
    }

    setLoadingSignIn(false);
    router.push('/');
    router.refresh();
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoadingSignUp(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoadingSignUp(false);
      return;
    }

    if (data.user && data.session) {
      await ensureProfileRow(supabase, data.user);
      setLoadingSignUp(false);
      router.push('/');
      router.refresh();
      return;
    }

    setMessage('Check your email to confirm');
    setLoadingSignUp(false);
  };

  return (
    <div className="card flex-1 space-y-6 p-6">
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Email</label>
          <input
            name="email"
            type="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Password</label>
          <input
            name="password"
            type="password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button className="button w-full" type="submit" disabled={loadingSignIn || loadingSignUp}>
          {loadingSignIn ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="border-t border-ink-800/10 pt-6">
        <p className="text-xs text-ink-500">New here?</p>
        <form onSubmit={handleSignUp} className="mt-3 space-y-3">
          <button
            className="button-secondary w-full"
            type="submit"
            disabled={loadingSignIn || loadingSignUp}
          >
            {loadingSignUp ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-ink-600">{message}</p> : null}
    </div>
  );
};
