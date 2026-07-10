# Portfolio + Admin CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal & refined software-engineer portfolio backed by a single-admin Supabase CMS, seeded with Harsh Pandey's real content, with a WYSIWYG blog and a contact form.

**Architecture:** Next.js 16 App Router. Public pages are RSC that read published content from Supabase via the anon/SSR client (RLS enforced). A cookie-refreshing `proxy.ts` guards `/admin`, where server actions (Zod-validated) perform CRUD as the authenticated admin. Content — including which home sections show — lives in Postgres and is edited in `/admin`; the DB is the single source of truth. The existing `LAUNCHED` flag flips `SiteHome` from placeholder to the real site.

**Tech Stack:** Next.js 16.2, React 19, TypeScript, Tailwind 4 + shadcn (base-nova) + Base UI + lucide-react, Motion, next-themes, `@supabase/supabase-js` + `@supabase/ssr`, Tiptap, Resend, Zod, slugify, isomorphic-dompurify, date-fns.

## Global Constraints

- **Next.js 16 breaking changes (verify against `node_modules/next/dist/docs/01-app/` before writing any Next API):**
  - Middleware is renamed: use `proxy.ts` at repo root with `export async function proxy(request)`. Runtime is `nodejs` (not edge). Do NOT create `middleware.ts`.
  - `cookies()` and `headers()` are async — always `await cookies()`.
  - Route `params` and `searchParams` are Promises — `const { slug } = await props.params`. Use `PageProps<'/route'>` types (run `npx next typegen` if needed).
  - `revalidateTag(tag)` now requires a second arg. **Prefer `revalidatePath(path)`** in this project to avoid it.
- **Server-only secrets:** `SUPABASE_SERVICE_ROLE_KEY` may ONLY be imported in `src/lib/supabase/admin.ts` (has no `"use client"` ancestor and is never imported by a client component). Never expose it to the browser.
- **RLS everywhere:** every table has RLS enabled. Public reads are restricted to published/enabled rows. Rich-text HTML is sanitized server-side before persistence AND rendering.
- **Admin identity:** only the user whose `auth.jwt()->>'email'` equals `ADMIN_EMAIL` may mutate. Enforced in both RLS and server actions.
- **Aesthetic:** minimal & refined, light + dark via next-themes (class strategy; `globals.css` already defines `.dark` tokens). One restrained accent. Mobile-first. Subtle Motion only.
- **Package manager:** npm. **Path alias:** `@/` → `src/`. **Test runner:** `node --test 'src/**/*.test.ts'` (already in `package.json`).
- **Commits:** small and frequent; conventional-commit messages; end each with the Co-Authored-By trailer used in this repo.

---

## File Structure

```
proxy.ts                                  # NEW — auth session refresh + /admin guard (Next 16 middleware)
supabase/
  migrations/
    0001_schema.sql                        # tables
    0002_rls.sql                           # RLS + policies
    0003_storage.sql                       # media bucket + storage policies
  seed.sql                                 # Harsh's real content (idempotent)
.env.example                               # UPDATE — all env vars documented
src/
  lib/
    config.ts                              # UPDATE — brand + nav config
    flags.ts                               # keep (LAUNCHED gate)
    env.ts                                 # NEW — typed env access
    supabase/{server,browser,admin}.ts     # NEW — three clients
    auth.ts                                # NEW — requireAdmin(), getSessionUser()
    validation.ts                          # NEW — Zod schemas per entity
    content.ts                             # NEW — typed public data-fetch functions
    format.ts                              # NEW — pure helpers (slugify, readingMinutes, dateRange)
    sanitize.ts                            # NEW — sanitizeHtml()
    types.ts                               # NEW — DB row TS types
  components/
    site-home.tsx                          # UPDATE — compose real site
    theme-provider.tsx, theme-toggle.tsx   # NEW
    public/{nav,footer,section,...}.tsx    # NEW — public UI
    sections/{about,experience,skills,projects-preview,achievements,education,contact}.tsx
    admin/{shell,form-fields,image-upload,data-table,submit-button,...}.tsx
    editor/rich-text-editor.tsx            # NEW — Tiptap
  app/
    (site)/…                               # public routes group
    admin/…                                # admin routes
    sitemap.ts, robots.ts, opengraph-image.tsx
```

---

## Phase 1 — Supabase foundation

### Task 1: Dependencies, env, and typed env access

**Files:**
- Modify: `package.json` (deps)
- Modify: `.env.example`, `.env.local`
- Create: `src/lib/env.ts`
- Create: `src/lib/env.test.ts`

