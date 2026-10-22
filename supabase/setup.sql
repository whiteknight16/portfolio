-- =====================================================================
-- Portfolio — full database setup (schema, RLS, storage, starter content)
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> New query -> paste ALL -> Run.
-- Or: psql "<connection string>" -f supabase/setup.sql
-- Safe on a fresh project AND safe to re-run: schema and policies are
-- re-applied, and starter content is only inserted into tables that are empty,
-- so edits made in the admin are never overwritten. Posts, subscribers and
-- contact messages are never touched. To reset content, run seed.sql.
-- Admin login: is_admin() hardcodes 'harshp6421@gmail.com' — create a Supabase
-- Auth user with that email and disable public sign-ups.
-- =====================================================================



-- ===== 1. Schema =====

create extension if not exists "pgcrypto";

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text not null default '',
  headline text not null default '',
  bio text not null default '',
  avatar_url text,
  resume_url text,
  location text,
  email text,
  phone text,
  socials jsonb not null default '{}'::jsonb,
  singleton boolean not null default true unique,   -- enforces one row
  updated_at timestamptz not null default now()
);

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,          -- projects|blog|newsletter|experience
  label text not null,
  enabled boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  content text not null default '',  -- sanitized HTML
  cover_image_url text,
  tags text[] not null default '{}',
  links jsonb not null default '{}'::jsonb,   -- {live, repo}
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  location text,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  highlights text[] not null default '{}',
  sort_order int not null default 0
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  sort_order int not null default 0
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  sort_order int not null default 0
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  degree text not null,
  institution text not null,
  location text,
  start_date date,
  end_date date,
  description text not null default '',
  sort_order int not null default 0
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',   -- sanitized HTML
  cover_image_url text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published')),
  reading_minutes int not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Personal-brand additions (mirrors migrations/0006_personal_brand.sql).
-- `add column if not exists` keeps this safe on a project created by an older
-- version of this file.
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


-- ===== 2. RLS =====

-- helper: is the caller the single admin?
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'harshp6421@gmail.com';
$$;
-- NOTE: the admin email is hardcoded above. Supabase's SQL-editor role cannot
-- run `alter database ... set app.admin_email` (permission denied: 42501), so
-- the GUC approach isn't usable on hosted Supabase. Change the literal here if
-- the admin email changes, and keep it in sync with ADMIN_EMAIL in .env.

alter table public.profile          enable row level security;
alter table public.site_sections    enable row level security;
alter table public.projects         enable row level security;
alter table public.experiences      enable row level security;
alter table public.skills           enable row level security;
alter table public.achievements     enable row level security;
alter table public.education        enable row level security;
alter table public.posts            enable row level security;
alter table public.contact_messages enable row level security;
alter table public.subscribers     enable row level security;

-- Public read (always-visible content)
drop policy if exists pub_read_profile on public.profile;
create policy pub_read_profile on public.profile          for select using (true);
drop policy if exists pub_read_experiences on public.experiences;
create policy pub_read_experiences on public.experiences      for select using (true);
drop policy if exists pub_read_skills on public.skills;
create policy pub_read_skills on public.skills           for select using (true);
drop policy if exists pub_read_achievements on public.achievements;
create policy pub_read_achievements on public.achievements     for select using (true);
drop policy if exists pub_read_education on public.education;
create policy pub_read_education on public.education        for select using (true);
drop policy if exists pub_read_sections on public.site_sections;
create policy pub_read_sections on public.site_sections    for select using (enabled = true or public.is_admin());
drop policy if exists pub_read_projects on public.projects;
create policy pub_read_projects on public.projects         for select using (status = 'published' or public.is_admin());
drop policy if exists pub_read_posts on public.posts;
create policy pub_read_posts on public.posts            for select using (status = 'published' or public.is_admin());

-- Contact: anon may insert only
drop policy if exists pub_insert_messages on public.contact_messages;
create policy pub_insert_messages on public.contact_messages for insert with check (true);

-- Newsletter: anon may subscribe (insert only, as active); no public read
drop policy if exists pub_insert_subscribers on public.subscribers;
create policy pub_insert_subscribers on public.subscribers for insert with check (status = 'active');

-- Admin full CRUD on every table
drop policy if exists admin_all_profile on public.profile;
create policy admin_all_profile on public.profile          for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_sections on public.site_sections;
create policy admin_all_sections on public.site_sections    for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_projects on public.projects;
create policy admin_all_projects on public.projects         for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_experiences on public.experiences;
create policy admin_all_experiences on public.experiences      for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_skills on public.skills;
create policy admin_all_skills on public.skills           for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_achievements on public.achievements;
create policy admin_all_achievements on public.achievements     for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_education on public.education;
create policy admin_all_education on public.education        for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_posts on public.posts;
create policy admin_all_posts on public.posts            for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_messages on public.contact_messages;
create policy admin_all_messages on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_all_subscribers on public.subscribers;
create policy admin_all_subscribers on public.subscribers for all using (public.is_admin()) with check (public.is_admin());


