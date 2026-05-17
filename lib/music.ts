const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_SEARCH_URL = 'https://api.spotify.com/v1/search';
const MUSICBRAINZ_SEARCH_URL = 'https://musicbrainz.org/ws/2/release-group/';

export type AlbumResult = {
  source: 'spotify' | 'musicbrainz';
  source_id: string;
  title: string;
  artist: string;
  year: number | null;
  image_url: string | null;
};

const getSpotifyToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' })
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
};

const searchSpotify = async (query: string): Promise<AlbumResult[]> => {
  const token = await getSpotifyToken();
  if (!token) return [];

  const response = await fetch(
    `${SPOTIFY_SEARCH_URL}?type=album&q=${encodeURIComponent(query)}&limit=8`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      next: { revalidate: 300 }
    }
  );

  if (!response.ok) return [];
  const data = await response.json();
  return (data.albums?.items ?? []).map((item: any) => ({
    source: 'spotify',
    source_id: item.id,
    title: item.name,
    artist: item.artists?.map((artist: any) => artist.name).join(', ') ?? 'Unknown',
    year: item.release_date ? Number(item.release_date.slice(0, 4)) : null,
    image_url: item.images?.[0]?.url ?? null
  }));
};

const searchMusicBrainz = async (query: string): Promise<AlbumResult[]> => {
  const response = await fetch(
    `${MUSICBRAINZ_SEARCH_URL}?query=${encodeURIComponent(query)}&fmt=json&limit=8`,
    {
      headers: {
        'User-Agent': 'letterboxd-for-music/0.1 (dev@example.com)'
      },
      next: { revalidate: 3600 }
    }
  );

  if (!response.ok) return [];
  const data = await response.json();
  return (data['release-groups'] ?? []).map((group: any) => ({
    source: 'musicbrainz',
    source_id: group.id,
    title: group.title,
    artist: group['artist-credit']?.map((credit: any) => credit.name).join(', ') ?? 'Unknown',
    year: group['first-release-date'] ? Number(group['first-release-date'].slice(0, 4)) : null,
    image_url: group.id
      ? `https://coverartarchive.org/release-group/${group.id}/front-250`
      : null
  }));
};

export const searchAlbums = async (query: string): Promise<AlbumResult[]> => {
  const spotifyResults = await searchSpotify(query);
  if (spotifyResults.length > 0) return spotifyResults;
  return searchMusicBrainz(query);
};

export type LinkedAlbum = Omit<AlbumResult, 'image_url'> & {
  id: string;
  subtitle: string;
  image_url: string;
};

export type ArtistDetails = {
  name: string;
  subtitle: string | null;
  image_url: string;
  albums: LinkedAlbum[];
};

export type TrackDetails = {
  name: string;
  artist: string;
  image_url: string;
  album: LinkedAlbum | null;
};

const placeholderImage = 'https://placehold.co/300x300/png?text=Music';

export const getArtistDetails = async (
  source: 'spotify' | 'musicbrainz',
  sourceId: string
): Promise<ArtistDetails | null> => {
  return {
    name: sourceId,
    subtitle: `Imported from ${source}`,
    image_url: placeholderImage,
    albums: []
  };
};

export const getTrackDetails = async (
  source: 'spotify' | 'musicbrainz',
  sourceId: string
): Promise<TrackDetails | null> => {
  return {
    name: sourceId,
    artist: `Imported from ${source}`,
    image_url: placeholderImage,
    album: null
  };
};

export const upsertAlbumToMusicItems = async (album: LinkedAlbum | AlbumResult) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('music_items')
    .upsert(
      {
        title: album.title,
        artist: album.artist,
        year: album.year,
        image_url: album.image_url
      },
      { onConflict: 'title,artist' }
    )
    .select('id')
    .single();

  return data?.id ?? null;
};
