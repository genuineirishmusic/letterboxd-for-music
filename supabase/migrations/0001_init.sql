create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  handle text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  default_visibility text default 'public',
  support_badge_enabled boolean default false,
  created_at timestamptz default now()
);

create table if not exists follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (follower_id, following_id)
);

create table if not exists music_items (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  type text not null default 'album',
  title text not null,
  artist text,
  year int,
  image_url text,
  created_at timestamptz default now(),
  unique (source, source_id)
);

create table if not exists music_links (
  id uuid primary key default gen_random_uuid(),
  music_item_id uuid references music_items(id) on delete cascade,
  label text not null,
  url text not null,
  type text not null,
  created_at timestamptz default now()
);

create table if not exists music_official_content (
  id uuid primary key default gen_random_uuid(),
  music_item_id uuid references music_items(id) on delete cascade,
  title text not null,
  body text,
  url text,
  created_at timestamptz default now()
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  music_item_id uuid references music_items(id) on delete cascade,
  listened_at timestamptz default now(),
  rating numeric,
  review_text text,
  visibility text default 'public',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint rating_range check (rating is null or (rating >= 0 and rating <= 5))
);

create table if not exists log_tags (
  id uuid primary key default gen_random_uuid(),
  log_id uuid references logs(id) on delete cascade,
  tag text not null,
  created_at timestamptz default now()
);

create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  visibility text default 'public',
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade,
  music_item_id uuid references music_items(id) on delete cascade,
  note text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists reactions (
  user_id uuid references profiles(id) on delete cascade,
  log_id uuid references logs(id) on delete cascade,
  reaction text check (reaction in ('fire', 'heartbreak', 'woozy')),
  created_at timestamptz default now(),
  unique (user_id, log_id)
);

create index if not exists logs_user_created_idx on logs (user_id, created_at desc);
create index if not exists logs_music_created_idx on logs (music_item_id, created_at desc);
create index if not exists follows_follower_idx on follows (follower_id);
create index if not exists follows_following_idx on follows (following_id);
create index if not exists list_items_sort_idx on list_items (list_id, sort_order);
create index if not exists log_tags_log_idx on log_tags (log_id);
create index if not exists log_tags_tag_idx on log_tags (tag);

alter table profiles enable row level security;
alter table follows enable row level security;
alter table music_items enable row level security;
alter table logs enable row level security;
alter table log_tags enable row level security;
alter table lists enable row level security;
alter table list_items enable row level security;
alter table reactions enable row level security;
alter table music_links enable row level security;
alter table music_official_content enable row level security;

create policy "Profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Profiles can be inserted by owner" on profiles
  for insert with check (auth.uid() = id);

create policy "Profiles can be updated by owner" on profiles
  for update using (auth.uid() = id);

create policy "Follows are viewable by everyone" on follows
  for select using (true);

create policy "Follows can be created by follower" on follows
  for insert with check (auth.uid() = follower_id);

create policy "Follows can be removed by follower" on follows
  for delete using (auth.uid() = follower_id);

create policy "Music items are viewable by everyone" on music_items
  for select using (true);

create policy "Logs readable by visibility" on logs
  for select using (
    visibility = 'public'
    or (visibility = 'followers' and exists (
      select 1 from follows f
      where f.following_id = logs.user_id
        and f.follower_id = auth.uid()
    ))
    or (visibility = 'private' and auth.uid() = logs.user_id)
  );

create policy "Logs insertable by owner" on logs
  for insert with check (auth.uid() = user_id);

create policy "Logs updatable by owner" on logs
  for update using (auth.uid() = user_id);

create policy "Logs deletable by owner" on logs
  for delete using (auth.uid() = user_id);

create policy "Log tags readable with log" on log_tags
  for select using (
    exists (
      select 1 from logs l
      where l.id = log_tags.log_id
        and (
          l.visibility = 'public'
          or (l.visibility = 'followers' and exists (
            select 1 from follows f
            where f.following_id = l.user_id
              and f.follower_id = auth.uid()
          ))
          or (l.visibility = 'private' and l.user_id = auth.uid())
        )
    )
  );

create policy "Log tags insertable by log owner" on log_tags
  for insert with check (
    exists (
      select 1 from logs l
      where l.id = log_tags.log_id and l.user_id = auth.uid()
    )
  );

create policy "Lists readable by visibility" on lists
  for select using (
    visibility = 'public'
    or (visibility = 'followers' and exists (
      select 1 from follows f
      where f.following_id = lists.user_id
        and f.follower_id = auth.uid()
    ))
    or (visibility = 'private' and auth.uid() = lists.user_id)
  );

create policy "Lists insertable by owner" on lists
  for insert with check (auth.uid() = user_id);

create policy "Lists updatable by owner" on lists
  for update using (auth.uid() = user_id);

create policy "Lists deletable by owner" on lists
  for delete using (auth.uid() = user_id);

create policy "List items readable by list visibility" on list_items
  for select using (
    exists (
      select 1 from lists l
      where l.id = list_items.list_id
        and (
          l.visibility = 'public'
          or (l.visibility = 'followers' and exists (
            select 1 from follows f
            where f.following_id = l.user_id
              and f.follower_id = auth.uid()
          ))
          or (l.visibility = 'private' and l.user_id = auth.uid())
        )
    )
  );

create policy "List items insertable by owner" on list_items
  for insert with check (
    exists (
      select 1 from lists l
      where l.id = list_items.list_id and l.user_id = auth.uid()
    )
  );

create policy "List items updatable by owner" on list_items
  for update using (
    exists (
      select 1 from lists l
      where l.id = list_items.list_id and l.user_id = auth.uid()
    )
  );

create policy "List items deletable by owner" on list_items
  for delete using (
    exists (
      select 1 from lists l
      where l.id = list_items.list_id and l.user_id = auth.uid()
    )
  );

create policy "Reactions readable with log" on reactions
  for select using (
    exists (
      select 1 from logs l
      where l.id = reactions.log_id
        and (
          l.visibility = 'public'
          or (l.visibility = 'followers' and exists (
            select 1 from follows f
            where f.following_id = l.user_id
              and f.follower_id = auth.uid()
          ))
          or (l.visibility = 'private' and l.user_id = auth.uid())
        )
    )
  );

create policy "Reactions insertable by owner" on reactions
  for insert with check (auth.uid() = user_id);

create policy "Reactions deletable by owner" on reactions
  for delete using (auth.uid() = user_id);

create policy "Music links readable" on music_links
  for select using (true);

create policy "Music official content readable" on music_official_content
  for select using (true);