**Interfaces:**
- Produces: `env` object with `supabaseUrl`, `supabaseAnonKey`, `adminEmail` (public-safe subset) and `serverEnv()` returning `{ serviceRoleKey, resendApiKey, contactEmail }` (throws if missing, server-only).

- [ ] **Step 1: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr zod slugify isomorphic-dompurify date-fns resend \
  @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder
```

- [ ] **Step 2: Document env vars** — overwrite `.env.example`:

```bash
# --- Launch switch (existing) ---
LAUNCHED=false

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # SERVER ONLY. never NEXT_PUBLIC.

# --- Admin ---
ADMIN_EMAIL=harshp6421@gmail.com                  # the only email allowed to log into /admin

# --- Email (Resend) ---
RESEND_API_KEY=re_xxx
CONTACT_NOTIFICATION_EMAIL=harshp6421@gmail.com   # where contact submissions are sent
CONTACT_FROM_EMAIL=onboarding@resend.dev          # verified Resend sender (or your domain)
```

Also add the same keys (with placeholder values) to `.env.local` so `npm run dev` boots; the user pastes real values later.

- [ ] **Step 3: Write the failing test** for `src/lib/env.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readPublicEnv } from "./env.ts";

test("readPublicEnv throws when supabase url missing", () => {
  assert.throws(() => readPublicEnv({}), /NEXT_PUBLIC_SUPABASE_URL/);
});

test("readPublicEnv returns values when present", () => {
  const e = readPublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    ADMIN_EMAIL: "a@b.com",
  });
  assert.equal(e.supabaseUrl, "https://x.supabase.co");
  assert.equal(e.adminEmail, "a@b.com");
});
```

- [ ] **Step 4: Run test, expect FAIL** — `npm test` → cannot find `./env.ts`.

- [ ] **Step 5: Implement `src/lib/env.ts`:**

```ts
type Source = Record<string, string | undefined>;

export function readPublicEnv(src: Source = process.env) {
  const supabaseUrl = src.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = src.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = src.ADMIN_EMAIL;
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!adminEmail) throw new Error("Missing ADMIN_EMAIL");
  return { supabaseUrl, supabaseAnonKey, adminEmail };
}

export const env = readPublicEnv();

export function serverEnv(src: Source = process.env) {
  const serviceRoleKey = src.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = src.RESEND_API_KEY;
  const contactEmail = src.CONTACT_NOTIFICATION_EMAIL;
  const contactFrom = src.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return { serviceRoleKey, resendApiKey, contactEmail, contactFrom };
}
```

- [ ] **Step 6: Run test, expect PASS** — `npm test`.

- [ ] **Step 7: Commit** — `feat: add deps and typed env access`.

---

### Task 2: Database schema migration

**Files:**
- Create: `supabase/migrations/0001_schema.sql`

**Interfaces:**
- Produces: tables `profile, site_sections, projects, experiences, skills, achievements, education, posts, contact_messages` with the columns named in the spec §5. Later tasks/types depend on these exact column names.

- [ ] **Step 1: Write `0001_schema.sql`** (exact columns — later TS types must match):

```sql
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
```

- [ ] **Step 2: Verify SQL parses** — note in commit that the user runs this in the Supabase SQL editor / CLI (we cannot execute it here). Sanity-check for typos by eye.

- [ ] **Step 3: Commit** — `feat(db): add schema migration`.

---

### Task 3: RLS policies migration

**Files:**
- Create: `supabase/migrations/0002_rls.sql`

- [ ] **Step 1: Write `0002_rls.sql`:**

```sql
-- helper: is the caller the single admin?
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') =
         current_setting('app.admin_email', true);
$$;
-- NOTE: set the GUC once per project:  alter database postgres set app.admin_email = 'harshp6421@gmail.com';
-- (documented in supabase/README; the user runs it with their ADMIN_EMAIL.)

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
create policy pub_read_profile      on public.profile          for select using (true);
create policy pub_read_experiences  on public.experiences      for select using (true);
create policy pub_read_skills       on public.skills           for select using (true);
create policy pub_read_achievements on public.achievements     for select using (true);
create policy pub_read_education    on public.education        for select using (true);
create policy pub_read_sections     on public.site_sections    for select using (enabled = true or public.is_admin());
create policy pub_read_projects     on public.projects         for select using (status = 'published' or public.is_admin());
create policy pub_read_posts        on public.posts            for select using (status = 'published' or public.is_admin());

-- Contact: anon may insert only
create policy pub_insert_messages   on public.contact_messages for insert with check (true);

