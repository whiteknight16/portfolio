-- Personal-brand redesign: new profile/post/experience/project columns,
-- newsletter subscribers, and the four public site sections.
-- Idempotent: safe to re-run. Mirrors the matching parts of setup.sql.

alter table public.profile
  add column if not exists handle text,
  add column if not exists tagline text not null default '',
  add column if not exists career_start_date date,
  add column if not exists now jsonb not null default '{}'::jsonb,        -- {building, writing, learning}
  add column if not exists now_updated_at timestamptz,
  add column if not exists highlights jsonb not null default '[]'::jsonb; -- [{value, label}]

alter table public.posts
  add column if not exists source_title text,
  add column if not exists source_url text,
  add column if not exists source_kind text,
  add column if not exists tldr text[] not null default '{}';

alter table public.posts drop constraint if exists posts_source_kind_check;
alter table public.posts add constraint posts_source_kind_check
  check (source_kind is null or source_kind in ('video','article','paper','course','book','podcast','other'));
alter table public.posts drop constraint if exists posts_tldr_max_3;
alter table public.posts add constraint posts_tldr_max_3
  check (cardinality(tldr) <= 3);

alter table public.experiences add column if not exists tags text[] not null default '{}';
alter table public.projects    add column if not exists label text;

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  status text not null default 'active' check (status in ('active','unsubscribed')),
  source text,
  created_at timestamptz not null default now()
);
alter table public.subscribers enable row level security;

-- Newsletter: anon may subscribe (insert only, as active); no public read
drop policy if exists pub_insert_subscribers on public.subscribers;
create policy pub_insert_subscribers on public.subscribers for insert with check (status = 'active');
drop policy if exists admin_all_subscribers on public.subscribers;
create policy admin_all_subscribers on public.subscribers for all using (public.is_admin()) with check (public.is_admin());

-- Site sections: exactly projects, blog, newsletter, experience.
-- Existing rows keep their enabled/sort_order; only the label is refreshed.
delete from public.site_sections where key not in ('projects','blog','newsletter','experience');

insert into public.site_sections (key, label, enabled, sort_order) values
  ('projects', 'Things I''ve built', true, 1),
  ('blog', 'Notes', true, 2),
  ('newsletter', 'Subscribe', true, 3),
  ('experience', 'Work', true, 4)
on conflict (key) do update set label = excluded.label;
