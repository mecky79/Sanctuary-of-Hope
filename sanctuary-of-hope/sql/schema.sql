-- Sanctuary of Hope Ministries — Supabase schema
-- Run this in the Supabase SQL editor before wiring up js/supabase-client.js

-- 1. SERMONS ------------------------------------------------------------
-- Posted from the admin dashboard, read by everyone on sermons.html and
-- the homepage "Latest Word" section. No video/audio, just text + a
-- picture of the minister.

create table if not exists sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  minister_name text not null,
  minister_photo_url text,
  scripture_reference text,
  body text not null,
  created_at timestamptz not null default now()
);

alter table sermons enable row level security;

-- Anyone can read sermons (public site content)
create policy "Public can read sermons"
  on sermons for select
  using (true);

-- Only signed-in admin users can create/edit/delete
create policy "Authenticated can insert sermons"
  on sermons for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated can update sermons"
  on sermons for update
  using (auth.role() = 'authenticated');

create policy "Authenticated can delete sermons"
  on sermons for delete
  using (auth.role() = 'authenticated');

-- 2. CONTACT MESSAGES -----------------------------------------------------
-- Submitted from contact.html. Public can insert, nobody can read from
-- the browser — only from the Supabase dashboard / an authenticated admin.

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

create policy "Public can submit a message"
  on contact_messages for insert
  with check (true);

create policy "Authenticated can read messages"
  on contact_messages for select
  using (auth.role() = 'authenticated');

-- 3. STORAGE ---------------------------------------------------------------
-- Create a public bucket called "sermon-photos" from the Supabase dashboard
-- (Storage -> New bucket -> name: sermon-photos -> Public bucket: on).
-- The admin dashboard uploads the minister's photo there and stores the
-- public URL in sermons.minister_photo_url.
