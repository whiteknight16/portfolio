-- =====================================================================
-- Portfolio — full setup + content seed
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> New query -> paste ALL
-- of this -> Run.  Idempotent: safe on a fresh project AND safe to re-run
-- (re-running just refreshes your content to match this file).
--
-- Admin login: the RLS helper is_admin() hardcodes 'harshp6421@gmail.com'.
-- Create a Supabase Auth user with THAT email (Authentication -> Users ->
-- Add user) and disable public sign-ups. That account is your /admin login.
-- =====================================================================


-- ===== 1. Schema (tables) =====

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
  key text not null unique,          -- about|experience|skills|projects|achievements|education|contact
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


-- ===== 2. Row Level Security (+ admin identity, hardcoded email) =====

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


-- ===== 3. Storage bucket for images/resume =====

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


-- ===== 5. Your content (profile, sections incl. Blog, experience, skills, projects, achievements, education) =====

-- Seed data: Harsh Pandey's real portfolio content.
-- Idempotent: each table is cleared before re-inserting, so this file can be
-- re-run safely against the same database. Wrapped in a single transaction.

begin;

-- ---------------------------------------------------------------------------
-- profile (singleton)
-- ---------------------------------------------------------------------------
delete from public.profile;

insert into public.profile (
  full_name, title, headline, bio, avatar_url, resume_url, location, email, phone, socials, singleton
) values (
  'Harsh Pandey',
  'Full Stack Developer',
  'Full Stack Developer specializing in MERN, Next.js, FastAPI & Generative AI',
  'Full Stack Developer specializing in the MERN stack, Next.js, FastAPI, and Generative AI. Currently building an agentic AI-powered interview platform at SkillSync. Experienced with real-time systems (WebRTC/LiveKit), LLM integrations (LangChain, LangGraph), and end-to-end product ownership from requirements to production.',
  null,
  '/resume.pdf',
  'Dwarka, New Delhi, India',
  'harshp6421@gmail.com',
  null,
  '{"github":"https://github.com/whiteknight16","linkedin":"https://www.linkedin.com/in/harshpandey61/","instagram":"https://www.instagram.com/knightcoder19/"}'::jsonb,
  true
);

-- ---------------------------------------------------------------------------
-- site_sections
-- ---------------------------------------------------------------------------
delete from public.site_sections;

insert into public.site_sections (key, label, enabled, sort_order) values
  ('about',        'About',        true, 1),
  ('experience',   'Experience',   true, 2),
  ('skills',       'Skills',       true, 3),
  ('projects',     'Projects',     true, 4),
  ('achievements', 'Achievements', true, 5),
  ('education',    'Education',    true, 6),
  ('contact',      'Contact',      true, 7),
  ('blog',         'Blog',         true, 8);

-- ---------------------------------------------------------------------------
-- experiences
-- ---------------------------------------------------------------------------
delete from public.experiences;

insert into public.experiences (
  role, company, location, start_date, end_date, is_current, highlights, sort_order
) values
  (
    'Full Stack Engineer',
    'SkillSync',
    null,
    '2025-03-01',
    null,
    true,
    '{"Designed, developed, and deployed a unified agentic AI-powered interview platform combining multi-round AI interviews with LiveKit-based WebRTC for real-time audio/video.","Implemented multi-agent interview orchestration — AI agents conducting screening, technical, and behavioral rounds within a single live interview flow.","Built the real-time interview experience with LiveKit (WebRTC): session lifecycle management, low-latency streaming, reconnections, and production reliability.","Integrated AI-generated interview questions and evaluation logic dynamically adapted to job roles, stages, and candidate responses.","Developed FastAPI backend services for interview sessions, agent coordination, scoring pipelines, and data persistence.","Led a database schema migration from legacy structure to optimized design with minimal production downtime.","Built background jobs and cron services for notifications, reporting, and data sync.","Owned features end-to-end, collaborating directly with founders and product stakeholders."}',
    1
  ),
  (
    'Generative AI Intern',
    'EY',
    'Gurugram',
    '2024-07-01',
    '2024-08-31',
    false,
    '{"Developed a Bench Management System (ERB portal) in React.js to optimize utilization of benched employees, reducing hiring costs.","Built an AI-powered chatbot using FastAPI, Gemini API, and fine-tuning to handle database queries and provide insights.","Integrated interactive data visualization (employee statistics, filterable graphs).","Hands-on with LLMs, LangChain, and model fine-tuning for real-world applications."}',
    2
  ),
  (
    'Full Stack Developer Intern',
    'Ransh Innovations',
    'Remote',
    '2023-11-01',
    '2024-05-31',
    false,
    '{"Full-Stack (MERN) developer at an early-stage startup.","Developed and optimized RESTful APIs for performance, scalability, and security.","Implemented secure authentication and data protection.","Translated Figma designs into functional UIs; wrote unit tests for front-end components.","Collaborated with the founder on schema design and HLD/LLD system architecture."}',
    3
  );

-- ---------------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------------
delete from public.skills;

