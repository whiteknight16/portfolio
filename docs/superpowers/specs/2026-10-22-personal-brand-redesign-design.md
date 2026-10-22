# Personal-brand redesign ("Field notes") — Design

**Date:** 2026-10-22
**Owner:** Harsh Pandey
**Status:** Draft for approval
**Mockup:** `docs/superpowers/specs/2026-10-22-personal-brand-redesign-mockup.html` (homepage + note page, v3 — the approved look)

## 1. Intent

The site currently reads as a pitch to someone who might hire Harsh: "Available
for new projects", a "What I get hired to build" services block, "Start a
project" as the main button, résumé up front. Harsh wants the opposite: a
personal home base that represents him as a builder with his own voice, which
feeds and is fed by his social presence (LinkedIn now, YouTube soon).

How he'll use it:

1. He watches a video, reads something, or hits a problem at work, and writes
   a **note** (blog post) about it in the existing admin blog editor.
2. He posts a short version on LinkedIn ending with a link to the full note.
3. A reader lands on the note, and can subscribe by email.
4. Later (separate project), new notes go out to subscribers automatically.

Separately, when someone searches **"Harsh Pandey"** or **"Knight Developer"**
on Google, or asks Claude/ChatGPT about him, this site should be the source
they find and quote.

## 2. Goals

- Homepage leads with **Harsh and what he builds**, not with "learning ML" and
  not with job-seeking. Learning ML is one line in a "Now" card and one topic
  among his notes.
- Notes are first-class: easy to read, easy to share on LinkedIn (good link
  previews), with a subscribe box on every note.
- **His own projects and his job work never sit side by side.** "Things I've
  built" = personal projects only. Job work lives in a separate "Work" section
  (full detail is fine — the concern is mixing, not confidentiality).
- Nothing on the site goes stale on its own: **years of experience is computed**,
  never typed in.
- The admin gets the same look, supports the new fields, and **every admin page
  works end to end** against a fresh Supabase project.
- One SQL file sets up a brand-new Supabase project completely (schema, RLS,
  storage buckets, triggers, refreshed content), and the README gives the exact
  command.
- Groundwork so search engines and AI assistants connect "Harsh Pandey",
  "Knight Developer", this site and his social profiles.

## 3. Non-goals (this project)

- **Sending** newsletters. Harsh hasn't decided between building his own sender
  and a third-party service (e.g. Mailchimp). This project only **collects**
  subscriber emails into his own database and publishes an RSS feed — which is
  what a service like Mailchimp's RSS-to-email needs, so either path stays open.
- Video pages or YouTube embeds/feeds. YouTube is a social link for now.
- Comments, analytics dashboards, multi-author, i18n.
- Seeding any blog posts. Harsh writes the first ones himself.

## 4. Anti-goals (would make this a failure even if it works)

- Reading like a job application: "Available for hire/new projects", "Start a
  project", "What I get hired to build", résumé as a headline action.
- Presenting an employer's product as a personal project, or putting the two in
  the same grid.
- Knight/chess imagery of any kind. "Knight Developer" appears only as text
  (handle, alternate name, structured data).
- Hard-coded numbers that silently go stale (years of experience).
- Invented content: fake notes, fake metrics, fake subscriber counts. Note
  titles in the mockup are placeholders, not seed data.
- Breaking any existing admin flow (login, CRUD on every entity, uploads,
  messages).

## 5. Constraints

- Next.js **16.2** App Router — **read the relevant guide in
  `node_modules/next/dist/docs/` before writing code** (per `AGENTS.md`; APIs
  differ from older Next). React 19, Tailwind 4, shadcn (base-nova) + Base UI,
  `motion/react`, next-themes, Supabase (`@supabase/ssr`), Tiptap, Resend, Zod.
- Keep the existing architecture: public pages read Supabase via
  `src/lib/content.ts` (each fetcher degrades to empty on error); admin
  mutations are server actions validated with Zod, followed by `revalidatePath`.
- Admin auth is unchanged: Supabase Auth, single admin, `public.is_admin()`
  hardcodes the admin email (`harshp6421@gmail.com`, matching `ADMIN_EMAIL`).
- Mobile-first; respects `prefers-reduced-motion` (existing `Reveal`).
- Light + dark both supported (existing theme toggle stays).
- Tests: existing `node --test` runner for pure logic.

## 6. Visual system — "Field notes"

Approved direction: a researcher's notebook. Reference: the mockup file.

