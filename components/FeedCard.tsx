import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

type Tag = { tag: string };

type FeedCardProps = {
  log: {
    id: string;
    listened_at: string;
    rating: number | null;
    review_text: string | null;
    visibility?: string;
    profiles:
      | {
          handle: string;
          display_name: string | null;
          avatar_url: string | null;
        }
      | {
          handle: string;
          display_name: string | null;
          avatar_url: string | null;
        }[]
      | null;
    music_items:
      | {
          id: string;
          title: string;
          artist: string;
          year: number | null;
          image_url: string | null;
        }
      | {
          id: string;
          title: string;
          artist: string;
          year: number | null;
          image_url: string | null;
        }[]
      | null;
    log_tags?: Tag[];
  };
  tone?: 'default' | 'muted';
};

export const FeedCard = ({ log, tone = 'default' }: FeedCardProps) => {
  const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
  const musicItem = Array.isArray(log.music_items) ? log.music_items[0] : log.music_items;

  return (
    <article
      className={clsx(
        'card flex flex-col gap-4 p-5 md:flex-row',
        tone === 'muted' && 'bg-ink-800/5'
      )}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-800/10">
        {musicItem?.image_url ? (
          <Image
            src={musicItem.image_url}
            alt={musicItem.title}
            fill
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-ink-500">
            <Link href={`/u/${profile?.handle ?? ''}`} className="font-semibold text-ink-900">
              {profile?.display_name ?? profile?.handle ?? 'Unknown'}
            </Link>{' '}
            listened{' '}
            <span className="text-ink-600">
              {new Date(log.listened_at).toLocaleDateString()}
            </span>
          </div>
          {log.rating !== null ? (
            <span className="rounded-full bg-ink-900 px-2.5 py-1 text-xs font-semibold text-white">
              {log.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
        <div>
          <Link href={`/album/${musicItem?.id ?? ''}`} className="text-lg font-semibold">
            {musicItem?.title}
          </Link>
          <p className="text-sm text-ink-500">
            {musicItem?.artist} {musicItem?.year ? `· ${musicItem.year}` : ''}
          </p>
        </div>
        {log.log_tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {log.log_tags.map((tag) => (
              <span key={tag.tag} className="tag">
                {tag.tag}
              </span>
            ))}
          </div>
        ) : null}
        {log.review_text ? (
          <p className="text-sm text-ink-700">
            {log.review_text.length > 140
              ? `${log.review_text.slice(0, 140)}...`
              : log.review_text}
          </p>
        ) : null}
      </div>
    </article>
  );
};
