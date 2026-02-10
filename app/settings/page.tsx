'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VISIBILITY_OPTIONS } from '@/lib/constants';

export default function SettingsPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    handle: '',
    display_name: '',
    avatar_url: '',
    bio: '',
    default_visibility: 'public'
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileData) {
        setProfile({
          handle: profileData.handle ?? '',
          display_name: profileData.display_name ?? '',
          avatar_url: profileData.avatar_url ?? '',
          bio: profileData.bio ?? '',
          default_visibility: profileData.default_visibility ?? 'public'
        });
      }
    };

    loadProfile();
  }, [supabase]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setStatus('Please sign in.');
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: data.user.id,
      handle: profile.handle,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      default_visibility: profile.default_visibility
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus('Saved profile settings.');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-600">Update your profile and diary defaults.</p>
      </div>
      <form onSubmit={handleSave} className="card space-y-4 p-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            handle
          </label>
          <input
            value={profile.handle}
            onChange={(event) => setProfile({ ...profile, handle: event.target.value })}
            className="input"
            placeholder="your-handle"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            display name
          </label>
          <input
            value={profile.display_name}
            onChange={(event) => setProfile({ ...profile, display_name: event.target.value })}
            className="input"
            placeholder="Display name"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            avatar url
          </label>
          <input
            value={profile.avatar_url}
            onChange={(event) => setProfile({ ...profile, avatar_url: event.target.value })}
            className="input"
            placeholder="https://"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
            className="input min-h-[120px]"
            placeholder="Write a short bio."
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            default log visibility
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {VISIBILITY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setProfile({ ...profile, default_visibility: option })}
                className={`tag ${profile.default_visibility === option ? 'bg-ink-900 text-white' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
        <button className="button" type="submit">
          Save settings
        </button>
      </form>
    </div>
  );
}
