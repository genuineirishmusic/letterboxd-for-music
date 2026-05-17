import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { FeedCard } from '@/components/FeedCard';
import { FollowButton } from '@/components/FollowButton';

export default async function ProfilePage({ params }: { params: { handle: string } }) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      `
      id,
      handle,
      display_name,
      avatar_url,
      bio,
      lists ( id, title, description, visibility, pinned )
    `
    )
    .eq('handle', params.handle)
    .single();

  const { data: logs } = await supabase
    .from('logs')
    .select(
      `
      id,
      listened_at,
      rating,
      review_text,
      visibility,
      profiles ( handle, display_name, avatar_url ),
      music_items ( id, title, artist, year, image_url ),
      log_tags ( tag )
    `
    )
    .eq('user_id', profile?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(10);

  const pinnedLists = profile?.lists?.filter((list: any) => list.pinned) ?? [];

  if (!profile) {
    return <div className="card p-6 text-sm text-ink-500">Profile not found.</div>;
  }

  return (
    <div className="space-y-10">
      <section className="card flex flex-col gap-6 p-6 md:flex-row">
        <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-ink-800/10">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.handle} fill className="object-cover" />
          ) : null}
        </div>
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-semibold text-ink-900">
            {profile?.display_name ?? profile?.handle}
          </h1>
          <p className="text-sm text-ink-500">@{profile?.handle}</p>
          {profile?.bio ? <p className="text-sm text-ink-600">{profile.bio}</p> : null}
          <div className="flex gap-2">
            <FollowButton targetUserId={profile.id} />
            <button className="button-ghost">Share profile</button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Pinned lists</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {pinnedLists.length ? (
            pinnedLists.map((list: any) => (
              <Link key={list.id} href={`/list/${list.id}`} className="card p-5">
                <p className="text-sm font-semibold text-ink-900">{list.title}</p>
                <p className="text-xs text-ink-500">{list.description}</p>
              </Link>
            ))
          ) : (
            <div className="card p-5 text-sm text-ink-500">
              No pinned lists yet.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Recent listens</h2>
        <div className="space-y-4">
          {(logs ?? []).length ? (
            (logs ?? []).map((log: any) => <FeedCard key={log.id} log={log} />)
          ) : (
            <div className="card p-5 text-sm text-ink-500">No listens yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
