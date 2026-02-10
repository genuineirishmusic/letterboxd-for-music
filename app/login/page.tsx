import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { createClient } from '@/lib/supabase/server';

export default async function LoginPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect('/');
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 lg:flex-row">
      <div className="flex-1 space-y-4">
        <p className="text-sm uppercase tracking-wide text-ink-500">Welcome</p>
        <h1 className="text-3xl font-semibold text-ink-900">Sign in to your listening diary</h1>
        <p className="text-sm text-ink-600">
          Build a timeline of moments, not just ratings. Use email + password to sign in or create
          your account.
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
