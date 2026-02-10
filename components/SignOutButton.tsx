'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const SignOutButton = () => {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push('/login');
    router.refresh();
  };

  return (
    <button type="button" onClick={handleSignOut} className="button-secondary" disabled={loading}>
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  );
};
