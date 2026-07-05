# Portfolio + Admin CMS — Design Spec

**Date:** 2026-07-05
**Owner:** Harsh Pandey (harsh@proaibots.com)
**Branch:** `feat/portfolio-site`
**Status:** Approved design → implementation planning

## 1. Summary

A professional software-engineer portfolio backed by a lightweight, single-admin
CMS. All public content — profile/bio, projects, experience, skills, blog posts,
and which sections appear — lives in Supabase and is managed from a private
`/admin` panel. The existing `LAUNCHED` server flag stays as the launch/rollback
kill-switch; the current `SiteHome` placeholder becomes the real site.

Non-goals (v1): multi-user roles, comments, newsletter, analytics dashboards,
i18n, e-commerce.

## 2. Stack

Building on the existing repo:

- Next.js 16 (App Router, RSC), React 19, TypeScript
- Tailwind 4 + shadcn (base-nova style) + Base UI + lucide-react
- Motion (`motion/react`) for animation
- next-themes for light/dark

New dependencies:

- `@supabase/supabase-js`, `@supabase/ssr` — DB, auth, storage (SSR cookie auth)
- `@tiptap/react` + starter-kit + image/link extensions — WYSIWYG blog editor
- `resend` — contact email notifications
- `zod` — input validation (forms, server actions)
- `slugify`, `isomorphic-dompurify`, `date-fns` — helpers

## 3. Decisions (from brainstorming)

- **Identity:** software engineer.
- **Sections:** About/Bio, Projects, Experience/Résumé, Contact, Skills — all
  admin-toggleable and reorderable.
- **Blog editor:** rich text (WYSIWYG, Tiptap).
- **Admin:** single admin, Supabase Auth email/password locked to `ADMIN_EMAIL`.
- **Supabase:** user provisions the project and pastes keys; we ship SQL
  migrations and env docs. **No MCP provisioning.**
- **Contact:** store in DB + email via Resend.
- **Aesthetic:** minimal & refined; light + dark toggle (system default).
- **Motion:** subtle, purposeful (scroll-reveal, staggered entrances).
- **Responsive:** mobile-first throughout.
- **Tags:** projects + posts support tags with client-side filtering.

## 4. Architecture

### 4.1 Supabase clients (`src/lib/supabase/`)

- `server.ts` — SSR client bound to Next cookies (`@supabase/ssr`), for RSC and
  server actions. Respects the logged-in user's RLS.
- `browser.ts` — browser client for client components (e.g. Tiptap image upload).
- `admin.ts` — service-role client, **server-only**, used sparingly for
  privileged operations (e.g. verifying admin, storage ops that need it). Never
  imported into client code.

### 4.2 Public site routes

- `/` — Home. Reads `site_sections` (enabled, ordered) and renders each enabled
  section from its data. Hero always renders from `profile`.
- `/projects`, `/projects/[slug]` — list + detail. Tag filter on list (client).
- `/blog`, `/blog/[slug]` — list + article. Tag filter on list (client).
- Public reads use the anon/SSR client; RLS returns only published/enabled rows.
- ISR/revalidation: pages use `revalidate` + on-write `revalidatePath` from admin
  actions so edits appear without a redeploy.

### 4.3 Admin routes (`/admin`)

- `middleware.ts` refreshes the Supabase session and redirects unauthenticated
  requests for `/admin/**` (except `/admin/login`) to the login page. A
  server-side check additionally confirms `user.email === ADMIN_EMAIL`.
- Pages: `/admin` (dashboard), `/admin/login`, `/admin/profile`,
  `/admin/sections`, `/admin/projects`, `/admin/experience`, `/admin/skills`,
  `/admin/blog`, `/admin/messages`.
- All mutations are **server actions** validated with Zod, then `revalidatePath`.

### 4.4 Theming

Wrap the app in `next-themes` `ThemeProvider` (class strategy — `globals.css`
already defines `.dark` tokens). Layout stops hard-coding the dark background;
uses `bg-background text-foreground`. A toggle lives in the public nav. The
coming-soon page keeps its current standalone dark look.

## 5. Data model (SQL migrations)

Delivered as `supabase/migrations/*.sql`. All tables in `public`. `id uuid default
gen_random_uuid()`, `created_at`/`updated_at timestamptz default now()`.

- **`profile`** (singleton, enforced by a single fixed row / `check`): `full_name`,
  `headline`, `bio` (text), `avatar_url`, `resume_url`, `location`, `email`,
  `socials jsonb` (e.g. `{github, linkedin, x, website}`).
