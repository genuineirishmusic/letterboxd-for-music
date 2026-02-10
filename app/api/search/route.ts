import { NextResponse } from 'next/server';
import { searchAlbums } from '@/lib/music';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchAlbums(query);
  return NextResponse.json({ results });
};
