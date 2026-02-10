import Image from 'next/image';
import Link from 'next/link';
import { getTrackDetails, upsertAlbumToMusicItems } from '@/lib/music';

export default async function TrackPage({
  params
}: {
  params: { source: 'spotify' | 'musicbrainz'; source_id: string };
}) {
  const details = await getTrackDetails(params.source, params.source_id);

  if (!details) {
    return <div className="card p-6 text-sm text-ink-500">Track not found.</div>;
  }

  const albumId = details.album ? await upsertAlbumToMusicItems(details.album) : null;

  return (
    <div className="space-y-8">
      <section className="card flex items-center gap-4 p-6">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-ink-800/10">
          <Image src={details.image_url} alt={details.name} fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{details.name}</h1>
          <p className="text-sm text-ink-500">{details.artist}</p>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title">From album</h2>
        {details.album ? (
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-ink-800/10">
              <Image src={details.album.image_url} alt={details.album.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">{details.album.title}</p>
              <p className="text-xs text-ink-500">{details.album.subtitle}</p>
            </div>
            {albumId ? (
              <Link href={`/album/${albumId}`} className="button-secondary">
                Log album
              </Link>
            ) : (
              <Link href="/search" className="button-secondary">
                Search album
              </Link>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink-500">No linked album metadata available.</p>
        )}
      </section>
    </div>
  );
}
