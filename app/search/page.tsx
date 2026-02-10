'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type SearchType = 'all' | 'album' | 'artist' | 'track';

type Result = {
  id: string;
  source: 'spotify' | 'musicbrainz';
  source_id: string;
  type: 'album' | 'artist' | 'track';
  title: string;
  subtitle: string;
  image_url: string;
};

const FILTERS: { id: SearchType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'album', label: 'Albums' },
  { id: 'artist', label: 'Artists' },
  { id: 'track', label: 'Tracks' }
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<SearchType>('all');
  const router = useRouter();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(filter)}`
    );
    const data = await response.json();
    setResults(data.results ?? []);
    setLoading(false);
  };

  const openResult = async (item: Result) => {
    if (item.type === 'album') {
      const response = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: item.source,
          source_id: item.source_id,
          title: item.title,
          artist: item.subtitle,
          year: null,
          image_url: item.image_url
        })
      });
      const data = await response.json();
      if (data.id) router.push(`/album/${data.id}`);
      return;
    }

    if (item.type === 'artist') {
      router.push(`/artist/${item.source}/${item.source_id}`);
      return;
    }

    router.push(`/track/${item.source}/${item.source_id}`);
  };

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h1 className="text-2xl font-semibold text-ink-900">Search music</h1>
        <p className="text-sm text-ink-600">
          One search box for songs, albums, and artists. Find it, then log the moment.
        </p>
        <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search songs, albums, or artists"
            className="input"
          />
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`tag ${filter === item.id ? 'bg-ink-900 text-white' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div>
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </section>
      <section className="space-y-4">
        {results.map((item) => (
          <button
            key={item.id}
            onClick={() => openResult(item)}
            className="card flex w-full items-center gap-4 p-4 text-left"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-ink-800/10">
              <Image src={item.image_url} alt={item.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="mb-1">
                <span className="rounded-full bg-ink-800/5 px-2 py-1 text-[10px] uppercase tracking-wide text-ink-500">
                  {item.type}
                </span>
              </div>
              <p className="text-base font-semibold text-ink-900">{item.title}</p>
              <p className="text-sm text-ink-500">{item.subtitle}</p>
            </div>
            <span className="text-xs text-ink-500">{item.type === 'album' ? 'Log' : 'View'}</span>
          </button>
        ))}
        {!results.length && !loading ? (
          <div className="card p-6 text-sm text-ink-500">
            Start with any song, album, or artist to discover and log your next moment.
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