-- ===== 3. Storage =====

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');
drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- Blog cover + inline images (mirrors 0005_blog_images_storage.sql)
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

drop policy if exists blog_images_public_read on storage.objects;
create policy blog_images_public_read on storage.objects
  for select using (bucket_id = 'blog-images');
drop policy if exists blog_images_admin_write on storage.objects;
create policy blog_images_admin_write on storage.objects
  for insert with check (bucket_id = 'blog-images' and public.is_admin());
drop policy if exists blog_images_admin_update on storage.objects;
create policy blog_images_admin_update on storage.objects
  for update using (bucket_id = 'blog-images' and public.is_admin());
drop policy if exists blog_images_admin_delete on storage.objects;
create policy blog_images_admin_delete on storage.objects
  for delete using (bucket_id = 'blog-images' and public.is_admin());


-- ===== 4. updated_at triggers =====

-- `updated_at` columns default to `now()`, but that only fires on INSERT.
-- Without a trigger, UPDATEs never bump the timestamp. This adds a single
-- shared trigger function and wires it up to every table that has an
-- `updated_at` column (`profile`, `projects`, `posts`).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profile;
create trigger set_updated_at
  before update on public.profile
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.posts;
create trigger set_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();


-- ===== 5. Content =====

-- Starter content, written once as fill-if-empty: each table is only populated
-- when it has no rows, so re-running never overwrites admin edits (and a table
-- you emptied on purpose gets its starter rows back). Values match seed.sql.
-- Wrapped in a single transaction. Never touches posts, subscribers or
-- contact_messages.

begin;

-- profile (singleton)
insert into public.profile (
  full_name, title, handle, headline, tagline, bio, avatar_url, resume_url, location, email, phone, career_start_date, now, highlights, socials, singleton
)
select
  'Harsh Pandey' as full_name,
  'AI engineer & builder' as title,
  'Knight Developer' as handle,
  'I build AI that *does the actual work*: not chatbots, but interviewers and tutors that run live, on voice and video.' as headline,
  'I''ve spent the last {years} years shipping these to production, and owning everything that breaks around them. Here I write about what I''m building, what goes wrong, and what I''m figuring out next.' as tagline,
  'I''m Harsh Pandey, known online as Knight Developer. I build AI that does real work: systems that take over a job a person used to do, end to end. Over the last {years} years that has meant an AI interviewer that runs live, multi-round spoken interviews, and an AI tutor that teaches over voice and video, sets the test, marks it and moves the learner on. I care about the whole system around the model as much as the model itself: the real-time voice layer, the FastAPI and Postgres services, the jobs, retries and migrations, and the part where it breaks in production and someone has to fix it. Before that I was the first engineering hire at an early-stage startup, built a GenAI assistant at EY, and reached the Smart India Hackathon 2024 grand finale. This site is where I write about what I''m building, what goes wrong, and what I''m learning next, including machine learning from first principles.' as bio,
  '/profile.png' as avatar_url,
  '/resume.pdf' as resume_url,
  'New Delhi, India' as location,
  'harshp6421@gmail.com' as email,
  null::text as phone,
  '2025-03-01'::date as career_start_date,
  '{"building":"an AI tutor that teaches live over voice & video","writing":"notes on voice agents and what breaks in production","learning":"ML from first principles"}'::jsonb as now,
  '[{"value":"2","label":"live voice & video AI products built"},{"value":"Finalist","label":"Smart India Hackathon 2024, national round"},{"value":"#1 hire","label":"first engineer at an early-stage startup"}]'::jsonb as highlights,
  '{"github":"https://github.com/whiteknight16","linkedin":"https://www.linkedin.com/in/harshpandey61/","instagram":"https://www.instagram.com/whiteknight__19/"}'::jsonb as socials,
  true as singleton
where not exists (select 1 from public.profile);

-- site_sections: projects, blog, newsletter, experience
delete from public.site_sections where key not in ('projects','blog','newsletter','experience');

insert into public.site_sections (key, label, enabled, sort_order) values
  ('projects', 'Things I''ve built', true, 1),
  ('blog', 'Notes', true, 2),
  ('newsletter', 'Subscribe', true, 3),
  ('experience', 'Work', true, 4)
on conflict (key) do update set label = excluded.label;

-- experiences
insert into public.experiences (
  role, company, location, start_date, end_date, is_current, highlights, tags, sort_order
)
select
  v.role::text,
  v.company::text,
  v.location::text,
  v.start_date::date,
  v.end_date::date,
  v.is_current::boolean,
  v.highlights::text[],
  v.tags::text[],
  v.sort_order::int
