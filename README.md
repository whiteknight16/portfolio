# Portfolio + Admin CMS

A personal portfolio site built on Next.js 16, backed by a single-admin
Supabase content management system. The public site (home, projects, blog)
is fully data-driven; you edit everything through `/admin` — no code changes
needed to update content.

## Features

- **Public site**: home, project case studies, blog with tags, contact form,
  résumé link, light/dark theme, motion, fully responsive.
- **Admin CMS** (`/admin`): single-user Supabase Auth login. Manage profile
  and socials, toggle/reorder homepage sections, projects, work experience,
  skills, achievements, education, blog posts (rich-text editor), and
  incoming contact messages.
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

Open [http://localhost:3000](http://localhost:3000) to see the live site;
`/admin` is reachable at [http://localhost:3000/admin](http://localhost:3000/admin).

## Environment variables

Copy `.env.example` to `.env.local` and fill in every value. `.env.local` is
gitignored; never commit real secrets.

| Variable | What it is | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public origin of the site, no trailing slash. Used for SEO metadata, sitemap, and absolute links. | Your domain (e.g. `https://harshpandey.dev`), or `http://localhost:3000` in dev. |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project's API URL. Safe to expose to the browser. | Supabase dashboard → Project Settings → API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/publishable key. Safe to expose to the browser; RLS policies restrict what it can do. | Supabase dashboard → Project Settings → API. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key. **Server only** — grants full DB access, bypassing RLS. Never prefix with `NEXT_PUBLIC_` or ship to the client. | Supabase dashboard → Project Settings → API. |
| `ADMIN_EMAIL` | The single email address allowed to log into `/admin`. Enforced both in app logic and by the `app.admin_email` Postgres GUC used in RLS policies. | Pick the email you'll use for the admin Supabase Auth user. |
| `RESEND_API_KEY` | API key used to send contact-form notification emails. | Resend dashboard → API Keys. |
| `CONTACT_NOTIFICATION_EMAIL` | Address that receives an email whenever someone submits the contact form. | Usually the same as `ADMIN_EMAIL`. |
| `CONTACT_FROM_EMAIL` | The "from" address for outgoing contact-notification emails. Must be a Resend-verified sender (their shared `onboarding@resend.dev` works without domain verification; use a verified address on your own domain for production). | Resend dashboard → Domains, or use `onboarding@resend.dev`. |

## Supabase setup

Full details live in [`supabase/README.md`](supabase/README.md); summary:

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
3. **Run `supabase/seed.sql`** to load starter content (your profile,
   sample sections, etc. — edit it to taste before or after running).
4. **Set the admin email GUC** so RLS policies know who the admin is. In the
   Supabase SQL editor:
   ```sql
   alter database postgres set app.admin_email = '<ADMIN_EMAIL>';
   ```
   Use the same address as `ADMIN_EMAIL` in `.env.local`.
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
   - **Profile** — name, bio, socials, résumé URL.
   - **Sections** — toggle homepage sections on/off and reorder them.
   - **Projects** — case studies, images, tags, published/draft state.
   - **Experience** — work history entries.
   - **Skills** — grouped skill tags.
   - **Achievements** — notable accomplishments.
   - **Education** — schools/degrees.
   - **Blog** — posts with a rich-text (Tiptap) editor, tags, and
     published/draft state.
   - **Messages** — contact-form submissions.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server at `localhost:3000`. |
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
