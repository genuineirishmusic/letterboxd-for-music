import { createClient } from '@/lib/supabase/server';
import { FeedSection } from '@/components/FeedSection';

export default async function FeedPage() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

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
    .order('created_at', { ascending: false })
    .limit(30);

  const feedLogs = logs ?? [];

  return (
    <div className="space-y-10">
      <section className="card p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-ink-500">Diary</p>
            <h1 className="text-3xl font-semibold text-ink-900">
              {user?.user ? 'Welcome back' : 'Start your listening diary'}
            </h1>
            <p className="mt-2 text-sm text-ink-600">
              Logging a listen is the hero action — capture the moment, not just the score.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/search" className="button">
              Log a listen
            </a>
            <a href="/search" className="button-secondary">
              Find albums
            </a>
          </div>
        </div>
      </section>
      <FeedSection logs={feedLogs} />
    </div>
  );
}
