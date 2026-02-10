import type { User } from '@supabase/supabase-js';

const normalizeHandle = (email: string) => {
  const local = email.split('@')[0] ?? 'listener';
  const cleaned = local.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18);
  return cleaned || 'listener';
};

const makeHandleCandidate = (base: string, attempt: number) => {
  if (attempt === 0) return base;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}${suffix}`.slice(0, 24);
};

export const ensureProfileRow = async (supabase: any, user: User) => {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (existing) return;

  const base = normalizeHandle(user.email ?? 'listener');

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const handle = makeHandleCandidate(base, attempt);
    const { data: handleTaken } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', handle)
      .maybeSingle();

    if (handleTaken) continue;

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      handle,
      display_name: user.user_metadata?.display_name ?? null
    });

    if (!error) return;
  }
};