insert into public.skills (name, category, sort_order) values
  -- Languages
  ('Python',               'Languages', 1),
  ('JavaScript (ES6+)',    'Languages', 2),
  ('TypeScript',           'Languages', 3),
  -- Frontend
  ('HTML5',                'Frontend', 4),
  ('CSS3',                 'Frontend', 5),
  ('Tailwind CSS',         'Frontend', 6),
  ('React.js',             'Frontend', 7),
  ('Next.js',              'Frontend', 8),
  -- Backend
  ('Node.js',              'Backend', 9),
  ('Express.js',           'Backend', 10),
  ('FastAPI',              'Backend', 11),
  ('REST APIs',            'Backend', 12),
  ('Auth (JWT, OAuth, 2FA)', 'Backend', 13),
  -- Databases & ORMs
  ('PostgreSQL',           'Databases & ORMs', 14),
  ('MongoDB',              'Databases & ORMs', 15),
  ('Firebase',             'Databases & ORMs', 16),
  ('Prisma ORM',           'Databases & ORMs', 17),
  -- AI / GenAI
  ('LLMs',                 'AI / GenAI', 18),
  ('LangChain',            'AI / GenAI', 19),
  ('LangGraph',            'AI / GenAI', 20),
  ('Prompt Engineering',   'AI / GenAI', 21),
  -- DevOps & Tooling
  ('Git',                  'DevOps & Tooling', 22),
  ('GitHub',               'DevOps & Tooling', 23),
  ('Docker',               'DevOps & Tooling', 24),
  ('Kubernetes',           'DevOps & Tooling', 25),
  ('CI/CD',                'DevOps & Tooling', 26),
  ('Cron Jobs',            'DevOps & Tooling', 27),
  ('Inngest',              'DevOps & Tooling', 28);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
delete from public.projects;

insert into public.projects (
  title, slug, summary, content, cover_image_url, tags, links, featured, status, sort_order, published_at
) values
  (
    'Interview Genie',
    'interview-genie',
    'AI-powered career platform for job insights, AI resume building, cover letters, quizzes, and career analytics.',
    '<p>AI-powered platform for job insights, AI resume building, cover letters, quizzes, and career analytics.</p><ul><li>Gemini API for resume generation, cover letter suggestions, and AI-driven career insights.</li><li>Next.js, PostgreSQL, Prisma ORM; Inngest for cron jobs and background tasks.</li><li>Interactive data visualizations with Recharts; form validation with Zod + React Hook Form.</li></ul>',
    null,
    '{"Next.js","PostgreSQL","Prisma","Gemini","Inngest","Recharts"}',
    '{"repo":"https://github.com/whiteknight16/interview-genie","live":"https://interview-genie-snowy.vercel.app"}'::jsonb,
    true,
    'published',
    1,
    now()
  ),
  (
    'Gymkhana',
    'gymkhana',
    'Comprehensive fitness tracking app built on the MERN stack with role-based admin and user panels.',
    '<p>Comprehensive fitness tracking app built on the MERN stack.</p><ul><li>Role-based Admin and User panels.</li><li>Interactive charts for user progress and fitness metrics.</li><li>Secure authentication and authorization.</li></ul>',
    null,
    '{"MongoDB","Express","React","Node.js"}',
    '{"repo":"https://github.com/whiteknight16/Gymkhana"}'::jsonb,
    true,
    'published',
    2,
    now()
  ),
  (
    'REC Mirzapur — Official College Website',
    'rec-mirzapur',
    'Official website for REC Mirzapur, a state government engineering college, built independently.',
    '<p>Independently developed the official website for REC Mirzapur, a state government engineering college.</p>',
    null,
    '{"Web Development"}',
    '{}'::jsonb,
    false,
    'published',
    3,
    now()
  ),
  (
    'Notes Nest',
    'notes-nest',
    'Next.js-powered note-taking web app with authentication, billing, and a Prisma/PostgreSQL backend.',
    '<p>Your next-generation, Next.js-powered web-based note-taking app.</p><ul><li>Auth via Kinde; payments/billing via Stripe.</li><li>Next.js, TypeScript, Tailwind CSS, ShadCN/UI.</li><li>Prisma ORM with PostgreSQL.</li></ul>',
    null,
    '{"Next.js","TypeScript","Tailwind CSS","Prisma","PostgreSQL","Stripe"}',
    '{"repo":"https://github.com/whiteknight16/Notes-Nest","live":"https://notes-nest.vercel.app"}'::jsonb,
    false,
    'published',
    4,
    now()
  );

-- ---------------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------------
delete from public.achievements;

insert into public.achievements (title, description, sort_order) values
  (
    'Top 100 — GirlScript Summer of Code',
    'Achieved a Top 100 rank in GirlScript Summer of Code (open source program).',
    1
  ),
  (
    '1st Place — Smart India Hackathon (College Round)',
    'Won 1st place in the college-level round of Smart India Hackathon (SIH) in both 2023 and 2024.',
    2
  ),
  (
    'SIH 2024 Grand Finalist',
    'Qualified for the Grand Finale of Smart India Hackathon 2024.',
    3
  ),
  (
    'Web Development Team Lead',
    'Web Development Team Member for 2 years; Team Lead in final year at college.',
    4
  ),
  (
    'Built REC Mirzapur Official Website',
    'Independently built the official website for REC Mirzapur.',
    5
  );

-- ---------------------------------------------------------------------------
-- education
-- ---------------------------------------------------------------------------
delete from public.education;

insert into public.education (
  degree, institution, location, start_date, end_date, description, sort_order
) values (
  'B.Tech, Computer Science & Engineering',
  'Rajkiya Engineering College Sonbhadra',
  null,
  '2021-09-01',
  '2025-06-30',
  '',
  1
);

commit;
