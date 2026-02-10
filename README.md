# Moment (Letterboxd for Music)

Moment is a context-first listening diary: log the moment, capture the vibe, and share beautiful lists.

## Tech stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + Storage)
- Music metadata: Spotify Web API (client credentials) with MusicBrainz fallback

## Getting started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Create a `.env.local` file from `.env.example`:
```bash
cp .env.example .env.local
```

Populate:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side caching for albums)
- `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` (optional; search falls back to MusicBrainz)

### 3) Supabase setup
1. Create a Supabase project.
2. Run the SQL migration in `supabase/migrations/0001_init.sql` in the SQL editor.
3. Enable email/password auth in Supabase Auth settings.

### 4) Run locally
```bash
npm run dev
```

### 5) Deploy to Vercel
- Add the same environment variables in Vercel.
- Deploy as a standard Next.js app.

## Architecture highlights
- Album search hits `/api/search` and caches albums via `/api/music` (service role only).
- Strict RLS policies enforce visibility and ownership.
- Feed shows only meaningful listen logs, no like spam.
- Monetization foundation is data-only (no UI): external links, official content, and future analytics safe-guards.

## Acceptance checklist
- **Auth + Profiles**
  - [ ] Email/password sign-in works on `/login`.
  - [ ] Edit profile on `/settings`, ensure handle uniqueness.
  - [ ] Public profile at `/u/[handle]` loads.
- **Search + Discovery pages**
  - [ ] `/search` returns albums, artists, and tracks with filter toggle (Spotify if configured, else MusicBrainz).
  - [ ] Clicking an album creates/updates a `music_items` row.
  - [ ] Artist and track pages load live metadata and link to album logging.
- **Search + Album page**
  - [ ] `/search` returns albums (Spotify if configured, else MusicBrainz).
  - [ ] Clicking an album creates/updates a `music_items` row.
  - [ ] Album page shows cover, title, artist, year, and logs.
- **Listen logs (moment-first)**
  - [ ] Log form on album page saves context tags + optional rating + optional review.
  - [ ] Relistens are allowed (multiple logs per album).
  - [ ] Visibility rules are enforced by RLS.
- **Follow + Feed**
  - [ ] Follow/unfollow in `follows` table (RLS protected).
  - [ ] Feed shows new logs only, with filters.
- **Lists**
  - [ ] Create lists + list items in Supabase.
  - [ ] `/list/[id]` renders as a poster-style grid.
- **Monetization foundations (no UI)**
  - [ ] External links and official content tables exist.
  - [ ] Reserved layout slots appear only on Search and List pages.


## Testing auth locally
1. In Supabase dashboard, enable **Email** provider under Authentication > Providers.
2. In Authentication > URL Configuration, set Site URL to `http://localhost:3000`.
3. Start the app with `npm run dev`.
4. Open `/login` and create an account with email + password.
   - If confirmation is enabled, you should see: **"Check your email to confirm"**.
5. Sign in from `/login` after confirmation.
6. Verify header switches to **Sign out** when authenticated and **Sign in** when signed out.
7. Verify a matching `profiles` row exists for the user (`id = auth user id`) with a generated unique `handle`.

## SQL migrations
- `supabase/migrations/0001_init.sql`

## Notes
- Spotify secrets are used only server-side.
- External links + official content are data structures only, disabled by default.
