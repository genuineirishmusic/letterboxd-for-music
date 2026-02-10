import { createAdminClient } from '@/lib/supabase/admin';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'letterboxd-for-music/0.1 (dev@example.com)';
const PLACEHOLDER_IMAGE = 'https://placehold.co/300x300?text=No+Art';

export type SearchType = 'all' | 'album' | 'artist' | 'track';

export type SearchResult = {
  id: string;
  source: 'spotify' | 'musicbrainz';
  source_id: string;
  type: 'album' | 'artist' | 'track';
  title: string;
  subtitle: string;
  image_url: string;
  year: number | null;
  artist: string | null;
};

export type ArtistDetails = {
  name: string;
  subtitle?: string;
  image_url: string;
  albums: SearchResult[];
};

export type TrackDetails = {
  name: string;
  artist: string;
  album: SearchResult | null;
  image_url: string;
};

const asImage = (url?: string | null) => url ?? PLACEHOLDER_IMAGE;

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
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
    next: { revalidate: 1800 }
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
};

const spotifySearchTypeParam = (type: SearchType) =>
  type === 'all' ? 'album,artist,track' : type;

const mapSpotifyAlbums = (albums: any[]): SearchResult[] =>
  albums.map((item) => ({
    id: `spotify-album-${item.id}`,
    source: 'spotify' as const,
    source_id: item.id,
    type: 'album' as const,
    title: item.name,
    subtitle: item.artists?.map((artist: any) => artist.name).join(', ') ?? 'Unknown artist',
    image_url: asImage(item.images?.[0]?.url),
    year: item.release_date ? Number(item.release_date.slice(0, 4)) : null,
    artist: item.artists?.[0]?.name ?? null
  }));

const mapSpotifyArtists = (artists: any[]): SearchResult[] =>
  artists.map((item) => ({
    id: `spotify-artist-${item.id}`,
    source: 'spotify' as const,
    source_id: item.id,
    type: 'artist' as const,
    title: item.name,
    subtitle: item.genres?.length ? item.genres.slice(0, 2).join(' · ') : 'Artist',
    image_url: asImage(item.images?.[0]?.url),
    year: null,
    artist: null
  }));

const mapSpotifyTracks = (tracks: any[]): SearchResult[] =>
  tracks.map((item) => ({
    id: `spotify-track-${item.id}`,
    source: 'spotify' as const,
    source_id: item.id,
    type: 'track' as const,
    title: item.name,
    subtitle: item.artists?.map((artist: any) => artist.name).join(', ') ?? 'Unknown artist',
    image_url: asImage(item.album?.images?.[0]?.url),
    year: item.album?.release_date ? Number(item.album.release_date.slice(0, 4)) : null,
    artist: item.artists?.[0]?.name ?? null
  }));

const searchSpotify = async (query: string, type: SearchType): Promise<SearchResult[]> => {
  const token = await getSpotifyToken();
  if (!token) return [];

  const response = await fetch(
    `${SPOTIFY_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${spotifySearchTypeParam(type)}&limit=8`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 }
    }
  );

  if (!response.ok) return [];
  const data = await response.json();

  const results: SearchResult[] = [];
  if (type === 'all' || type === 'album') results.push(...mapSpotifyAlbums(data.albums?.items ?? []));
  if (type === 'all' || type === 'artist') results.push(...mapSpotifyArtists(data.artists?.items ?? []));
  if (type === 'all' || type === 'track') results.push(...mapSpotifyTracks(data.tracks?.items ?? []));

  return results;
};

const searchMusicBrainzAlbums = async (query: string): Promise<SearchResult[]> => {
  const response = await fetch(
    `${MUSICBRAINZ_BASE_URL}/release-group?query=${encodeURIComponent(query)}&fmt=json&limit=8`,
    { headers: { 'User-Agent': USER_AGENT }, next: { revalidate: 1800 } }
  );
  if (!response.ok) return [];
  const data = await response.json();

  return (data['release-groups'] ?? []).map((group: any) => ({
    id: `musicbrainz-album-${group.id}`,
    source: 'musicbrainz' as const,
    source_id: group.id,
    type: 'album' as const,
    title: group.title,
    subtitle: group['artist-credit']?.map((credit: any) => credit.name).join(', ') ?? 'Unknown artist',
    image_url: asImage(group.id ? `https://coverartarchive.org/release-group/${group.id}/front-250` : null),
    year: group['first-release-date'] ? Number(group['first-release-date'].slice(0, 4)) : null,
    artist: group['artist-credit']?.[0]?.name ?? null
  }));
};