from (values
  (
    'Software Engineer',
    'BerriBot',
    null,
    '2026-03-01',
    null,
    true,
    '{"Building an AI tutor that teaches live over voice and video, sets and marks assessments, and moves learners through a syllabus. Plus AI proctoring and the FastAPI and Postgres backend under it.","Designed the learning core end to end: syllabus generation, planner agents, coding assessments, mock interviews, verification pipelines, and automated course progression.","Built the backend on FastAPI, PostgreSQL, and Supabase — APIs, background jobs, retry paths, migrations, and deployments.","Built AI proctoring with video capture, live monitoring, secure storage, and candidate evaluation.","Diagnose and fix production failures across voice pipelines, agents, and enterprise deployments — the work that turns a demo into a product teams rely on."}',
    '{"voice agents","FastAPI"}',
    1
  ),
  (
    'Full Stack Engineer',
    'SkillSync',
    null,
    '2025-03-01',
    '2026-02-28',
    false,
    '{"Shipped an AI interviewer that replaced the human screening loop: several agents running spoken screening, technical and behavioural rounds in one live LiveKit session. Owned the real-time voice layer.","Owned the real-time voice layer: session lifecycle, low-latency audio streaming, reconnection, and the failure modes that only appear in production.","Built FastAPI services for session coordination, adaptive question generation, and scoring pipelines.","Led a database migration off the legacy schema with minimal production downtime, working directly with the founders."}',
    '{"LiveKit","multi-agent"}',
    2
  ),
  (
    'Generative AI Intern',
    'EY',
    'Gurugram',
    '2024-07-01',
    '2024-08-31',
    false,
    '{"Built an AI assistant over internal data with FastAPI and Gemini, and a portal to put unassigned staff back on work.","Shipped the interactive reporting layer — filterable workforce statistics and charts."}',
    '{"Gemini"}',
    3
  ),
  (
    'Full Stack Developer Intern',
    'Ransh Innovations',
    'Remote',
    '2023-11-01',
    '2024-05-31',
    false,
    '{"First engineering hire at an early-stage startup. Built the product end to end, side by side with the founder.","Designed and hardened REST APIs for performance and security, with authentication and data protection.","Worked directly with the founder on schema design and system architecture."}',
    '{"first hire"}',
    4
  )) as v(role, company, location, start_date, end_date, is_current, highlights, tags, sort_order)
where not exists (select 1 from public.experiences);

-- skills, grouped by capability
insert into public.skills (
  name, category, sort_order
)
select
  v.name::text,
  v.category::text,
  v.sort_order::int
from (values
  -- AI & Agents
  ('LLMs',                        'AI & Agents', 1),
  ('LangChain',                   'AI & Agents', 2),
  ('LangGraph',                   'AI & Agents', 3),
  ('Multi-agent orchestration',   'AI & Agents', 4),
  ('Agentic workflows',           'AI & Agents', 5),
  ('Evaluation & scoring',        'AI & Agents', 6),
  ('Prompt engineering',          'AI & Agents', 7),
  -- Real-time & Voice
  ('LiveKit',                     'Real-time & Voice', 8),
  ('WebRTC',                      'Real-time & Voice', 9),
  ('Voice agent pipelines',       'Real-time & Voice', 10),
  ('Session orchestration',       'Real-time & Voice', 11),
  ('WebSockets',                  'Real-time & Voice', 12),
  -- Backend
  ('Python',                      'Backend', 13),
  ('FastAPI',                     'Backend', 14),
  ('Node.js',                     'Backend', 15),
  ('REST APIs',                   'Backend', 16),
  ('Auth (JWT, OAuth, 2FA)',      'Backend', 17),
  ('Background jobs & queues',    'Backend', 18),
  -- Data
  ('PostgreSQL',                  'Data', 19),
  ('Supabase',                    'Data', 20),
  ('MongoDB',                     'Data', 21),
  ('Prisma',                      'Data', 22),
  ('Schema migrations',           'Data', 23),
  -- Frontend
  ('TypeScript',                  'Frontend', 24),
  ('React',                       'Frontend', 25),
  ('Next.js',                     'Frontend', 26),
  ('Tailwind CSS',                'Frontend', 27),
  -- Infrastructure
  ('Docker',                      'Infrastructure', 28),
  ('Kubernetes',                  'Infrastructure', 29),
  ('CI/CD',                       'Infrastructure', 30),
  ('Inngest',                     'Infrastructure', 31)) as v(name, category, sort_order)
where not exists (select 1 from public.skills);

-- projects (label = small tag on the card; featured ones appear on the home page)
insert into public.projects (
  title, slug, summary, content, cover_image_url, tags, links, featured, label, status, sort_order, published_at
)
select
  v.title::text,
  v.slug::text,
  v.summary::text,
  v.content::text,
  v.cover_image_url::text,
  v.tags::text[],
  v.links::jsonb,
  v.featured::boolean,
  v.label::text,
  v.status::text,
  v.sort_order::int,
  v.published_at::timestamptz