- **Palette (light):** paper `#f3eee4` background with faint horizontal ruled
  lines; card `#fffaf0`; ink `#1d1a16`; muted `#5d564c`; faint `#8a8074`; rule
  `#ddd3c2`; accent burnt orange `#c2410c`; highlighter `#fde68a` (used as a
  marker underline, never as a fill block).
- **Palette (dark):** "dark paper" — same roles inverted to a warm near-black
  paper, cream ink, a lighter orange accent and a dimmed highlighter. Exact
  values: builder's call, must keep AA contrast.
- **Type:** Fraunces (display headings, note body text), Inter (UI), IBM Plex
  Mono (dates, labels, tags, metadata). Loaded via `next/font/google`,
  replacing Space Grotesk / JetBrains Mono.
- **Devices:** hard offset shadows (`4–5px 4px 0 ink`) on "pinned" cards, slight
  rotations on the photo and Now card only, dashed rules between list rows,
  highlighter-marker emphasis, mono uppercase kickers in the accent colour.
- Implement as tokens in `globals.css` (`:root` / `.dark`) mapped onto the
  existing shadcn variables, so shadcn components (used heavily in admin)
  pick it up automatically.

## 7. Public site

### 7.1 Navigation & footer
- Nav: **Harsh Pandey** `@knightdeveloper` (handle from profile) · Notes ·
  Projects · About · **Subscribe** (solid button, scrolls to/opens the subscribe
  box) · theme toggle. Mobile drawer keeps the same items.
- Footer: © year · name · handle; links to notes, RSS, subscribe, socials.
- Removed everywhere: "Start a project", "Available for new projects",
  "Services", "Work" anchor to job history.

### 7.2 Homepage (`/`) — order as in mockup v3
1. **Hero** (always shown):
   - Kicker: profile `title` (seed: "AI engineer & builder") · location.
   - **H1 = full name** (important for name search).
   - Thesis line = profile `headline`; lede = first paragraph-ish `tagline`
     (see §9). Both support a `{years}` token replaced at render (§8).
   - Buttons: "See what I've built →" (to projects) and "Read my notes".
   - Social links row (LinkedIn, GitHub, YouTube, Instagram, X — whichever are set).
   - Right: photo as a taped polaroid (`avatar_url`, fallback `/profile.png`;
     if neither loads, hide the polaroid and keep the Now card), with the
     **Now card** pinned over it: up to 3 rows (`building`, `writing`,
     `learning`) + month/year it was last updated.
2. **Proof strip** (4 cells): first cell is always computed years —
   "`1.5+ yrs` · shipping AI products to production" — the other three come
   from editable profile `highlights` (value + label). Hidden cells if fewer.
3. **Things I've built** — featured, published **personal** projects (up to 3),
   with an italic line "My own projects, built outside of work." Link to
   `/projects`.
4. **Notes** — latest 3–5 published notes with topic chips (from tags),
   date, read time, excerpt, and a "↳ notes on …" source line when set.
   **Empty state** (no notes yet): a short line like "First note is on its way
   — subscribe to get it." with the subscribe form, not a blank section.
5. **Subscribe box** (dark ink panel).
6. **Work** — roles from `experiences`, newest first: date range, role ·
   company, one-paragraph description, 1–2 tags; current role's dates in accent
   colour. Link "full story on About →". Italic line "What I've built for the
   teams I've worked with."

Sections 3–6 remain toggleable and reorderable from the existing admin
**Sections** page (keys: `projects`, `blog` (labelled "Notes"), `newsletter`,
`experience`). Hero + proof strip always render.

