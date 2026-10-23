# Portfolio + Admin CMS

A personal portfolio site built on Next.js 16, backed by a single-admin
Supabase content management system. The public site (home, about, notes,
projects) is fully data-driven; you edit everything through `/admin` — no code
changes needed to update content.

## Features

- **Public site**: home, about, project case studies, Notes (short write-ups
  with tags, an RSS feed and generated share cards), a newsletter subscribe
  form, contact form, résumé link, light/dark theme, motion, fully responsive.
- **Admin CMS** (`/admin`): single-user Supabase Auth login. Manage profile
  and socials, toggle/reorder homepage sections, projects, work experience,
  skills, achievements, education, notes (rich-text editor), newsletter
  subscribers (with CSV export), and incoming contact messages.
- **Contact form**: submissions are stored in Supabase and emailed to you
  via Resend.

## Prerequisites

- Node.js 20 or later (this repo is developed against Node 22+; anything
  compatible with Next.js 16 works)
- npm (ships with Node)
- A [Supabase](https://supabase.com) project (free tier is fine)
- A [Resend](https://resend.com) account for outgoing email (free tier is fine)

## Local dev quickstart

```bash
npm install
cp .env.example .env.local   # then fill in the values, see below
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) to see the live site
(`npm run dev` runs on port 3002); `/admin` is reachable at
[http://localhost:3002/admin](http://localhost:3002/admin).

## Environment variables

Copy `.env.example` to `.env.local` and fill in every value. `.env.local` is
gitignored; never commit real secrets.

| Variable | What it is | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public origin of the site, no trailing slash. Used for SEO metadata, sitemap, and absolute links. | Your domain (e.g. `https://harshpandey.dev`), or `http://localhost:3002` in dev. |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project's API URL. Safe to expose to the browser. | Supabase dashboard → Project Settings → API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/publishable key. Safe to expose to the browser; RLS policies restrict what it can do. | Supabase dashboard → Project Settings → API. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key. **Server only** — grants full DB access, bypassing RLS. Never prefix with `NEXT_PUBLIC_` or ship to the client. | Supabase dashboard → Project Settings → API. |
| `ADMIN_EMAIL` | The single email address allowed to log into `/admin` (checked by the login action and the `/admin` proxy). Row Level Security doesn't read it: `public.is_admin()` in `supabase/setup.sql` hardcodes the admin email, so this value must match that literal. | The email of the admin Supabase Auth user (the one in `is_admin()`). |
| `RESEND_API_KEY` | API key used to send contact-form notification emails. | Resend dashboard → API Keys. |
| `CONTACT_NOTIFICATION_EMAIL` | Address that receives an email whenever someone submits the contact form. | Usually the same as `ADMIN_EMAIL`. |
| `CONTACT_FROM_EMAIL` | The "from" address for outgoing contact-notification emails. Must be a Resend-verified sender (their shared `onboarding@resend.dev` works without domain verification; use a verified address on your own domain for production). | Resend dashboard → Domains, or use `onboarding@resend.dev`. |

## Supabase setup

**Quickest path:** paste `supabase/setup.sql` into the SQL editor and run it; see
[Set up a new Supabase project](supabase/README.md#set-up-a-new-supabase-project).
The steps below are the older, migration-by-migration route. Full details live
in [`supabase/README.md`](supabase/README.md); summary:

1. **Create a Supabase project** and copy its URL/keys into `.env.local`
   (see the table above).
2. **Run the migrations in order**, either via the Supabase SQL editor or the
   Supabase CLI:
   - `supabase/migrations/0001_schema.sql` — creates the core tables
     (`profile`, `site_sections`, `projects`, `experiences`, `skills`,
     `achievements`, `education`, `posts`, `contact_messages`).
   - `supabase/migrations/0002_rls.sql` — enables Row Level Security with
     public-read / admin-write policies.
   - `supabase/migrations/0003_storage.sql` — creates the `media` storage
     bucket used for project/post images and uploads.
   - `supabase/migrations/0004_updated_at.sql` — adds `updated_at`
     triggers.
   - `supabase/migrations/0005_blog_images_storage.sql` — creates the
     `blog-images` bucket.
   - `supabase/migrations/0006_personal_brand.sql` — personal-brand columns,
     `subscribers` table and the four site sections.
   - `supabase/migrations/0007_ivf_assistant.sql` — adds the IVF Assistant
     project.
3. **Run `supabase/seed.sql`** to load starter content (your profile,
   sample sections, etc. — edit it to taste before or after running). Note
   it resets content tables; `setup.sql` only fills empty ones.
4. **Match the admin email.** RLS policies call `public.is_admin()`, which
   hardcodes the admin email (`harshp6421@gmail.com`, in `setup.sql` and
   `0002_rls.sql`). Set `ADMIN_EMAIL` in `.env.local` to that same address. To
   use a different admin, edit the literal in `is_admin()` and re-run that
   function definition.
5. **Disable public sign-ups**: Authentication → Providers → turn off
   sign-ups for the Email provider (or whichever provider you use). This is
   a single-admin app — nobody else should be able to register.
6. **Create the one admin user**: Authentication → Users → Add user, with an
   email that exactly matches `ADMIN_EMAIL`. Set a password (or use a
   magic-link/passwordless flow if you prefer).

## Résumé

The site links to `/resume.pdf` by default (the profile's `resume_url`
field falls back to this path). Drop your résumé at `public/resume.pdf`,
replacing the placeholder that ships in this repo, and it's served
statically — no admin action needed. If you'd rather host your résumé
elsewhere, set `resume_url` on the profile in `/admin` to a full URL.

## Admin usage

1. Log in at `/admin/login` with the admin account you created in Supabase.
2. From the dashboard you can manage:
   - **Profile** — name, headline, tagline, bio, Now card, highlights,
     socials, avatar, résumé URL.
   - **Sections** — toggle homepage sections on/off and reorder them.
   - **Projects** — case studies, images, tags, published/draft state.
   - **Experience** — work history entries.
   - **Skills** — grouped skill tags.
   - **Achievements** — notable accomplishments.
   - **Education** — schools/degrees.
   - **Notes** — notes with a rich-text (Tiptap) editor, tags, an optional
     source and "short version", and published/draft state.
   - **Messages** — contact-form submissions.
   - **Subscribers** — newsletter sign-ups: mark unsubscribed/active, export
     as CSV.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server at `localhost:3002`. |
| `npm run build` | Production build. |
| `npm start` | Run the production build (run `build` first). |
| `npm run lint` | ESLint. |
| `npm test` | Run the test suite (`node --test`). |

## Deploy (Vercel)

1. Import the repo into Vercel.
2. Set all environment variables from the table above in the Vercel project
   settings (Production, and Preview if you want previews working too).
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g.
   `https://harshpandey.dev`), not `localhost`.
4. Deploy — the site is always live, no additional switch to flip.

## Deploy / cutover

Moving the live site to this version on a new Supabase project (one set up
with `supabase/setup.sql`, plus `0007` if it was created before that existed):

1. **Switch the env vars first.** In Vercel → Settings → Environment
   Variables, point `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   and `SUPABASE_SERVICE_ROLE_KEY` at the new project (Production, and Preview
   if you use it).
2. **Redeploy.** `NEXT_PUBLIC_*` values are baked into the build, so saving
   them changes nothing until the next build: redeploy the current production
   deployment (Deployments → ⋯ → Redeploy).
3. **Then merge and deploy this version** (the `feat/personal-brand-redesign`
   branch into `main`).
4. **Verify** on the production URL: `/`, a note (`/notes/<slug>`), and
   `/admin/login` (sign in).

If the public pages ever run against a database without migration 0006, they
degrade instead of crashing (no Now card, highlights, work tags or "short
version"); the admin's new fields and Subscribers do need 0006.
