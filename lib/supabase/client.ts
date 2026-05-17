import { createBrowserClient } from '@supabase/ssr';

const createLocalQuery = () => {
  const query: any = {
    select: () => query,
    eq: () => query,
    single: async () => ({ data: null, error: null }),
    upsert: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null })
  };

  return query;
};

const createLocalClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase is not configured for this local app.' } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase is not configured for this local app.' } }),
    signOut: async () => ({ error: null })
  },
  from: () => createLocalQuery()
});

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createLocalClient() as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};
