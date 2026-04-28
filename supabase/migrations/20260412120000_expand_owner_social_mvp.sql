alter table public.profiles
  add column if not exists username text,
  add column if not exists bio text,
  add column if not exists pet_name text,
  add column if not exists pet_species text,
  add column if not exists avatar_url text,
  add column if not exists is_pet_owner boolean not null default false;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

alter table public.profiles
  drop constraint if exists profiles_username_length,
  drop constraint if exists profiles_bio_length,
  drop constraint if exists profiles_pet_name_length,
  drop constraint if exists profiles_pet_species_length;

alter table public.profiles
  add constraint profiles_username_length
    check (username is null or char_length(username) between 3 and 24),
  add constraint profiles_bio_length
    check (bio is null or char_length(bio) <= 240),
  add constraint profiles_pet_name_length
    check (pet_name is null or char_length(pet_name) <= 60),
  add constraint profiles_pet_species_length
    check (pet_species is null or char_length(pet_species) <= 40);

alter table public.owner_community_posts
  add column if not exists image_path text,
  add column if not exists image_mime_type text;

alter table public.owner_community_posts
  drop constraint if exists owner_community_posts_image_path_length,
  drop constraint if exists owner_community_posts_image_mime_type_length;

alter table public.owner_community_posts
  add constraint owner_community_posts_image_path_length
    check (image_path is null or char_length(image_path) <= 255),
  add constraint owner_community_posts_image_mime_type_length
    check (image_mime_type is null or char_length(image_mime_type) <= 120);

create table if not exists public.community_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.owner_community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint community_post_likes_unique_per_user unique (post_id, user_id)
);

create index if not exists community_post_likes_post_id_idx
  on public.community_post_likes (post_id, created_at desc);

create index if not exists community_post_likes_user_id_idx
  on public.community_post_likes (user_id, created_at desc);

create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.owner_community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint community_post_comments_author_name_length
    check (char_length(author_name) between 1 and 60),
  constraint community_post_comments_body_length
    check (char_length(body) between 1 and 400)
);

create index if not exists community_post_comments_post_id_idx
  on public.community_post_comments (post_id, created_at asc);

create index if not exists community_post_comments_user_id_idx
  on public.community_post_comments (user_id, created_at desc);

drop trigger if exists set_community_post_comments_updated_at on public.community_post_comments;
create trigger set_community_post_comments_updated_at
before update on public.community_post_comments
for each row execute procedure public.set_current_timestamp_updated_at();

alter table public.community_post_likes enable row level security;
alter table public.community_post_comments enable row level security;

drop policy if exists "Authenticated users can view community post likes" on public.community_post_likes;
create policy "Authenticated users can view community post likes"
on public.community_post_likes
for select
to authenticated
using (true);

drop policy if exists "Users can insert own community post likes" on public.community_post_likes;
create policy "Users can insert own community post likes"
on public.community_post_likes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own community post likes" on public.community_post_likes;
create policy "Users can delete own community post likes"
on public.community_post_likes
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can view community post comments" on public.community_post_comments;
create policy "Authenticated users can view community post comments"
on public.community_post_comments
for select
to authenticated
using (true);

drop policy if exists "Users can insert own community post comments" on public.community_post_comments;
create policy "Users can insert own community post comments"
on public.community_post_comments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own community post comments" on public.community_post_comments;
create policy "Users can update own community post comments"
on public.community_post_comments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own community post comments" on public.community_post_comments;
create policy "Users can delete own community post comments"
on public.community_post_comments
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-media',
  'community-media',
  false,
  2621440,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
