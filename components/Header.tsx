import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/SignOutButton';

export const Header = async () => {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <header className="border-b border-ink-800/10 bg-white/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-ink-900">
          Moment
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-600">
          <Link href="/search" className="hover:text-ink-900">
            Search
          </Link>
          <Link href="/" className="hover:text-ink-900">
            Feed
          </Link>
          <Link href="/settings" className="hover:text-ink-900">
            Settings
          </Link>
        </nav>
        {data.user ? (
          <SignOutButton />
        ) : (
          <Link href="/login" className="button-secondary">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};