**Toggles now affect the homepage blocks only** (builder's call). Turning off
`blog` hides the homepage Notes block but `/notes`, every note, RSS, sitemap
and `llms.txt` stay live — a LinkedIn link must never 404. Turning off
`newsletter` hides the homepage subscribe box only; the nav Subscribe button,
the end-of-note card and the empty-state form stay. This replaces today's
behaviour where disabling `blog` 404s `/blog` and hides nav links
(`isBlogEnabled()` gating is removed from the public notes routes and layout).

### 7.3 Notes (`/notes`, `/notes/[slug]`)
- Rename public route `/blog` → `/notes`, with **permanent redirects**
  `/blog` → `/notes` and `/blog/:slug` → `/notes/:slug`.
- List: title, date, read time, excerpt, source line, tag filter (existing
  client-side `tag-filter` restyled).
- Note page (mockup "A note" tab): "← all notes", date · read time · tags,
  H1 title, dek (= excerpt), **"Notes on" source card** (if source set: kind
  label, title, link "watch ↗"/"read ↗"), **"The short version"** (up to 3
  bullets, if set), body (`Prose`, Fraunces body, mono inline code, dark code
  blocks, highlight marks), end-of-note subscribe card, author line (name,
  handle, one-line bio, link to About), previous/next note.
- Each note gets a **generated Open Graph image** in the Field notes style
  (title, date, name/handle) — this is what LinkedIn shows when he shares it.
  Cover image, if uploaded, is used instead.

### 7.4 Projects (`/projects`, `/projects/[slug]`)
- Restyle, plus one optional field: a short `label` shown as the card kicker
  ("AI product", "SaaS", "Delivered solo"); " · live" is appended
  automatically when the project has a live link. Personal projects only (seed
  reflects that). Cards as in "Things I've built".

### 7.5 About (`/about`, new)
- Longer bio (`bio`), photo, handle ("known online as Knight Developer").
- Work (full experience list with highlights), skills by category,
  achievements, education.
- "Say hello": the existing contact form (moved here from the homepage) +
  email + socials. Contact still stores to `contact_messages` and emails via
  Resend as today.
- Résumé: a small "Résumé (PDF)" text link here only, if `resume_url` set. It
  is not in the nav or hero.
- Each block hides itself when it has no data.

### 7.6 Removed
- `services` section component and its key.
- Homepage `about`, `skills`, `achievements`, `education`, `contact` sections
  (content moves to `/about`).

## 8. Computed years of experience

- New profile field `career_start_date` (date). Seed: `2025-03-01` (first
  full-time role; internships deliberately excluded — Harsh describes himself
  as ~1.5 years experienced).
- Display = whole months since that date, **floored to the half-year**, with a
  "+" : 19 months → `1.5+`; 24 → `2+`; < 6 months → hide the cell.
- Pure function in `src/lib/format.ts` with unit tests.
- Token `{years}` in `headline`, `tagline` and `bio` is replaced with the same
  value (without "yrs"), e.g. "the last {years} years" → "the last 1.5+ years".
  Admin form help text explains the token.

## 9. Data model changes

All additive. Delivered as `supabase/migrations/0006_personal_brand.sql` **and**
folded into `supabase/setup.sql`.

**profile** — add:
- `handle text` — seed "Knight Developer" (nav shows `@knightdeveloper`
  derived from it: lowercase, no spaces).
- `tagline text not null default ''` — the hero lede.
- `career_start_date date`.
- `now jsonb not null default '{}'` — `{building, writing, learning}` strings.
- `now_updated_at timestamptz` — stamped when any `now` value changes.
- `highlights jsonb not null default '[]'` — up to 3 `{value, label}`.
- `socials` gains optional `youtube`, `instagram`, `x` keys (jsonb, no schema
  change; form + types updated).

**posts** — add:
- `source_title text`, `source_url text`, `source_kind text`
  (`video|article|paper|course|book|podcast|other`), all nullable.
- `tldr text[] not null default '{}'` — "The short version", max 3 items.

**experiences** — add `tags text[] not null default '{}'` (the 1–2 chips on
each Work row; homepage shows the first two).

**projects** — add `label text` (nullable; card kicker, see §7.4).

**subscribers** (new):
- `id uuid pk`, `email text not null` (stored lower-cased, unique),
  `status text not null default 'active'` (`active|unsubscribed`),
  `source text` (page path where they subscribed), `created_at timestamptz`.
- RLS: anon may **insert only**; admin full CRUD; no anon select.

**site_sections** — keys become `projects`, `blog`, `newsletter`,
`experience` (homepage only). Validation enum and types updated; old keys
(`about`, `services`, `skills`, `achievements`, `education`, `contact`) removed
from the enum and the seed.

**Re-run safety** — `setup.sql` must be safe to run on a fresh project *and*
on an already-set-up one without losing anything:
- Schema: `create table if not exists` for new tables **and**
  `alter table … add column if not exists` for every new column (so re-running
  upgrades an older database); policies/triggers dropped-then-created as today.
- Content: **seed only fills empty tables** (`insert … where not exists
  (select 1 from <table>)`, per table). Re-running never overwrites admin
  edits. Posts, subscribers and messages are never touched.
- `seed.sql` (standalone) stays the explicit **"reset content to the seed"**
  script: deletes and re-inserts profile, sections, experiences, skills,
  projects, achievements, education. README says clearly that it overwrites.

**Storage** — `setup.sql` must create **both** buckets: `media` and
`blog-images` (+ their policies). Today `setup.sql` omits `blog-images`
(it only exists in migration 0005), so **blog cover and inline image uploads
fail on a fresh project**. This is a bug fix in scope.

## 10. Subscribe (collection only)

- `SubscribeForm` component used in: homepage subscribe box, homepage notes
  empty state, end of every note, and the nav "Subscribe" target.
- Server action: Zod email validation, honeypot field, lower-case, insert;
  **duplicate email returns the same success message** (no "already
  subscribed" leak). Inline success/error state; works without JS
  (progressive enhancement, like the contact form).
- Copy: "One email when I publish something new. Nothing else." No subscriber
  count shown publicly.
- No confirmation email in this project.

## 11. Admin

### 11.1 Look
- Same Field notes tokens and fonts (comes mostly free through shadcn
  variables). Shell: paper sidebar, Fraunces "Admin" wordmark with handle,
  mono section labels, ink active state. Page headers: Fraunces title + mono
  kicker. Login page restyled to match.

### 11.2 Navigation
Dashboard · Profile · Sections · **Notes** (was Blog; route may stay
`/admin/blog`) · Projects · Experience · Skills · Achievements · Education ·
Messages · **Subscribers** (new).

### 11.3 Changes
- **Dashboard:** stat cards for published notes, drafts, projects, unread
  messages, **active subscribers**; latest messages; "Write a note" primary
  button.
- **Profile form:** add handle, tagline, career start date, Now (3 inputs),
  highlights (3 value/label pairs), YouTube/Instagram/X URLs; help text for
  `{years}`.
- **Notes form:** add source (title, URL, kind select), "The short version"
  (3 single-line inputs); a "View on site" link for published notes. Existing
  title/slug/excerpt/tags/cover/body/status behaviour unchanged.
  `revalidatePath` calls updated to `/notes` paths (and `/`).
- **Sections:** only the four homepage keys.
- **Subscribers (new):** table (email, status, source, date), count of active,
  delete, mark unsubscribed, **Export CSV** (for importing into a newsletter
  service later).

### 11.4 "Everything works" — acceptance
**Test project:** Harsh's **new** Supabase project, already configured in
`.env.local` (empty as of 2026-10-22; the live site still points at the old
project until Harsh switches its env vars). Run `setup.sql` on it, test
locally (`npm run dev`), then **delete all test data** (test notes, uploads,
subscribers, messages) so it holds only the seed content, ready for cutover.
The admin auth user (`harshp6421@gmail.com`) doesn't exist there yet —
**ask Harsh at that step** whether to create it with a temporary password via
the service key, or whether he signs in himself.

Against that fresh project set up only with `setup.sql`, the builder verifies
by actually using the running app:
- Login/logout (and non-admin rejection).
- For each of Profile, Sections, Notes, Projects, Experience, Skills,
  Achievements, Education: create, edit, delete (where applicable), and the
  change appears on the public site without a redeploy.
- Notes: cover image upload, inline image upload in the editor, draft →
  published stamps `published_at`, slug collision gets `-2`.
- Project cover upload; profile avatar upload.
- Public contact form → row in Messages + mark read; subscribe form → row in
  Subscribers; CSV export downloads.
- `npm run build`, `npm run lint`, `npm test` all pass.

## 12. Discoverability (Google + AI assistants)

- **Person JSON-LD** (site-wide): add `alternateName: ["Knight Developer",
  "knightdeveloper"]`, `image`, `sameAs` including YouTube/Instagram/X when
  set, `knowsAbout` (top skills), `worksFor` (current experience row's
  company) and `alumniOf` (education).
- **ProfilePage** JSON-LD on `/about` with `mainEntity` → the Person `@id`.
- **BlogPosting** JSON-LD on each note: headline, description, datePublished,
  dateModified, author (Person `@id`), image (OG image), keywords (tags), and
  `isBasedOn` → `source_url` when set.
- **Canonical URLs** on every public page (`alternates.canonical`).
- **Titles/descriptions:** home = "Harsh Pandey (Knight Developer) — AI
  engineer & builder"; notes = "{title} — Harsh Pandey".
- **RSS** at `/notes/rss.xml` (title, link, date, excerpt, full content) and
  advertised via `<link rel="alternate" type="application/rss+xml">`. Also the
  hook for a future RSS-to-email newsletter.
- **`/llms.txt`**: plain-text, generated at request time — who Harsh is
  (name, handle, one-paragraph bio, current focus), links to About, Projects,
  Notes and socials, and a list of note titles with URLs.
- **robots:** allow all, explicitly including GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended; disallow `/admin`; sitemap link.
- **Sitemap:** `/`, `/about`, `/notes`, `/projects`, every note and project.
- Existing Google verification meta stays.

## 13. Seed content refresh (`setup.sql` content section + `seed.sql`)

`seed.sql` and the content section of `setup.sql` carry the same values; they
differ only in mechanics (seed.sql resets, setup.sql fills-if-empty — §9).
Rewrite the header comments (they currently describe a consulting pitch).

- **profile:** title "AI engineer & builder"; handle "Knight Developer";
  headline "I build AI that does the actual work: not chatbots, but
  interviewers and tutors that run live, on voice and video."; tagline "I've
  spent the last {years} years shipping these to production, and owning
  everything that breaks around them. Here I write about what I'm building,
  what goes wrong, and what I'm figuring out next."; bio rewritten in first
  person for the About page (builder + writing, not a sales pitch);
  `avatar_url` `/profile.png`; `career_start_date` `2025-03-01`; now =
  building "an AI tutor that teaches live over voice & video", writing "notes
  on voice agents and what breaks in production", learning "ML from first
  principles"; highlights = `2` / "live voice & video AI products built",
  `Finalist` / "Smart India Hackathon 2024, national round", `#1 hire` / "first
  engineer at an early-stage startup"; socials as today (GitHub, LinkedIn,
  Instagram).
- **site_sections:** `projects` (Things I've built) 1, `blog` (Notes) 2,
  `newsletter` (Subscribe) 3, `experience` (Work) 4 — all enabled.
- **experiences:** same four roles; light copy edit so each has a one-paragraph
  summary readable on the homepage (first highlight) plus the rest on About.
  Tags: BerriBot `voice agents`, `FastAPI`; SkillSync `LiveKit`,
  `multi-agent`; EY `Gemini`; Ransh `first hire`.
- **projects:** unchanged set (all personal); featured = Interview Genie,
  Notes Nest, REC Mirzapur. Labels: Interview Genie "AI product", Notes Nest
  "SaaS", REC Mirzapur "Delivered solo", Gymkhana "Full-stack app".
- **skills, achievements, education:** unchanged.
- **posts, subscribers:** none.

**README:** "Set up a new Supabase project" section with the exact steps:
paste `supabase/setup.sql` into the SQL editor and run, **or**
`psql "<connection string>" -f supabase/setup.sql`; then create the admin auth
user, disable sign-ups, set env vars. `setup.sql` stays idempotent (safe to
re-run).

## 14. Decided by Harsh

- Direction "Field notes" (A); Channel (B) and Knight brand (C) rejected —
  C explicitly disliked.
- Homepage is about him and what he builds; learning ML is secondary.
- Personal projects and job work are separate sections; job detail is fine.
- Years of experience must not be hard-coded.
- Admin restyled to match; all admin features must work.
- New Supabase account → needs a working setup/seed command; seed copy may be
  refreshed.
- Newsletter: collect now; sending decided later (own build or a service).
- BerriBot is just his current employer — named in Work like any role, never
  framed as his venture.

## 15. Builder's calls (made in this doc, flagged for Harsh's review)

- Public URL rename `/blog` → `/notes` with permanent redirects.
- Contact form and résumé link move to `/about`; résumé not in nav/hero.
- Internships excluded from the years count (start = 2025-03-01).
- `{years}` token approach for text fields.
- Proof strip: one computed cell + three editable highlights.
- `worksFor` (current employer) in structured data.
- Generated OG images for notes.
- No confirmation/welcome email for subscribers yet.
- Sections toggles affect homepage blocks only; `/notes` never 404s.
- `setup.sql` fills empty tables only; `seed.sql` is the explicit reset.
- New small fields `experiences.tags` and `projects.label` to match the mockup.

## 16. Left to the builder

- Exact dark-mode values, spacing, responsive breakpoints, motion details.
- Component breakdown and file layout.
- OG image layout details.
- Whether to keep `/admin/blog` route path or rename it.