-- Admin full CRUD on every table
create policy admin_all_profile      on public.profile          for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_sections     on public.site_sections    for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_projects     on public.projects         for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_experiences  on public.experiences      for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_skills       on public.skills           for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_achievements on public.achievements     for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_education    on public.education        for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_posts        on public.posts            for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_messages     on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
```

- [ ] **Step 2: Create `supabase/README.md`** documenting the two manual steps: (a) run migrations in order, (b) `alter database postgres set app.admin_email = '<ADMIN_EMAIL>';`, (c) disable public sign-ups in Auth settings and create the single admin user with that email.

- [ ] **Step 3: Commit** — `feat(db): add RLS policies`.

---

### Task 4: Storage bucket migration

**Files:**
- Create: `supabase/migrations/0003_storage.sql`

- [ ] **Step 1: Write `0003_storage.sql`:**

```sql
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');
create policy media_admin_write on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_update on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());
create policy media_admin_delete on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());
```

- [ ] **Step 2: Commit** — `feat(db): add media storage bucket + policies`.

---

### Task 5: Seed content (Harsh's real data)

**Files:**
- Create: `supabase/seed.sql`

**Interfaces:**
- Depends on GitHub enrichment (Task 6) for project links; leave `links` best-effort and fill from enrichment.

- [ ] **Step 1: Write `supabase/seed.sql`** — idempotent (`on conflict do nothing` / delete-then-insert per table). Include:
  - `profile`: full_name `Harsh Pandey`, title `Full Stack Developer`, location `Dwarka, New Delhi, India`, email `harshp6421@gmail.com`, phone `+91 7007157057`, `resume_url` `/resume.pdf`, `socials` `{"github":"https://github.com/whiteknight16","linkedin":"https://www.linkedin.com/in/harshpandey61/"}`, headline + bio from spec summary.
  - `site_sections`: rows for `about, experience, skills, projects, achievements, education, contact` (`enabled=true`, sort_order 1..7).
  - `experiences`: SkillSync / EY / Ransh with the exact bullet `highlights[]` from the spec content.
  - `skills`: all categories & items from the spec (Languages, Frontend, Backend, Databases & ORMs, AI / GenAI, DevOps & Tooling).
  - `projects`: Interview Genie, Gymkhana, REC Mirzapur (status `published`), plus any strong repos found in enrichment.
  - `achievements`: GSSoC Top 100; SIH 1st (2023, 2024); SIH 2024 finalist; Web Dev team 2 yrs / Team Lead; REC Mirzapur site.
  - `education`: B.Tech CSE, Rajkiya Engineering College Sonbhadra, Sep 2021–Jun 2025.

Full content is in `docs/superpowers/specs/2026-07-05-portfolio-cms-design.md §5.2` and the original prompt — copy verbatim.

- [ ] **Step 2: Commit** — `feat(db): seed real portfolio content`.

---

### Task 6: GitHub enrichment (research)

**Files:**
- Modify: `supabase/seed.sql` (project links + any extra projects)
- Create: `docs/superpowers/notes/github-repos.md` (findings)

- [ ] **Step 1:** Fetch public repos: `curl -s "https://api.github.com/users/whiteknight16/repos?per_page=100&sort=updated"` and record notable repos (name, description, homepage, html_url, stars, language).
- [ ] **Step 2:** Match Interview Genie / Gymkhana / REC Mirzapur to their repos; capture `html_url` (repo) and `homepage` (live) into `links`. Add up to 2 additional strong repos as extra `projects` rows if clearly portfolio-worthy.
- [ ] **Step 3:** Update `seed.sql` accordingly. If the API is rate-limited/unavailable, leave `links` empty and note it — do not block.
- [ ] **Step 4: Commit** — `feat(db): enrich seeded projects with GitHub links`.

---

## Phase 2 — Supabase clients, auth, proxy

### Task 7: Supabase clients + types

**Files:**
- Create: `src/lib/types.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/browser.ts`, `src/lib/supabase/admin.ts`

**Interfaces:**
- Produces: `createServerSupabase()` (async, cookie-bound, for RSC/actions), `createBrowserSupabase()`, `createAdminSupabase()` (service role, server-only). `types.ts` exports row types `Profile, SiteSection, Project, Experience, Skill, Achievement, Education, Post, ContactMessage` matching Task 2 columns.

- [ ] **Step 1: Consult docs** — read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md` (cookies is async) before writing.

- [ ] **Step 2: Write `src/lib/types.ts`** — TS interfaces mirroring the schema columns exactly (e.g. `Project.status: 'draft' | 'published'`, `tags: string[]`, `links: { live?: string; repo?: string }`).

