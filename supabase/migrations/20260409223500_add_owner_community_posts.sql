create table if not exists public.owner_community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  pet_name text,
  pet_species text,
  topic text not null default '暮らしメモ',
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint owner_community_posts_author_name_length
    check (char_length(author_name) between 1 and 60),
  constraint owner_community_posts_pet_name_length
    check (pet_name is null or char_length(pet_name) <= 60),
  constraint owner_community_posts_pet_species_length
    check (pet_species is null or char_length(pet_species) <= 40),
  constraint owner_community_posts_topic_length
    check (char_length(topic) between 1 and 40),
  constraint owner_community_posts_body_length
    check (char_length(body) between 1 and 800)
);

create index if not exists owner_community_posts_created_at_idx
  on public.owner_community_posts (created_at desc);

create index if not exists owner_community_posts_user_id_created_at_idx
  on public.owner_community_posts (user_id, created_at desc);

drop trigger if exists set_owner_community_posts_updated_at on public.owner_community_posts;
create trigger set_owner_community_posts_updated_at
before update on public.owner_community_posts
for each row execute procedure public.set_current_timestamp_updated_at();

alter table public.owner_community_posts enable row level security;

drop policy if exists "Authenticated users can view owner community posts" on public.owner_community_posts;
create policy "Authenticated users can view owner community posts"
on public.owner_community_posts
for select
to authenticated
using (true);

drop policy if exists "Users can insert own owner community posts" on public.owner_community_posts;
create policy "Users can insert own owner community posts"
on public.owner_community_posts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own owner community posts" on public.owner_community_posts;
create policy "Users can update own owner community posts"
on public.owner_community_posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own owner community posts" on public.owner_community_posts;
create policy "Users can delete own owner community posts"
on public.owner_community_posts
for delete
to authenticated
using (auth.uid() = user_id);
