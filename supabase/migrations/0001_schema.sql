create extension if not exists "pgcrypto";

create table public.profile (
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

create table public.site_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,          -- about|experience|skills|projects|achievements|education|contact
  label text not null,
  enabled boolean not null default true,
  sort_order int not null default 0
);

create table public.projects (
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

create table public.experiences (
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

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  sort_order int not null default 0
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  sort_order int not null default 0
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  degree text not null,
  institution text not null,
  location text,
  start_date date,
  end_date date,
  description text not null default '',
  sort_order int not null default 0
);

create table public.posts (
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

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
