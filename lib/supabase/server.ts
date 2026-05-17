import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const createLocalQuery = () => {
  const query: any = {
    select: () => query,
    eq: () => query,
    order: () => query,
    limit: () => query,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    insert: () => query,
    update: () => query,
    upsert: () => query,
    delete: () => query,
    then: (resolve: (value: { data: null; error: null }) => void) =>
      Promise.resolve({ data: null, error: null }).then(resolve)
  };

  return query;
};

const createLocalClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null })
  },
  from: () => createLocalQuery()
});

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createLocalClient() as any;
  }

  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );
};
