create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.favorite_names (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  reading text not null default '',
  meaning text,
  species text[] not null default '{}',
  gender text,
  vibe text[] not null default '{}',
  color text[] not null default '{}',
  match_score integer,
  match_label text,
  saved_from_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint favorite_names_unique_per_user unique (user_id, name, reading)
);

create index if not exists favorite_names_user_id_created_at_idx
  on public.favorite_names (user_id, created_at desc);

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_favorite_names_updated_at on public.favorite_names;
create trigger set_favorite_names_updated_at
before update on public.favorite_names
for each row execute procedure public.set_current_timestamp_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.favorite_names enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can view own favorites" on public.favorite_names;
create policy "Users can view own favorites"
on public.favorite_names
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.favorite_names;
create policy "Users can insert own favorites"
on public.favorite_names
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own favorites" on public.favorite_names;
create policy "Users can update own favorites"
on public.favorite_names
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorite_names;
create policy "Users can delete own favorites"
on public.favorite_names
for delete
to authenticated
using (auth.uid() = user_id);
