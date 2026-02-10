import Image from 'next/image';
import Link from 'next/link';
import { getArtistDetails, upsertAlbumToMusicItems } from '@/lib/music';

export default async function ArtistPage({
  params
}: {
  params: { source: 'spotify' | 'musicbrainz'; source_id: string };
}) {
  const details = await getArtistDetails(params.source, params.source_id);

  if (!details) {
    return <div className="card p-6 text-sm text-ink-500">Artist not found.</div>;
  }

  const albumLinks = await Promise.all(
    details.albums.slice(0, 12).map(async (album) => {
      const musicItemId = await upsertAlbumToMusicItems(album);
      return { ...album, musicItemId };
    })
  );

  return (
    <div className="space-y-8">
      <section className="card flex items-center gap-4 p-6">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-ink-800/10">
          <Image src={details.image_url} alt={details.name} fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{details.name}</h1>
          {details.subtitle ? <p className="text-sm text-ink-500">{details.subtitle}</p> : null}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Albums</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {albumLinks.length ? (
            albumLinks.map((album) => (
              <Link
                key={album.id}
                href={album.musicItemId ? `/album/${album.musicItemId}` : '/search'}
                className="card flex items-center gap-4 p-4"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-ink-800/10">
                  <Image src={album.image_url} alt={album.title} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{album.title}</p>
                  <p className="text-xs text-ink-500">{album.subtitle}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="card p-5 text-sm text-ink-500">No albums found for this artist.</div>
          )}
        </div>
      </section>
    </div>
  );
}
