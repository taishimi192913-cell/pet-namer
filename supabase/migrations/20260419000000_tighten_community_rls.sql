-- H2: Tighten RLS select policies on owner community tables.
-- Prior policies allowed any authenticated user to read every post, like, and
-- comment. Restrict select to profiles flagged as pet owners (is_pet_owner = true)
-- to match product intent and prevent data exposure to non-owner accounts.

drop policy if exists "Authenticated users can view owner community posts"
  on public.owner_community_posts;
create policy "Pet owners can view owner community posts"
on public.owner_community_posts
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_pet_owner = true
  )
);

drop policy if exists "Authenticated users can view community post likes"
  on public.community_post_likes;
create policy "Pet owners can view community post likes"
on public.community_post_likes
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_pet_owner = true
  )
);

drop policy if exists "Authenticated users can view community post comments"
  on public.community_post_comments;
create policy "Pet owners can view community post comments"
on public.community_post_comments
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_pet_owner = true
  )
);

-- Also require is_pet_owner = true on insert/update to keep write access in
-- sync with read access. Authors still must own the row (auth.uid() = user_id).
drop policy if exists "Users can insert own owner community posts"
  on public.owner_community_posts;
create policy "Pet owners can insert own owner community posts"
on public.owner_community_posts
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_pet_owner = true
  )
);

drop policy if exists "Users can insert own community post likes"
  on public.community_post_likes;
create policy "Pet owners can insert own community post likes"
on public.community_post_likes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_pet_owner = true
  )
);

drop policy if exists "Users can insert own community post comments"
  on public.community_post_comments;
create policy "Pet owners can insert own community post comments"
on public.community_post_comments
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_pet_owner = true
  )
);