const searchMusicBrainzArtists = async (query: string): Promise<SearchResult[]> => {
  const response = await fetch(
    `${MUSICBRAINZ_BASE_URL}/artist?query=${encodeURIComponent(query)}&fmt=json&limit=8`,
    { headers: { 'User-Agent': USER_AGENT }, next: { revalidate: 1800 } }
  );
  if (!response.ok) return [];
  const data = await response.json();

  return (data.artists ?? []).map((artist: any) => ({
    id: `musicbrainz-artist-${artist.id}`,
    source: 'musicbrainz' as const,
    source_id: artist.id,
    type: 'artist' as const,
    title: artist.name,
    subtitle: [artist.area?.name, artist['life-span']?.begin?.slice(0, 4)].filter(Boolean).join(' · ') ||
      'Artist',
    image_url: PLACEHOLDER_IMAGE,
    year: null,
    artist: null
  }));
};

const searchMusicBrainzTracks = async (query: string): Promise<SearchResult[]> => {
  const response = await fetch(
    `${MUSICBRAINZ_BASE_URL}/recording?query=${encodeURIComponent(query)}&fmt=json&limit=8`,
    { headers: { 'User-Agent': USER_AGENT }, next: { revalidate: 1800 } }
  );
  if (!response.ok) return [];
  const data = await response.json();

  return (data.recordings ?? []).map((recording: any) => {
    const releaseId = recording.releases?.[0]?.id;
    return {
      id: `musicbrainz-track-${recording.id}`,
      source: 'musicbrainz' as const,
      source_id: recording.id,
      type: 'track' as const,
      title: recording.title,
      subtitle:
        recording['artist-credit']?.map((credit: any) => credit.name).join(', ') ?? 'Unknown artist',
      image_url: asImage(releaseId ? `https://coverartarchive.org/release/${releaseId}/front-250` : null),
      year: null,
      artist: recording['artist-credit']?.[0]?.name ?? null
    };
  });
};

const searchMusicBrainz = async (query: string, type: SearchType): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];
  if (type === 'all' || type === 'album') results.push(...(await searchMusicBrainzAlbums(query)));
  if (type === 'all' || type === 'artist') results.push(...(await searchMusicBrainzArtists(query)));
  if (type === 'all' || type === 'track') results.push(...(await searchMusicBrainzTracks(query)));
  return results;
};

export const searchMusic = async (query: string, type: SearchType): Promise<SearchResult[]> => {
  const spotifyResults = await searchSpotify(query, type);
  if (spotifyResults.length) return spotifyResults;
  return searchMusicBrainz(query, type);
};

export const upsertAlbumToMusicItems = async (album: SearchResult) => {
  const admin = createAdminClient();
  const { data } = await admin
    .from('music_items')
    .upsert(
      {
        source: album.source,
        source_id: album.source_id,
        type: 'album',
        title: album.title,
        artist: album.subtitle,
        year: album.year,
        image_url: album.image_url
      },
      { onConflict: 'source,source_id' }
    )
    .select('id')
    .single();

  return data?.id ?? null;
};