- [ ] **Step 3: Write `src/lib/supabase/server.ts`:**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* called from a RSC (read-only) — proxy.ts refreshes instead */
        }
      },
    },
  });
}
```

- [ ] **Step 4: Write `src/lib/supabase/browser.ts`:**

```ts
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createBrowserSupabase() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
```

- [ ] **Step 5: Write `src/lib/supabase/admin.ts`** (server-only; service role, no session persistence):

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env";

export function createAdminSupabase() {
  return createClient(env.supabaseUrl, serverEnv().serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

- [ ] **Step 6:** `npm run build` type-check passes (no runtime DB call yet). Commit — `feat: add supabase clients and row types`.

---

### Task 8: proxy.ts (session refresh + /admin guard)

**Files:**
- Create: `proxy.ts` (repo root)

**Interfaces:**
- Consumes: `env`. Produces: refreshed auth cookies on every request; redirects unauthenticated `/admin/**` (except `/admin/login`) to `/admin/login`.

- [ ] **Step 1: Consult docs** — read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` and confirm the `proxy` export name, `config.matcher`, and nodejs runtime.

- [ ] **Step 2: Write `proxy.ts`:**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  if (isAdminArea && !isLogin && (!user || user.email !== env.adminEmail)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)"],
};
```

- [ ] **Step 3: Verify** — `npm run dev`, visit `/admin` → redirects to `/admin/login` (login page comes next task; a 404 there is fine at this step, redirect itself proves the guard). Commit — `feat: add proxy auth guard`.

---

### Task 9: Auth helpers + login page

**Files:**
- Create: `src/lib/auth.ts`, `src/app/admin/login/page.tsx`, `src/app/admin/login/actions.ts`, `src/components/admin/login-form.tsx`

**Interfaces:**
- Produces: `requireAdmin()` → returns `user` or `redirect('/admin/login')`; `getSessionUser()` → `User | null`; `signInAction(prevState, formData)`; `signOutAction()`.

- [ ] **Step 1: Write `src/lib/auth.ts`:**

```ts
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function getSessionUser() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user && user.email === env.adminEmail ? user : null;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}
```

- [ ] **Step 2: Write `src/app/admin/login/actions.ts`** (`"use server"`): `signInAction` validates email+password with Zod, rejects if email !== `env.adminEmail`, calls `supabase.auth.signInWithPassword`, redirects to `/admin` on success, returns `{ error }` on failure. `signOutAction` calls `supabase.auth.signOut()` and redirects to `/admin/login`.

- [ ] **Step 3: Write `login-form.tsx`** (client, `useActionState`) + `login/page.tsx` (renders the form, minimal centered card). If already authed, redirect to `/admin`.

- [ ] **Step 4: Verify** — with a real Supabase user (user sets up), logging in reaches `/admin`; wrong email is rejected. Commit — `feat: add admin auth + login`.

---

## Phase 3 — Admin shell + core content CRUD

### Task 10: Admin shell, nav, dashboard + reusable primitives

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/components/admin/shell.tsx`, `src/components/admin/submit-button.tsx`, `src/components/admin/image-upload.tsx`, `src/app/admin/actions/upload.ts`
- Add shadcn UI as needed (`npx shadcn@latest add button input textarea label card table switch dialog sonner tabs badge`)

**Interfaces:**
- Produces:
  - `<AdminShell>` sidebar nav (Dashboard, Profile, Sections, Projects, Experience, Skills, Achievements, Education, Blog, Messages, Sign out) — responsive (drawer on mobile).
  - `<SubmitButton>` — `useFormStatus` pending state.
  - `<ImageUpload name folder onUploaded>` — client component that uploads to `media` bucket via `uploadImageAction` and returns a public URL.
  - `uploadImageAction(formData)` → `{ url }` (server action; uses browser/server session; path `folder/<crypto uuid>.<ext>`).

- [ ] **Step 1:** `admin/layout.tsx` calls `await requireAdmin()` then renders `<AdminShell>{children}</AdminShell>`.
- [ ] **Step 2:** Build `AdminShell` (Base UI/shadcn), active-link highlight, mobile drawer, sign-out button posting `signOutAction`.
- [ ] **Step 3:** Dashboard `admin/page.tsx` — count cards (projects, posts, unread messages) from `createServerSupabase`, plus 5 latest messages.
- [ ] **Step 4:** `uploadImageAction` + `<ImageUpload>` with preview.
- [ ] **Step 5:** Verify pages render behind auth; upload returns a public URL. Commit — `feat(admin): shell, dashboard, image upload`.

---

### Task 11: Validation schemas + pure helpers (TDD)

**Files:**
- Create: `src/lib/format.ts`, `src/lib/format.test.ts`, `src/lib/sanitize.ts`, `src/lib/validation.ts`

**Interfaces:**
- Produces: `slugify(input): string`, `readingMinutes(html): number`, `dateRange(start, end, isCurrent): string`, `sanitizeHtml(html): string`, and Zod schemas: `profileSchema, sectionSchema, projectSchema, experienceSchema, skillSchema, achievementSchema, educationSchema, postSchema, contactSchema`.

- [ ] **Step 1: Write `format.test.ts`:**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, readingMinutes, dateRange } from "./format.ts";

test("slugify lowercases and hyphenates", () => {
  assert.equal(slugify("Interview Genie — AI!"), "interview-genie-ai");
});
test("readingMinutes: ~200 wpm, min 1", () => {
  assert.equal(readingMinutes("<p>" + "word ".repeat(400) + "</p>"), 2);
  assert.equal(readingMinutes("<p>short</p>"), 1);
});
test("dateRange formats current role", () => {
  assert.equal(dateRange("2025-03-01", null, true), "Mar 2025 – Present");
});
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement `format.ts` (use `slugify` pkg or a small local regex; strip HTML tags for word count via regex; `date-fns/format`). **Step 4:** Run → PASS.
- [ ] **Step 5:** `sanitize.ts` wraps `isomorphic-dompurify` with an allowlist (headings, p, a, ul/ol/li, strong/em, code, pre, blockquote, img[src,alt], hr, br). **Step 6:** Write `validation.ts` Zod schemas mirroring the DB columns (coerce empties, transform tags CSV → array where the form sends CSV).
- [ ] **Step 7: Commit** — `feat: validation schemas + pure helpers with tests`.

---

### Task 12: Profile editor

**Files:**
- Create: `src/app/admin/profile/page.tsx`, `src/app/admin/profile/actions.ts`, `src/components/admin/profile-form.tsx`

**Interfaces:**
- Consumes: `profileSchema`, `<ImageUpload>`, `createServerSupabase`. Produces: `updateProfileAction(prevState, formData)` → upserts the singleton row, `revalidatePath('/')`.

- [ ] **Step 1:** Page loads the single `profile` row. **Step 2:** `profile-form.tsx` (client, `useActionState`) with fields: full_name, title, headline, bio (textarea), location, email, phone, socials (github/linkedin/x/website), avatar (`<ImageUpload>`), resume_url (upload PDF or text). **Step 3:** `updateProfileAction` validates, `sanitizeHtml` not needed (plain text), `update` where `singleton=true`, revalidate `/`.
- [ ] **Step 4:** Verify edit persists & reflects on home after Phase 4. Commit — `feat(admin): profile editor`.

---

### Task 13: Sections manager (enable/disable + reorder)

**Files:**
- Create: `src/app/admin/sections/page.tsx`, `src/app/admin/sections/actions.ts`, `src/components/admin/sections-manager.tsx`

**Interfaces:**
- Produces: `toggleSectionAction(key, enabled)`, `reorderSectionsAction(orderedKeys: string[])`; both `revalidatePath('/')`.

- [ ] **Step 1:** Page lists `site_sections` ordered by `sort_order`. **Step 2:** `sections-manager.tsx` — each row: label, a `Switch` (enabled), up/down buttons to reorder (simple, no dnd lib). **Step 3:** Actions update rows and revalidate `/`.
- [ ] **Step 4:** Verify toggling a section hides it on home (Phase 4). Commit — `feat(admin): section toggle + reorder`.

---

### Task 14: Projects CRUD (reference pattern)

**Files:**
- Create: `src/app/admin/projects/page.tsx`, `src/app/admin/projects/new/page.tsx`, `src/app/admin/projects/[id]/page.tsx`, `src/app/admin/projects/actions.ts`, `src/components/admin/project-form.tsx`, `src/components/admin/entity-table.tsx`

**Interfaces:**
- Produces: reusable `<EntityTable columns rows editHref onDelete>`; `createProjectAction`, `updateProjectAction`, `deleteProjectAction`. Slug auto-derived via `slugify(title)` when blank; `content` sanitized; `published_at` set when status flips to published; all revalidate `/`, `/projects`, `/projects/[slug]`.

- [ ] **Step 1:** List page uses `<EntityTable>` (title, status badge, featured, actions). **Step 2:** `project-form.tsx` fields: title, slug, summary, tags (CSV), cover (`<ImageUpload>`), links.live, links.repo, featured (Switch), status (draft/published), sort_order, content (`<RichTextEditor>` from Task 20 — until then, a textarea; swap in Phase 5). **Step 3:** actions with Zod + sanitize + slug uniqueness (append `-2` on conflict). **Step 4:** delete with confirm dialog.
- [ ] **Step 5:** Verify create/edit/delete; slug uniqueness. Commit — `feat(admin): projects CRUD + reusable entity table`.

---

### Task 15: Experience, Skills, Achievements, Education CRUD

**Files (per entity, following Task 14's pattern with `<EntityTable>` + a form component):**
- `src/app/admin/experience/{page,new/page,[id]/page,actions}.tsx` + `experience-form.tsx`
- `src/app/admin/skills/…` + `skill-form.tsx`
- `src/app/admin/achievements/…` + `achievement-form.tsx`
- `src/app/admin/education/…` + `education-form.tsx`

**Interfaces:**
- Produces `create/update/delete` actions per entity, each Zod-validated and `revalidatePath('/')`.
- Field sets: **experience** {role, company, location, start_date, end_date, is_current, highlights (textarea → lines → text[]), sort_order}; **skills** {name, category, sort_order}; **achievements** {title, description, sort_order}; **education** {degree, institution, location, start_date, end_date, description, sort_order}.

- [ ] **Step 1–4 (repeat per entity):** list page with `<EntityTable>`; form component; actions (create/update/delete) using the matching Zod schema; verify CRUD. Reuse `<EntityTable>`, `<SubmitButton>`, form-field markup from Task 14 — no new patterns.
- [ ] **Step 5: Commit** each entity separately — `feat(admin): experience CRUD`, `feat(admin): skills CRUD`, `feat(admin): achievements CRUD`, `feat(admin): education CRUD`.

---

## Phase 4 — Public site

### Task 16: Theme + public layout (nav, footer, toggle)

**Files:**
- Modify: `src/app/layout.tsx` (remove hard-coded dark bg; add `suppressHydrationWarning`, wrap `<ThemeProvider>`)
- Create: `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`, `src/app/(site)/layout.tsx`, `src/components/public/nav.tsx`, `src/components/public/footer.tsx`, `src/components/public/reveal.tsx`

**Interfaces:**
- Produces: `<ThemeProvider>` (next-themes, `attribute="class"`, `defaultTheme="system"`); `<ThemeToggle>`; `<SiteNav>` (links to home section anchors + Blog + resume button; sticky, responsive, mobile menu); `<SiteFooter>`; `<Reveal>` (Motion scroll-in wrapper, respects `prefers-reduced-motion`).

- [ ] **Step 1: Consult docs** — `13-fonts.md`, `14-metadata-and-og-images.md`.
- [ ] **Step 2:** Update root layout: keep font vars, set `<body className="bg-background text-foreground">`, wrap children in `<ThemeProvider>`. **Step 3:** Build nav/footer/toggle/reveal. Nav reads `profile` (name/resume) via a server component wrapper. **Step 4:** Verify light/dark toggle + responsive nav.
- [ ] **Step 5: Commit** — `feat(site): theme provider, nav, footer`.

---

### Task 17: Data-fetch layer for public content

**Files:**
- Create: `src/lib/content.ts`

**Interfaces:**
- Produces typed fetchers (all use `createServerSupabase`, RLS-filtered): `getProfile()`, `getEnabledSections()`, `getPublishedProjects()`, `getProjectBySlug(slug)`, `getExperiences()`, `getSkillsByCategory()`, `getAchievements()`, `getEducation()`, `getPublishedPosts()`, `getPostBySlug(slug)`. Each returns typed rows from `types.ts`, sorted appropriately.

- [ ] **Step 1:** Implement each fetcher with explicit `.select()` and ordering. **Step 2:** `getSkillsByCategory` groups into `{ category, items }[]`. **Step 3:** Commit — `feat(site): public content data layer`.

---

### Task 18: Home page + section components

**Files:**
- Modify: `src/components/site-home.tsx` (compose enabled sections in order)
- Create: `src/components/sections/{hero,about,experience,skills,projects-preview,achievements,education,contact}.tsx`
- Create/confirm: `src/app/page.tsx` already routes `SiteHome` behind `isLaunched`.

**Interfaces:**
- Consumes: `content.ts` fetchers, `<Reveal>`. Produces: `<SiteHome>` server component that fetches profile + enabled sections, renders `<Hero>` then maps enabled sections (`about|experience|skills|projects|achievements|education|contact`) to their components in `sort_order`.

- [ ] **Step 1:** `Hero` — name, title, headline, primary CTAs (View work, Download résumé, Contact), socials; subtle Motion entrance. **Step 2:** Build each section component (minimal & refined; responsive grids; `<Reveal>` on scroll). `projects-preview` shows top 3 featured/recent with link to `/projects`. `contact` renders the form (Task 24) — until then a placeholder with email/phone/links. **Step 3:** `SiteHome` composition respecting toggles + order.
- [ ] **Step 4: Verify** with `LAUNCHED=true` locally: home shows seeded content; toggling a section in admin hides it. Commit — `feat(site): home page with data-driven sections`.

---

### Task 19: Projects list + detail (with tag filter)

**Files:**
- Create: `src/app/(site)/projects/page.tsx`, `src/app/(site)/projects/[slug]/page.tsx`, `src/components/public/project-card.tsx`, `src/components/public/tag-filter.tsx`, `src/components/public/prose.tsx`

**Interfaces:**
- Consumes: `getPublishedProjects`, `getProjectBySlug`. Produces: `<TagFilter tags value onChange>` (client, URL-synced or local state), `<Prose html>` (renders sanitized HTML in a styled container), `<ProjectCard>`. Detail page `generateMetadata({ params })` (await params), `generateStaticParams` optional.

- [ ] **Step 1:** List page (server) fetches projects, passes to a client wrapper holding `<TagFilter>` + grid. **Step 2:** Detail page: cover, title, tags, links, `<Prose html={project.content}>`; 404 via `notFound()` if missing. **Step 3:** `generateMetadata` builds title/description/OG. **Step 4:** Verify filter + detail + metadata.
- [ ] **Step 5: Commit** — `feat(site): projects list + detail with tag filter`.

---

## Phase 5 — Blog

### Task 20: Rich text editor (Tiptap)

**Files:**
- Create: `src/components/editor/rich-text-editor.tsx`, `src/components/editor/toolbar.tsx`

**Interfaces:**
- Produces: `<RichTextEditor name value onChange>` — controlled Tiptap (StarterKit + Link + Image + Placeholder), toolbar (bold, italic, h2/h3, lists, quote, code, link, image-upload via `uploadImageAction`). Serializes to HTML into a hidden input named `name` for form submission.

- [ ] **Step 1:** Build editor (client, `"use client"`), image button uploads through `uploadImageAction` and inserts URL. **Step 2:** Keep a hidden `<input name>` synced to `editor.getHTML()`. **Step 3:** Swap the textarea in `project-form.tsx` for `<RichTextEditor>`. **Step 4:** Verify editing + image insert.
- [ ] **Step 5: Commit** — `feat(editor): Tiptap rich text editor`.

---

### Task 21: Blog CRUD (admin)

**Files:**
- Create: `src/app/admin/blog/{page,new/page,[id]/page,actions}.tsx`, `src/components/admin/post-form.tsx`

**Interfaces:**
- Produces: `createPostAction`, `updatePostAction`, `deletePostAction` — Zod + `sanitizeHtml(content)` + `readingMinutes` + slug uniqueness + `published_at` on publish; `revalidatePath('/blog')`, `/blog/[slug]`, `/`.

- [ ] **Step 1:** List page `<EntityTable>` (title, status, published_at). **Step 2:** `post-form.tsx`: title, slug, excerpt, cover (`<ImageUpload>`), tags (CSV), status, content (`<RichTextEditor>`). **Step 3:** actions. **Step 4:** Verify draft→publish. Commit — `feat(admin): blog CRUD`.

---

### Task 22: Blog public (list + article, tag filter)

**Files:**
- Create: `src/app/(site)/blog/page.tsx`, `src/app/(site)/blog/[slug]/page.tsx`, `src/components/public/post-card.tsx`

**Interfaces:**
- Consumes: `getPublishedPosts`, `getPostBySlug`, `<TagFilter>`, `<Prose>`. Produces article page with `generateMetadata` (await params), reading time, published date, `<Prose html={post.content}>`.

- [ ] **Step 1:** List with tag filter + cards. **Step 2:** Article page renders sanitized HTML, 404 when missing/draft. **Step 3:** Verify. Commit — `feat(site): blog list + article`.

---

## Phase 6 — Contact

### Task 23: Contact server action + Resend

**Files:**
- Create: `src/app/(site)/contact/actions.ts` (or colocate under a contact route), `src/lib/email.ts`

**Interfaces:**
- Produces: `sendContactAction(prevState, formData)` — Zod `contactSchema` (name, email, message, honeypot), reject if honeypot filled, insert into `contact_messages` (anon insert allowed by RLS), then `sendContactEmail()` via Resend to `CONTACT_NOTIFICATION_EMAIL`. Returns `{ ok }` / `{ error }`.

- [ ] **Step 1:** `email.ts` wraps `new Resend(serverEnv().resendApiKey)`; `sendContactEmail({name,email,message})`; if no key, log & skip (don't crash). **Step 2:** `sendContactAction`. **Step 3:** Unit-test the honeypot/validation branch of `contactSchema` in `validation.test.ts`. **Step 4:** Commit — `feat(contact): server action + Resend email`.

---

### Task 24: Contact form UI + messages admin view

**Files:**
- Create: `src/components/sections/contact-form.tsx` (client), `src/app/admin/messages/page.tsx`, `src/app/admin/messages/actions.ts`
- Modify: `src/components/sections/contact.tsx` to render the form + profile email/phone/GitHub/LinkedIn + Download Résumé button.

**Interfaces:**
- Produces: `<ContactForm>` (`useActionState`, honeypot hidden field, success/error states); `markMessageReadAction(id)`.

- [ ] **Step 1:** Contact section: two columns — contact details/socials/résumé button + the form. **Step 2:** Admin messages: list `contact_messages` newest first, mark-read action, unread badge in nav/dashboard. **Step 3:** Verify submit → row inserted + email attempted; admin sees it. Commit — `feat(contact): form UI + messages admin`.

---

## Phase 7 — SEO, polish, launch

### Task 25: Metadata, sitemap, robots, OG, favicon

**Files:**
- Modify: `src/app/layout.tsx` (dynamic `metadata` from profile: title template, description, OG), `src/lib/config.ts`
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx` (or static OG)
- Confirm favicon in `src/app/icon.svg` (exists).

**Interfaces:**
- Produces: `sitemap()` listing `/`, `/projects`, each project slug, `/blog`, each post slug; `robots()`; site-wide metadata with OG/Twitter cards.

- [ ] **Step 1: Consult docs** — `14-metadata-and-og-images.md`, `03-api-reference/04-functions/generate-metadata.md`, sitemap/robots file conventions. Note async `params`/`id` where relevant. **Step 2:** Implement. **Step 3:** Verify `/sitemap.xml`, `/robots.txt`, OG preview. Commit — `feat(seo): metadata, sitemap, robots, OG`.

---

### Task 26: Accessibility, responsive & motion polish

**Files:** touch section/public components as needed.

- [ ] **Step 1:** Keyboard nav, focus-visible rings, `aria` labels on icon buttons, alt text, color-contrast check in both themes. **Step 2:** Verify at 375px / 768px / 1280px. **Step 3:** Ensure all Motion respects `prefers-reduced-motion`. **Step 4:** Commit — `polish: a11y + responsive + motion`.

---

### Task 27: Docs, resume placeholder, launch flip

**Files:**
- Modify: `README.md` (setup: env, run migrations, seed, create admin user, set `app.admin_email`, disable signups, add `/public/resume.pdf`, flip `LAUNCHED`)
- Create: `public/resume.pdf` placeholder note (user drops the real PDF)
- Confirm: `src/app/page.tsx` serves `SiteHome` when `LAUNCHED=true`.

- [ ] **Step 1:** Rewrite README with the full setup runbook. **Step 2:** Final `npm run build` + `npm test` pass. **Step 3:** Manual smoke of the whole flow. **Step 4:** Commit — `docs: setup runbook + launch instructions`.

---

## Self-Review notes (author)

- **Spec coverage:** profile/bio→T12/T18; sections toggle→T13; projects→T14/T19; experience/skills→T15/T18; achievements/education→T15/T18; blog+WYSIWYG→T20–22; contact+Resend→T23–24; admin single-auth→T8–10; Supabase+RLS+storage→T2–4,T7; seed real content→T5–6; tags+filter→T19,T22; light/dark+motion+responsive→T16,T18,T26; SEO/sitemap/favicon/resume button→T25,T24,T27. All covered.
- **Types:** row types (T7) are the shared contract; validation schemas (T11) mirror them; actions consume both. `<EntityTable>`, `<ImageUpload>`, `<RichTextEditor>`, `<TagFilter>`, `<Prose>`, `<Reveal>` are the reused components — defined once, consumed by name.
- **Next 16:** proxy (not middleware), async cookies/params, `revalidatePath` over `revalidateTag` — captured in Global Constraints and per-task "consult docs" steps.
