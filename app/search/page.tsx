'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Result = {
  source: 'spotify' | 'musicbrainz';
  source_id: string;
  title: string;
  artist: string;
  year: number | null;
  image_url: string | null;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setResults(data.results ?? []);
    setLoading(false);
  };

  const openAlbum = async (album: Result) => {
    const response = await fetch('/api/music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(album)
    });
    const data = await response.json();
    if (data.id) {
      router.push(`/album/${data.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h1 className="text-2xl font-semibold text-ink-900">Search albums</h1>
        <p className="text-sm text-ink-600">
          Find the record, then log the moment. We search Spotify if configured, otherwise
          MusicBrainz.
        </p>
        <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by album or artist"
            className="input flex-1"
          />
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </section>
      <section className="space-y-4">
        {results.map((album) => (
          <button
            key={`${album.source}-${album.source_id}`}
            onClick={() => openAlbum(album)}
            className="card flex w-full items-center gap-4 p-4 text-left"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-ink-800/10">
              {album.image_url ? (
                <Image src={album.image_url} alt={album.title} fill className="object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-ink-900">{album.title}</p>
              <p className="text-sm text-ink-500">
                {album.artist} {album.year ? `· ${album.year}` : ''}
              </p>
            </div>
            <span className="text-xs text-ink-500">Log</span>
          </button>
        ))}
        {!results.length && !loading ? (
          <div className="card p-6 text-sm text-ink-500">
            Try searching for a favorite record to start your diary.
          </div>
        ) : null}
      </section>
      <section className="border-t border-ink-800/10 pt-8">
        <div className="rounded-2xl border border-dashed border-ink-800/20 px-4 py-6 text-sm text-ink-400">
          Reserved for future editorial or sponsorship content.
        </div>
      </section>
    </div>
  );
}
