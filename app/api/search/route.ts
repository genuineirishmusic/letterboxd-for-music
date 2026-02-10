import { NextResponse } from 'next/server';
import { searchMusic, type SearchType } from '@/lib/music';

const isSearchType = (value: string): value is SearchType =>
  ['all', 'album', 'artist', 'track'].includes(value);

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const rawType = searchParams.get('type') ?? 'all';
  const type: SearchType = isSearchType(rawType) ? rawType : 'all';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchMusic(query, type);
  return NextResponse.json({ results });
};