- **`site_sections`**: `key` (unique: `about|projects|experience|skills|contact`),
  `label`, `enabled bool`, `sort_order int`. Seeded with defaults.
- **`projects`**: `title`, `slug` (unique), `summary`, `content` (sanitized HTML),
  `cover_image_url`, `tags text[]`, `links jsonb` (`{live, repo}`), `featured bool`,
  `status` (`draft|published`), `sort_order int`, `published_at`.
- **`experiences`**: `role`, `company`, `location`, `start_date date`,
  `end_date date null`, `is_current bool`, `description`, `sort_order int`.
- **`skills`**: `name`, `category`, `sort_order int`.
- **`posts`**: `title`, `slug` (unique), `excerpt`, `content` (sanitized HTML),
  `cover_image_url`, `tags text[]`, `status` (`draft|published`),
  `reading_minutes int`, `published_at`.
- **`contact_messages`**: `name`, `email`, `message`, `is_read bool`, `created_at`.

### 5.1 RLS policies

- Enable RLS on every table.
- **Public/anon:** `SELECT` only, and only rows that are visible:
  - `projects`/`posts`: `status = 'published'`.
  - `site_sections`: `enabled = true`.
  - `profile`, `experiences`, `skills`: `SELECT` allowed (public content).
  - `contact_messages`: **no** anon `SELECT`.
- **Contact insert:** anon may `INSERT` into `contact_messages` only (rate/spam
  mitigated by honeypot + server action; no select-back).
- **Admin (authenticated & email = ADMIN_EMAIL):** full CRUD on all tables. Admin
  identity enforced in server actions; a DB helper checks `auth.jwt()->>'email'`.

### 5.2 Storage

One public bucket `media` (public read; write restricted to authenticated admin
via storage policy). Holds project covers, blog covers, inline post images,
avatar, and the résumé PDF. Uploads go through server actions / browser client
with the user's session.

## 6. Rich text

Tiptap in the admin (StarterKit + Link + Image). On save, serialize to HTML and
**sanitize with DOMPurify server-side** before persisting to `content`. Public
pages render the stored HTML inside a `prose`-styled container. Inline images
upload to the `media` bucket and are inserted by URL. `reading_minutes` computed
from text length on save.

## 7. Contact flow

Public form (name, email, message + hidden honeypot) → server action:
1. Validate with Zod; reject if honeypot filled.
2. Insert into `contact_messages`.
3. Send notification email via Resend to `CONTACT_NOTIFICATION_EMAIL`.
4. Return success/error to the form (progressive enhancement; works styled).

## 8. Environment variables

Documented in `.env.example` (user fills real values):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `ADMIN_EMAIL` (the single allowed admin login)
- `RESEND_API_KEY`
- `CONTACT_NOTIFICATION_EMAIL` (destination for contact emails)
- `LAUNCHED` (existing flag; `true` to serve the real site)

Admin account is created once by the user in the Supabase dashboard (sign-ups
disabled in Auth settings); its email must equal `ADMIN_EMAIL`.

## 9. Testing

- `node --test` (existing runner) for pure logic: slugify/uniqueness helper,
  `reading_minutes` calc, section-ordering, Zod schemas, HTML sanitization
  behavior.
- Manual/E2E smoke checklist per phase (login, CRUD, publish→appears on site,
  contact→email, section toggle→home updates).
- RLS verified with a documented SQL check (anon cannot read drafts/messages).

## 10. Build phases

1. **Supabase foundation** — deps, clients, migrations + seed, storage bucket,
   `.env.example`, auth settings notes.
2. **Admin shell + auth** — middleware, login, layout/nav, dashboard, sign-out.
3. **Core content CRUD** — profile, sections (toggle/reorder), projects,
   experience, skills; image upload.
4. **Public site** — theme provider, nav/footer, data-driven home sections,
   projects list/detail with tag filter, motion, responsive polish.
5. **Blog** — Tiptap editor + upload, posts CRUD, public list/detail with tag
   filter, sanitized rendering.
6. **Contact** — form + server action + Resend + messages admin view.
7. **Polish** — SEO/metadata/OG, sitemap, `revalidate` wiring, a11y, tests,
   README/env docs, flip `SiteHome` to render the real site.

## 11. Risks / notes

- **AGENTS.md warning:** this Next.js has breaking changes; consult
  `node_modules/next/dist/docs/` before using Next APIs (middleware, server
  actions, metadata, image, revalidate) rather than relying on training data.
- **Service-role key** must never reach the client bundle — keep in `admin.ts`
  server-only module.
- **Sanitize** all rich-text HTML before render even though only admin authors it.
- Keep files focused (one entity per admin module) to stay within clean
  boundaries.