export const getArtistDetails = async (
  source: 'spotify' | 'musicbrainz',
  sourceId: string
): Promise<ArtistDetails | null> => {
  if (source === 'spotify') {
    const token = await getSpotifyToken();
    if (!token) return null;

    const [artistResponse, albumsResponse] = await Promise.all([
      fetch(`${SPOTIFY_BASE_URL}/artists/${sourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 900 }
      }),
      fetch(
        `${SPOTIFY_BASE_URL}/artists/${sourceId}/albums?include_groups=album,single&market=US&limit=12`,
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 900 }
        }
      )
    ]);

    if (!artistResponse.ok || !albumsResponse.ok) return null;
    const artist = await artistResponse.json();
    const albums = await albumsResponse.json();

    return {
      name: artist.name,
      subtitle: artist.genres?.slice(0, 2).join(' · ') || undefined,
      image_url: asImage(artist.images?.[0]?.url),
      albums: mapSpotifyAlbums(albums.items ?? [])
    };
  }

  const [artistResponse, albumsResponse] = await Promise.all([
    fetch(`${MUSICBRAINZ_BASE_URL}/artist/${sourceId}?fmt=json`, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 900 }
    }),
    fetch(
      `${MUSICBRAINZ_BASE_URL}/release-group?query=${encodeURIComponent(`arid:${sourceId} AND primarytype:album`)}&fmt=json&limit=12`,
      {
        headers: { 'User-Agent': USER_AGENT },
        next: { revalidate: 900 }
      }
    )
  ]);

  if (!artistResponse.ok || !albumsResponse.ok) return null;
  const artist = await artistResponse.json();
  const albums = await albumsResponse.json();

  return {
    name: artist.name,
    subtitle: artist.area?.name,
    image_url: PLACEHOLDER_IMAGE,
    albums: (albums['release-groups'] ?? []).map((group: any) => ({
      id: `musicbrainz-album-${group.id}`,
      source: 'musicbrainz' as const,
      source_id: group.id,
      type: 'album' as const,
      title: group.title,
      subtitle: artist.name,
      image_url: asImage(`https://coverartarchive.org/release-group/${group.id}/front-250`),
      year: group['first-release-date'] ? Number(group['first-release-date'].slice(0, 4)) : null,
      artist: artist.name
    }))
  };
};

export const getTrackDetails = async (
  source: 'spotify' | 'musicbrainz',
  sourceId: string
): Promise<TrackDetails | null> => {
  if (source === 'spotify') {
    const token = await getSpotifyToken();
    if (!token) return null;

    const response = await fetch(`${SPOTIFY_BASE_URL}/tracks/${sourceId}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 900 }
    });
    if (!response.ok) return null;

    const track = await response.json();
    return {
      name: track.name,
      artist: track.artists?.map((artist: any) => artist.name).join(', ') ?? 'Unknown artist',
      image_url: asImage(track.album?.images?.[0]?.url),
      album: track.album
        ? {
            id: `spotify-album-${track.album.id}`,
            source: 'spotify',
            source_id: track.album.id,
            type: 'album',
            title: track.album.name,
            subtitle: track.artists?.map((artist: any) => artist.name).join(', ') ?? 'Unknown artist',
            image_url: asImage(track.album.images?.[0]?.url),
            year: track.album.release_date ? Number(track.album.release_date.slice(0, 4)) : null,
            artist: track.artists?.[0]?.name ?? null
          }
        : null
    };
  }

  const response = await fetch(
    `${MUSICBRAINZ_BASE_URL}/recording/${sourceId}?inc=artists+releases&fmt=json`,
    {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 900 }
    }
  );
  if (!response.ok) return null;
  const track = await response.json();

  const release = track.releases?.[0];
  return {
    name: track.title,
    artist: track['artist-credit']?.map((credit: any) => credit.name).join(', ') ?? 'Unknown artist',
    image_url: asImage(release?.id ? `https://coverartarchive.org/release/${release.id}/front-250` : null),
    album: release
      ? {
          id: `musicbrainz-album-${release['release-group']?.id ?? release.id}`,
          source: 'musicbrainz',
          source_id: release['release-group']?.id ?? release.id,
          type: 'album',
          title: release.title,
          subtitle: track['artist-credit']?.map((credit: any) => credit.name).join(', ') ?? 'Unknown artist',
          image_url: asImage(`https://coverartarchive.org/release/${release.id}/front-250`),
          year: release.date ? Number(release.date.slice(0, 4)) : null,
          artist: track['artist-credit']?.[0]?.name ?? null
        }
      : null
  };
};