from (values
  (
    'Interview Genie',
    'interview-genie',
    'Career advice is generic because it is cheap to produce. This turns one specific role into a tailored resume, cover letter, and practice set — and keeps the market data behind it fresh on a schedule.',
    '<p>Career tooling is full of templates that ignore the role you are actually applying for. Interview Genie starts from the specific job and works backwards.</p><ul><li>Resume generation, cover letters, and role-adapted practice built on the Gemini API.</li><li>Next.js, PostgreSQL, and Prisma, with Inngest running the scheduled jobs that keep career insights current rather than frozen at signup.</li><li>Analytics rendered with Recharts; end-to-end validation with Zod and React Hook Form.</li></ul>',
    null,
    '{"Next.js","PostgreSQL","Prisma","Gemini","Inngest","Recharts"}',
    '{"repo":"https://github.com/whiteknight16/interview-genie","live":"https://interview-genie-snowy.vercel.app"}'::jsonb,
    true,
    'AI product',
    'published',
    1,
    now()
  ),
  (
    'REC Mirzapur — Official College Website',
    'rec-mirzapur',
    'The official web presence for a state government engineering college, built and delivered solo — requirements gathered from faculty stakeholders, then handed over as a system they could run without me.',
    '<p>A state government engineering college needed an official website and had no in-house engineering team. I took it from requirements to handover on my own.</p><ul><li>Sole developer: scoping with faculty stakeholders, build, launch, and handover.</li><li>Content structured so non-technical staff could maintain it after delivery.</li></ul>',
    null,
    '{"Web Development","Solo delivery","Stakeholder management"}',
    '{}'::jsonb,
    true,
    'Delivered solo',
    'published',
    2,
    now()
  ),
  (
    'Notes Nest',
    'notes-nest',
    'A note-taking app built as a complete commercial slice rather than a demo: real authentication, real subscription billing, and a typed Postgres backend behind the editor.',
    '<p>Most side-project note apps stop at the editor. This one was built to prove out the parts that actually make a product sellable.</p><ul><li>Authentication via Kinde and subscription billing via Stripe.</li><li>Next.js and TypeScript on the front, Prisma and PostgreSQL behind it.</li></ul>',
    null,
    '{"Next.js","TypeScript","Prisma","PostgreSQL","Stripe"}',
    '{"repo":"https://github.com/whiteknight16/Notes-Nest","live":"https://notes-nest.vercel.app"}'::jsonb,
    true,
    'SaaS',
    'published',
    3,
    now()
  ),
  (
    'Gymkhana',
    'gymkhana',
    'A fitness platform with genuinely separate admin and member surfaces — role-based access, progress tracking, and charts that make the numbers mean something.',
    '<p>A fitness tracking platform built around two distinct audiences rather than one shared dashboard.</p><ul><li>Separate role-based admin and member experiences with enforced authorisation.</li><li>Progress and fitness metrics visualised for members, aggregate views for admins.</li></ul>',
    null,
    '{"MongoDB","Express","React","Node.js"}',
    '{"repo":"https://github.com/whiteknight16/Gymkhana"}'::jsonb,
    false,
    'Full-stack app',
    'published',
    4,
    now()
  )) as v(title, slug, summary, content, cover_image_url, tags, links, featured, label, status, sort_order, published_at)
where not exists (select 1 from public.projects);

-- achievements (kept for the admin; no public section)
insert into public.achievements (
  title, description, sort_order
)
select
  v.title::text,
  v.description::text,
  v.sort_order::int
from (values
  (
    'Smart India Hackathon — 2024 Grand Finalist',
    'Reached the national Grand Finale of Smart India Hackathon 2024, after winning the college round in both 2023 and 2024.',
    1
  ),
  (
    'Top 100 — GirlScript Summer of Code',
    'Finished in the top 100 contributors of GirlScript Summer of Code.',
    2
  ),
  (
    'Web Development Team Lead',
    'Two years on the college web development team, leading it in the final year.',
    3
  )) as v(title, description, sort_order)
where not exists (select 1 from public.achievements);

-- education (kept for the admin; no public section)
insert into public.education (
  degree, institution, location, start_date, end_date, description, sort_order
)
select
  v.degree::text,
  v.institution::text,
  v.location::text,
  v.start_date::date,
  v.end_date::date,
  v.description::text,
  v.sort_order::int
from (values (
  'B.Tech, Computer Science & Engineering',
  'Rajkiya Engineering College Sonbhadra',
  null,
  '2021-09-01',
  '2025-06-30',
  '',
  1
)) as v(degree, institution, location, start_date, end_date, description, sort_order)
where not exists (select 1 from public.education);

commit;
