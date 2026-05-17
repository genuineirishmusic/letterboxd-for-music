import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { LogForm } from '@/components/LogForm';
import { FeedCard } from '@/components/FeedCard';

const getTopTags = (logs: any[]) => {
  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    (log.log_tags ?? []).forEach((tag: { tag: string }) => {
      counts[tag.tag] = (counts[tag.tag] ?? 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);
};

export default async function AlbumPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: album } = await supabase
    .from('music_items')
    .select(
      `
      id,
      title,
      artist,
      year,
      image_url,
      music_links ( id, label, url, type ),
      music_official_content ( id, title, body, url )
    `
    )
    .eq('id', params.id)
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
    .eq('music_item_id', params.id)
    .order('created_at', { ascending: false })
    .limit(12);

  const topTags = getTopTags(logs ?? []);
  const listens = logs?.length ?? 0;

  return (
    <div className="space-y-8">
      <section className="card flex flex-col gap-6 p-6 md:flex-row">
        <div className="relative h-40 w-40 overflow-hidden rounded-2xl bg-ink-800/10">
          {album?.image_url ? (
            <Image src={album.image_url} alt={album.title} fill className="object-cover" />
          ) : null}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-semibold text-ink-900">{album?.title}</h1>
            <p className="text-sm text-ink-500">
              {album?.artist} {album?.year ? `· ${album.year}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-ink-600">
            <span>{listens} listens</span>
            {topTags.length ? (
              <span className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-ink-400">No community vibe yet.</span>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <h2 className="section-title">Community moments</h2>
          <div className="space-y-4">
            {(logs ?? []).length ? (
              (logs ?? []).map((log: any) => <FeedCard key={log.id} log={log} tone="muted" />)
            ) : (
              <div className="card p-6 text-sm text-ink-500">Be the first to log a listen.</div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="section-title">Log a listen</h2>
            <p className="text-sm text-ink-600">
              Capture where you were, what the album meant, and how it felt.
            </p>
          </div>
          <LogForm musicItemId={params.id} />
          {album?.music_links?.length ? (
            <div className="card space-y-3 p-5 text-sm text-ink-600">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                External links
              </p>
              {album.music_links.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  className="block text-ink-900 hover:text-ink-600"
                  target="_blank"
                  rel="noreferrer"
                >
                  ↗ {link.label}
                </a>
              ))}
            </div>
          ) : null}
          {album?.music_official_content?.length ? (
            <div className="card space-y-3 border border-accent-400/40 bg-accent-400/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-500">
                From the artist / label
              </p>
              {album.music_official_content.map((content: any) => (
                <div key={content.id} className="space-y-2">
                  <p className="text-sm font-semibold text-ink-900">{content.title}</p>
                  {content.body ? <p className="text-sm text-ink-600">{content.body}</p> : null}
                  {content.url ? (
                    <a
                      href={content.url}
                      className="text-sm text-accent-500"
                      target="_blank"
                      rel="noreferrer"
                    >
                      ↗ Learn more
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
