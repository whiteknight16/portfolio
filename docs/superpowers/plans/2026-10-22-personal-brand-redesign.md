# Personal-brand redesign ("Field notes") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing deployed portfolio into Harsh's personal home base in the approved "Field notes" style — homepage about him and what he builds, notes as first-class pages with a subscribe box, a restyled and fully working admin, a one-paste Supabase setup, and groundwork for Google/AI discoverability.

**Architecture:** Same Next.js 16 App Router app. Public pages stay server components reading Supabase through `src/lib/content.ts` (every fetcher degrades to empty). New pure helpers (`src/lib/profile-view.ts`, `src/lib/seo.ts`, `src/lib/csv.ts`) hold all logic worth unit-testing; components stay thin. The look comes from design tokens in `globals.css` mapped onto the existing shadcn variables, so admin restyles largely for free.

**Tech Stack:** Next.js 16.2 (App Router, `proxy.ts`), React 19, Tailwind 4, shadcn (base-nova) + Base UI, `motion/react`, next-themes, Supabase (`@supabase/ssr`), Tiptap 3, Zod 4, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-22-personal-brand-redesign-design.md` — read it first. **Visual source of truth:** `docs/superpowers/specs/2026-10-22-personal-brand-redesign-mockup.html` (open it in a browser; port its CSS values into Tailwind classes).

## Global Constraints

- **Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`** (AGENTS.md). Per task, the guides to read are named in the task.
- Tests run with `npm test` (`node --test 'src/**/*.test.ts'`, Node 25 type-stripping). Test files import siblings with a `.ts` extension and **relative paths only** — modules under test must not import `@/…` values (type-only `import type` is fine).
- Public pages keep `export const dynamic = "force-dynamic"` (existing pattern) and never crash on a DB error.
- Admin mutations: server action → `getSessionUser()` check → Zod parse → Supabase → `revalidatePath`. Same `{ ok?: boolean; error?: string }` state shape as existing forms.
- Palette (light): paper `#f3eee4`, card `#fffaf0`, ink `#1d1a16`, muted `#5d564c`, faint `#8a8074`, rule `#ddd3c2`, accent `#c2410c`, highlighter `#fde68a` (marker underline only, never a fill block).
- Type: Fraunces (headings + note body), Inter (UI), IBM Plex Mono (dates, labels, tags, metadata).
- Never on the site: "Available for new projects", "Start a project", "What I get hired to build", "Services", knight/chess imagery, a typed-in years number, invented notes/metrics/subscriber counts.
- Personal projects ("Things I've built") and job work ("Work") never share a section.
- Admin email stays `harshp6421@gmail.com` (hardcoded in `public.is_admin()`, matches `ADMIN_EMAIL`).
- Mobile-first, 16px side gutter, no horizontal scroll at 375px; respect `prefers-reduced-motion` (use existing `Reveal`).
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Work on branch `feat/personal-brand-redesign` (already created; spec committed).

## Review Focus

1. **Sparse profile** — Now fields all blank, no highlights, `career_start_date` null: homepage shows no empty Now card, no empty proof cells, no literal `{years}`, no "undefined". → tests in Task 1 (`proofCells`, `nowRows`, `fillYears`).
2. **Bare note** — a published note with no excerpt, tags, source, tldr or cover: list row, note page, RSS item and JSON-LD render without empty boxes or a dangling "↳ notes on" line. → tests in Task 4 (`buildRssXml`, `buildBlogPostingJsonLd` with nulls) + verification in Task 9 and Task 14.
3. **Unreachable or empty database**: every public route returns 200 with fallbacks, `/notes/rss.xml` and `/llms.txt` return valid empty documents. → verification step in Task 14.
4. **Repeat subscriber** — `"  Ada@Example.com "` twice: one row stored as `ada@example.com`, identical success message both times. → tests in Task 1 (`subscribeSchema`) and Task 6 (`isUniqueViolation`) + Task 14 checklist.
5. **Old shared links** — `/blog` and `/blog/<slug>` redirect permanently to `/notes…`; an unknown or draft slug is a 404, not a 500. → verification in Task 9.

---

## File map

| Area | Files |
|---|---|
| Data types & validation | `src/lib/types.ts`, `src/lib/validation.ts`, `src/lib/validation.test.ts` |
| Pure helpers | `src/lib/format.ts` (+test), **new** `src/lib/profile-view.ts` (+test), **new** `src/lib/seo.ts` (+test), **new** `src/lib/csv.ts` (+test) |
| SQL | **new** `supabase/migrations/0006_personal_brand.sql`, `supabase/setup.sql`, `supabase/seed.sql`, **new** `supabase/tests/stubs.sql`, **new** `supabase/tests/smoke.sh`, `supabase/README.md`, `README.md` |
| Content fetchers | `src/lib/content.ts`, `src/lib/config.ts` |
| Theme | `src/app/globals.css`, `src/app/layout.tsx`, `src/components/public/prose.tsx`, `src/lib/sanitize.ts` (+test), `src/components/editor/rich-text-editor.tsx`, `src/components/editor/toolbar.tsx` |
| Subscribe | **new** `src/app/(site)/subscribe/actions.ts`, **new** `src/components/public/subscribe-form.tsx` |
| Chrome | `src/app/(site)/layout.tsx`, `src/components/public/nav.tsx`, `src/components/public/footer.tsx`, `src/components/public/social-icons.tsx` |
| Homepage | `src/components/site-home.tsx`, `src/components/sections/{hero,proof-strip(new),built(new, replaces projects-preview),notes-preview(new),newsletter(new),work(new, replaces experience)}.tsx`; delete `services.tsx`, `about.tsx`, `projects-preview.tsx`, `experience.tsx` |
| Notes | **new** `src/app/(site)/notes/{page.tsx,[slug]/page.tsx,[slug]/og/route.tsx,rss.xml/route.ts}`, **new** `src/components/public/{note-row,notes-list,source-card}.tsx`; delete `src/app/(site)/blog/**`, `blog-grid.tsx`, `post-card.tsx`; `next.config.ts` |
| Projects & About | `src/app/(site)/projects/**`, `src/components/public/{project-card,projects-grid}.tsx`, **new** `src/app/(site)/about/page.tsx`, `src/components/sections/{skills,achievements,education,contact}.tsx` |
| Discoverability | `src/components/seo/json-ld.tsx`, **new** `src/app/llms.txt/route.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image.tsx`, **new** `src/assets/fonts/*` |
| Admin | `src/components/admin/{shell,profile-form,post-form,project-form,experience-form,login-form}.tsx`, **new** `src/components/admin/page-header.tsx`, `src/app/admin/(dashboard)/**` list pages, **new** `src/app/admin/(dashboard)/subscribers/{page.tsx,actions.ts,export/route.ts}`, `src/app/admin/login/page.tsx` |

---

### Task 1: Data model types, validation and view helpers

**Files:**
- Modify: `src/lib/types.ts`, `src/lib/validation.ts`, `src/lib/format.ts`
- Create: `src/lib/profile-view.ts`, `src/lib/profile-view.test.ts`
- Test: `src/lib/format.test.ts`, `src/lib/validation.test.ts`

**Interfaces:**
- Produces (types, `src/lib/types.ts`):
  - `Profile` gains `handle: string | null; tagline: string; career_start_date: string | null; now: NowCard; now_updated_at: string | null; highlights: Highlight[]`; `socials` gains `youtube?: string; instagram?: string` (X stays under the existing `twitter` key — no data migration).
  - `export type NowCard = { building?: string; writing?: string; learning?: string }`
  - `export type Highlight = { value: string; label: string }`
  - `Post` gains `source_title: string | null; source_url: string | null; source_kind: SourceKind | null; tldr: string[]`
  - `export type SourceKind = "video" | "article" | "paper" | "course" | "book" | "podcast" | "other"` and `export const SOURCE_KINDS: SourceKind[]` (in `types.ts`, value export)
  - `Experience` gains `tags: string[]`; `Project` gains `label: string | null`
  - `SiteSection["key"]` becomes `"projects" | "blog" | "newsletter" | "experience"`
  - `export interface Subscriber { id: string; email: string; status: "active" | "unsubscribed"; source: string | null; created_at: string }`
- Produces (`src/lib/format.ts`): `formatExperienceYears(start: string | null, now?: Date): string | null`; `fillYears(text: string, years: string | null): string`; `handleSlug(handle: string): string`; `stripEmphasis(text: string): string` (removes the `*…*` markers used to italicise one hero phrase — for metadata, JSON-LD, RSS, llms.txt)
- Produces (`src/lib/profile-view.ts`): `proofCells(profile: Profile | null, now?: Date): Highlight[]`; `nowRows(profile: Profile | null): { key: "building" | "writing" | "learning"; text: string }[]`; `projectKicker(label: string | null, hasLive: boolean): string | null`
- Produces (`src/lib/validation.ts`): updated `profileSchema`, `postSchema`, `projectSchema`, `experienceSchema`, `sectionSchema`; new `subscribeSchema` + `SubscribeInput`.

- [ ] **Step 1: Write failing tests** in `format.test.ts`:

```ts
test("formatExperienceYears floors to the half-year with a plus", () => {
  assert.equal(formatExperienceYears("2025-03-01", new Date(2026, 9, 22)), "1.5+"); // 19 months
  assert.equal(formatExperienceYears("2025-03-01", new Date(2027, 2, 1)), "2+");    // 24 months
  assert.equal(formatExperienceYears("2025-03-01", new Date(2025, 8, 1)), "0.5+");  // 6 months
});
test("formatExperienceYears hides under six months and when unset", () => {
  assert.equal(formatExperienceYears("2025-03-01", new Date(2025, 7, 31)), null);   // 5 months
  assert.equal(formatExperienceYears(null, new Date(2026, 9, 22)), null);
});
test("fillYears replaces every token and collapses spacing when unknown", () => {
  assert.equal(fillYears("the last {years} years, {years}!", "1.5+"), "the last 1.5+ years, 1.5+!");
  assert.equal(fillYears("the last {years} years", null), "the last years");
  assert.equal(fillYears("no token", "2+"), "no token");
});
test("handleSlug lowercases and strips non-alphanumerics", () => {
  assert.equal(handleSlug("Knight Developer"), "knightdeveloper");
});
test("stripEmphasis removes asterisk markers only", () => {
  assert.equal(stripEmphasis("I build AI that *does the actual work*: live"), "I build AI that does the actual work: live");
});
```

  In `profile-view.test.ts` (build a `Profile` fixture with all required fields; `career_start_date: "2025-03-01"`):

```ts
test("proofCells puts computed years first, then up to three highlights", () => {
  const cells = proofCells({ ...p, highlights: [h1, h2, h3, h4] }, new Date(2026, 9, 22));
  assert.deepEqual(cells[0], { value: "1.5+ yrs", label: "shipping AI products to production" });
  assert.equal(cells.length, 4);
});
test("proofCells drops the years cell when unknown and skips blank highlights", () => {
  const cells = proofCells({ ...p, career_start_date: null, highlights: [{ value: "", label: "" }, h1] });
  assert.deepEqual(cells, [h1]);
  assert.deepEqual(proofCells(null), []);
});
test("nowRows keeps non-blank rows in building, writing, learning order", () => {
  assert.deepEqual(nowRows({ ...p, now: { learning: "ML", building: "  " } }), [{ key: "learning", text: "ML" }]);
  assert.deepEqual(nowRows({ ...p, now: {} }), []);
});
test("projectKicker appends live", () => {
  assert.equal(projectKicker("SaaS", true), "SaaS · live");
  assert.equal(projectKicker(null, true), "live");
  assert.equal(projectKicker(null, false), null);
});
```

  In `validation.test.ts`:

```ts
test("subscribeSchema trims and lowercases the email", () => {
  const r = subscribeSchema.parse({ email: "  Ada@Example.com ", honeypot: "" });
  assert.equal(r.email, "ada@example.com");
});
test("subscribeSchema rejects a filled honeypot and a bad email", () => {
  assert.equal(subscribeSchema.safeParse({ email: "a@b.co", honeypot: "x" }).success, false);
  assert.equal(subscribeSchema.safeParse({ email: "nope" }).success, false);
});
test("postSchema drops blank tldr lines and caps at three", () => {
  const r = postSchema.parse({ title: "T", slug: "t", tldr: ["a", " ", "b", "c", "d"] });
  assert.deepEqual(r.tldr, ["a", "b", "c"]);
});
test("postSchema normalizes an empty source to nulls", () => {
  const r = postSchema.parse({ title: "T", slug: "t", source_title: "", source_url: "", source_kind: "" });
  assert.equal(r.source_url, null); assert.equal(r.source_kind, null);
});
test("profileSchema keeps only highlights with a value or label, max three", () => {
  const r = profileSchema.parse({ full_name: "H", highlights: [{ value: "2", label: "x" }, { value: "", label: "" }] });
  assert.deepEqual(r.highlights, [{ value: "2", label: "x" }]);
});
```

- [ ] **Step 2: Run `npm test`** — Expected: FAIL (missing exports).

- [ ] **Step 3: Implement.**
  - `formatExperienceYears`: whole months = year diff × 12 + month diff, minus 1 if `now`'s day-of-month < start's; parse `start` with `parseISO` (local midnight, like `dateRange`); `< 6` → `null`; `floor(months / 6) / 2` → `"2+"` when integer, `"1.5+"` otherwise.
  - `fillYears`: replace all `{years}`; when `years` is null, replace with `""` then collapse runs of spaces to one.
  - `proofCells`: years cell label is exactly `"shipping AI products to production"`, value `` `${years} yrs` ``; highlights trimmed, blank-blank pairs dropped, first 3 kept. `profile-view.ts` imports `./format.ts` relatively.
  - Schemas: `profileSchema` adds `handle: optionalText()`, `tagline: defaultedText()`, `career_start_date: optionalDate()`, `now: z.object({ building, writing, learning }: optional trimmed strings, ""→undefined).default({})`, `highlights: z.array(z.object({ value, label })).transform(filter blank pairs).pipe(max 3)` default `[]`, socials add `youtube`, `instagram`. `postSchema` adds `source_title: optionalText()`, `source_url: optionalUrl()`, `source_kind: z.preprocess(nullifyEmpty, z.enum(SOURCE_KINDS).nullable().default(null))`, `tldr` (array or missing → trimmed non-empty, first 3). `projectSchema` adds `label: optionalText()`. `experienceSchema` adds `tags: stringArray()`. `sectionSchema.key` enum → the four keys. `subscribeSchema = { email: z.preprocess(trim+lowercase, z.email("Enter a valid email address")), honeypot: max(0) default "", source: optionalText() }` — `.toLowerCase()` before validating. Note: `validation.ts` must import `SOURCE_KINDS` relatively (`./types.ts`) for tests to run.

- [ ] **Step 4: Run `npm test`** — Expected: all PASS. Run `npx tsc --noEmit` — expected errors only in files later tasks rewrite (record them; do not fix unrelated files yet).

- [ ] **Step 5: Commit** — `feat: add personal-brand data types, validation and view helpers`

---

### Task 2: SQL — migration, one-paste setup, reset seed, smoke test

**Files:**
- Create: `supabase/migrations/0006_personal_brand.sql`, `supabase/tests/stubs.sql`, `supabase/tests/smoke.sh`
- Modify: `supabase/setup.sql`, `supabase/seed.sql`, `supabase/README.md`, `README.md`

**Interfaces:**
- Consumes: column names/types from Task 1 (must match exactly).
- Produces: DB columns `profile.{handle, tagline, career_start_date, now, now_updated_at, highlights}`, `posts.{source_title, source_url, source_kind, tldr}`, `experiences.tags`, `projects.label`, table `subscribers`, buckets `media` + `blog-images`, section keys `projects|blog|newsletter|experience`.

- [ ] **Step 1: Write `0006_personal_brand.sql`** (for already-migrated DBs):
  - `alter table … add column if not exists` for every column above (`now jsonb not null default '{}'`, `highlights jsonb not null default '[]'`, `tagline text not null default ''`, `tldr text[] not null default '{}'`, `tags text[] not null default '{}'`).
  - `posts.source_kind` check: `source_kind is null or source_kind in ('video','article','paper','course','book','podcast','other')`; `posts` check `cardinality(tldr) <= 3`. Add constraints with `drop constraint if exists` first.
  - `create table if not exists public.subscribers (id uuid pk default gen_random_uuid(), email text not null unique check (email = lower(email)), status text not null default 'active' check (status in ('active','unsubscribed')), source text, created_at timestamptz not null default now())`; enable RLS; `pub_insert_subscribers` **for insert with check (status = 'active')**; `admin_all_subscribers` for all using/with check `public.is_admin()`. Drop-if-exists before each create.
  - Sections: `delete from public.site_sections where key not in ('projects','blog','newsletter','experience');` then insert the four rows `on conflict (key) do update set label = excluded.label` with labels `Things I've built`, `Notes`, `Subscribe`, `Work` and sort 1–4 (insert only sets sort_order/enabled for new rows — use `do update set label` only).
- [ ] **Step 2: Rewrite `setup.sql`** keeping its section layout (1 Schema, 2 RLS, 3 Storage, 4 triggers, 5 Content) and header "HOW TO RUN":
  - Schema: existing `create table if not exists` blocks, then the same `add column if not exists` / constraint / `subscribers` statements as 0006.
  - RLS: every `create policy` preceded by `drop policy if exists` (including subscribers).
  - Storage: `media` **and** `blog-images` buckets + their four policies each (copy 0005, add `drop policy if exists`).
  - Content (**fill-if-empty**): profile via `insert … select … where not exists (select 1 from public.profile)`; experiences/skills/projects/achievements/education each as `insert … select * from (values …) v(cols) where not exists (select 1 from public.<table>)` with explicit casts (`::date`, `::text[]`, `::jsonb`); sections via the same delete-unknown + `on conflict (key)` statements as 0006. Never touch posts, subscribers, contact_messages. Wrap content in `begin; … commit;`.
  - Seed values — exactly spec §13, plus:
    - profile `headline` stored as `I build AI that *does the actual work*: not chatbots, but interviewers and tutors that run live, on voice and video.` (the asterisks mark the accent-italic phrase).
    - profile `location` = `'New Delhi, India'`; `avatar_url` = `'/profile.png'`; `resume_url` = `'/resume.pdf'`; `email` unchanged; socials unchanged (github, linkedin, instagram).
    - profile `bio` (About page, first person):
      > I'm Harsh Pandey, known online as Knight Developer. I build AI that does real work: systems that take over a job a person used to do, end to end. Over the last {years} years that has meant an AI interviewer that runs live, multi-round spoken interviews, and an AI tutor that teaches over voice and video, sets the test, marks it and moves the learner on. I care about the whole system around the model as much as the model itself: the real-time voice layer, the FastAPI and Postgres services, the jobs, retries and migrations, and the part where it breaks in production and someone has to fix it. Before that I was the first engineering hire at an early-stage startup, built a GenAI assistant at EY, and reached the Smart India Hackathon 2024 grand finale. This site is where I write about what I'm building, what goes wrong, and what I'm learning next, including machine learning from first principles.
    - experiences — keep the four rows and their remaining highlights; set each **first** highlight to:
      - BerriBot: "Building an AI tutor that teaches live over voice and video, sets and marks assessments, and moves learners through a syllabus. Plus AI proctoring and the FastAPI and Postgres backend under it."
      - SkillSync: "Shipped an AI interviewer that replaced the human screening loop: several agents running spoken screening, technical and behavioural rounds in one live LiveKit session. Owned the real-time voice layer."
      - EY: "Built an AI assistant over internal data with FastAPI and Gemini, and a portal to put unassigned staff back on work."
      - Ransh: "First engineering hire at an early-stage startup. Built the product end to end, side by side with the founder."
      (drop the old bullet each of these replaces if it says the same thing; keep the rest.)
  - Rewrite header comments: no consulting-pitch language.
- [ ] **Step 3: Rewrite `seed.sql`** = explicit **reset**: header says "OVERWRITES content tables"; `delete from` + plain `insert` of the same values as setup.sql for profile, site_sections, experiences, skills, projects, achievements, education. Posts/subscribers/messages untouched.
- [ ] **Step 4: Write the smoke test.** `supabase/tests/stubs.sql` creates just enough Supabase surface for plain Postgres: `create extension pgcrypto`; `create schema auth; create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;`; `create schema storage; create table storage.buckets (id text primary key, name text, public boolean); create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text); alter table storage.objects enable row level security;`. `supabase/tests/smoke.sh` (bash, `set -euo pipefail`): start `postgres:16` in Docker on a random port, wait for ready, then via `docker exec … psql -v ON_ERROR_STOP=1`:
  1. stubs → `setup.sql` → assert counts: profile 1, site_sections 4, experiences 4, projects 4, buckets 2;
  2. `update profile set handle='EDITED'` → `setup.sql` again → assert handle still `EDITED` and counts unchanged (fill-if-empty + idempotent);
  3. dump content tables (`copy (select … order by …) to stdout`) → run `seed.sql` → dump again; then fresh container: stubs → setup → dump; assert seed-dump == fresh-setup-dump (catches value drift between the two files);
  4. apply `migrations/0001`…`0006` in order on a fresh container → assert the same columns exist (`information_schema.columns`);
  5. remove container (trap on exit).
- [ ] **Step 5: Run** `bash supabase/tests/smoke.sh` — Expected: prints `SMOKE OK`. If the Docker daemon isn't running, start it (`open -a Docker`) and retry; if Docker is unavailable entirely, note it in the task report — Task 3 (run twice on real Supabase) then carries the SQL verification.
- [ ] **Step 6: Docs.** `supabase/README.md`: new top section **"Set up a new Supabase project"**: (1) SQL Editor → paste all of `supabase/setup.sql` → Run, or `psql "<connection string>" -f supabase/setup.sql`; (2) Authentication → Users → Add user `harshp6421@gmail.com`; (3) disable public sign-ups; (4) set env vars from `.env.example`. Explain: re-running `setup.sql` is safe and never overwrites edits; `seed.sql` **resets** content. Update the migrations list (0005, 0006) and policy summary (subscribers). `README.md`: link to that section.
- [ ] **Step 7: Commit** — `feat(db): personal-brand schema, fill-if-empty setup, reset seed, smoke test`

---

### Task 3: Provision Harsh's new Supabase project

The project in `.env.local` (`https://gnbe….supabase.co`) is **empty** — nothing has been run on it. The live site still uses the old project; never point anything at the old one. Doing this now means every later task verifies against real seeded content.

- [ ] **Step 1: Ask Harsh** (one message, two questions): **(a)** run `supabase/setup.sql` — he pastes it into the SQL editor, or he provides a connection string so you run `psql "<conn>" -v ON_ERROR_STOP=1 -f supabase/setup.sql`; **(b)** admin login — create auth user `harshp6421@gmail.com` with a temporary password via the service key in `.env.local` (scratch script calling `supabase.auth.admin.createUser({ email, password, email_confirm: true })`; password never in chat or git; Harsh resets it later), or he creates the user himself. Also ask him to disable public sign-ups in the dashboard.
- [ ] **Step 2: Run `setup.sql` twice** (his chosen way). Both runs complete without errors.
- [ ] **Step 3: Verify with the anon key** (read values from `.env.local` with `grep`/`cut`, never `source` it — a value contains shell-hostile characters): `GET $URL/rest/v1/profile?select=full_name,handle,career_start_date` → `Harsh Pandey`, `Knight Developer`, `2025-03-01`; `GET $URL/rest/v1/site_sections?select=key` → exactly `projects, blog, newsletter, experience`; `GET $URL/rest/v1/subscribers?select=id` → `[]` (anon cannot read).
- [ ] **Step 4: Admin login** per his choice; `npm run dev` → `/admin/login` → sign in → dashboard loads (still the old UI at this point). No commit (no repo changes).

---

### Task 4: Content fetchers and SEO builders

Read first: `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`.

**Files:**
- Modify: `src/lib/content.ts`, `src/lib/config.ts`
- Create: `src/lib/seo.ts`, `src/lib/seo.test.ts`

**Interfaces:**
- Consumes: Task 1 types, `formatExperienceYears`, `fillYears`, `handleSlug`.
- Produces (`content.ts`): remove `isBlogEnabled`; add `getLatestPosts(limit = 5): Promise<Post[]>`; `getAdjacentPosts(post: Post): Promise<{ previous: Post | null; next: Post | null }>` (previous = next-older published, next = next-newer, by `published_at`); `getCurrentExperience(): Promise<Experience | null>` (first `is_current`, else null). `getEnabledSections` is unchanged.
- Produces (`config.ts`): `brand = { name: "Harsh Pandey", handle: "Knight Developer", initials: "HP", headline: "AI engineer & builder", subline: <seed headline>, email }`.
- Produces (`seo.ts`, pure, all take `siteUrl` as a parameter):
  - `buildPersonJsonLd(args: { siteUrl: string; profile: Profile | null; skills: string[]; currentCompany: string | null; school: string | null }): Record<string, unknown>` — `@id` `${siteUrl}/#person`
  - `buildWebsiteJsonLd(siteUrl: string, name: string): Record<string, unknown>`
  - `buildProfilePageJsonLd(siteUrl: string): Record<string, unknown>`
  - `buildBlogPostingJsonLd(args: { siteUrl: string; post: Post; imageUrl: string }): Record<string, unknown>`
  - `buildRssXml(args: { siteUrl: string; title: string; description: string; posts: Post[] }): string`
  - `buildLlmsTxt(args: { siteUrl: string; profile: Profile | null; years: string | null; posts: Post[]; projects: Project[] }): string`
  - `serializeJsonLd(data: unknown): string` (JSON with `<` → `<`, as today)

- [ ] **Step 1: Write failing tests** in `seo.test.ts`. Fixtures: `S = "https://k.dev"`, `I = S + "/og.png"`, `p` = full `Profile` (full_name "Harsh Pandey", handle "Knight Developer", headline with `*…*` and `{years}`), `post` = published `Post` with slug "hello", excerpt, tags, `published_at`; `bare` = `post` with excerpt "", tags [], all source fields null, tldr [], cover null; `L`/`Y` = LinkedIn/YouTube URLs.

```ts
test("person JSON-LD carries both names, socials and employer", () => {
  const ld = buildPersonJsonLd({ siteUrl: "https://k.dev", profile: { ...p, socials: { linkedin: L, youtube: Y } }, skills: ["LiveKit"], currentCompany: "BerriBot", school: "REC Sonbhadra" });
  assert.deepEqual(ld.alternateName, ["Knight Developer", "knightdeveloper"]);
  assert.ok((ld.sameAs as string[]).includes(Y));
  assert.deepEqual(ld.worksFor, { "@type": "Organization", name: "BerriBot" });
  assert.deepEqual(ld.knowsAbout, ["LiveKit"]);
});
test("person JSON-LD omits worksFor/alumniOf when unknown", () => {
  const ld = buildPersonJsonLd({ siteUrl: "https://k.dev", profile: p, skills: [], currentCompany: null, school: null });
  assert.equal("worksFor" in ld, false); assert.equal("alumniOf" in ld, false);
});
test("blog posting links its source only when set", () => {
  assert.equal(buildBlogPostingJsonLd({ siteUrl: S, post: { ...post, source_url: "https://youtu.be/x" }, imageUrl: I }).isBasedOn, "https://youtu.be/x");
  assert.equal("isBasedOn" in buildBlogPostingJsonLd({ siteUrl: S, post: bare, imageUrl: I }), false);
});
test("rss escapes titles and wraps content safely", () => {
  const xml = buildRssXml({ siteUrl: S, title: "Notes", description: "d", posts: [{ ...post, title: "A & B", content: "<p>x]]>y</p>" }] });
  assert.match(xml, /<title>A &amp; B<\/title>/);
  assert.match(xml, /<link>https:\/\/k\.dev\/notes\/hello<\/link>/);
  assert.ok(!xml.includes("x]]>y"));
});
test("rss with no posts is still a valid channel", () => {
  assert.match(buildRssXml({ siteUrl: S, title: "Notes", description: "d", posts: [] }), /<channel>[\s\S]*<\/channel>/);
});
test("llms.txt leads with name and handle and lists notes", () => {
  const txt = buildLlmsTxt({ siteUrl: S, profile: p, years: "1.5+", posts: [post], projects: [] });
  assert.ok(txt.startsWith("# Harsh Pandey (Knight Developer)"));
  assert.ok(txt.includes(`- [${post.title}](https://k.dev/notes/${post.slug})`));
  assert.ok(!txt.includes("{years}"));
});
```

- [ ] **Step 2: Run `npm test`** — Expected: FAIL.
- [ ] **Step 3: Implement** `seo.ts` and the `content.ts`/`config.ts` changes.
  - Every human-readable string taken from profile text goes through `stripEmphasis(fillYears(text, years))`.
  - Person: `name`, `alternateName: [handle, handleSlug(handle)]` (fallback `brand.handle` is **not** importable in tests — take handle from profile, default `"Knight Developer"` literal inside seo.ts), `url`, `jobTitle` (title), `description` (headline), `image` (absolute: avatar_url, prefixing siteUrl when root-relative), `sameAs` (linkedin, github, youtube, instagram, twitter, website — set ones only), `knowsAbout`, optional `worksFor`, `alumniOf: { "@type": "CollegeOrUniversity", name }`.
  - BlogPosting: `headline`, `description` (excerpt or omitted), `datePublished`, `dateModified` (`updated_at`), `author: { "@id": `${siteUrl}/#person` }`, `image`, `keywords` (tags joined), `mainEntityOfPage` (note URL), optional `isBasedOn`.
  - RSS 2.0 with `xmlns:content` and `xmlns:atom` (self link `${siteUrl}/notes/rss.xml`); item: title, link, guid (isPermaLink), `pubDate` = `new Date(published_at).toUTCString()`, description (escaped excerpt), `content:encoded` CDATA with `]]>` split as `]]]]><![CDATA[>`.
  - llms.txt (llmstxt.org shape): `# {name} ({handle})`, blank, `> {filled headline}`, blank, filled bio, `## Pages` (About, Notes, Projects with absolute URLs), `## Notes` (`- [title](url): excerpt`), `## Projects`, `## Elsewhere` (set socials). Omit empty sections.
- [ ] **Step 4: Run `npm test`** — Expected: PASS.
- [ ] **Step 5: Commit** — `feat: content fetchers and SEO builders (JSON-LD, RSS, llms.txt)`

---

### Task 5: Field notes theme, fonts, prose and highlight mark

Read first: `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`.

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/public/prose.tsx`, `src/lib/sanitize.ts`, `src/lib/sanitize.test.ts`, `src/components/editor/rich-text-editor.tsx`, `src/components/editor/toolbar.tsx`, `package.json`

**Interfaces:**
- Produces: CSS tokens/utilities later tasks use by name — `--color-highlight` (`bg-highlight`), `--color-faint` (`text-faint`), `--color-rule` (`border-rule`); utilities `shadow-ink` (`4px 4px 0 var(--foreground)`), `shadow-ink-lg` (`5px 5px 0 …`), `bg-ruled` (horizontal 1px rule every 30px, ~45% opacity, as mockup `.p::before`), `mark-hl` (`linear-gradient(transparent 58%, var(--highlight) 58%)`); font variables `--font-display` = Fraunces, `--font-sans` = Inter, `--font-mono` = IBM Plex Mono. `--brand` becomes the accent orange (keeps every existing `text-brand`/`bg-brand` usage working).

- [ ] **Step 1: Write failing test** in `sanitize.test.ts`:

```ts
test("sanitizeHtml keeps <mark> highlights and strips their attributes", () => {
  assert.equal(sanitizeHtml('<p>a <mark data-color="x" style="c">b</mark></p>'), "<p>a <mark>b</mark></p>");
});
```
- [ ] **Step 2: Run `npm test`** — Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `sanitize.ts`: add `"mark"` to `ALLOWED_TAGS` (no attributes).
  - `npm install @tiptap/extension-highlight@^3.27.1`; add `Highlight` (no multicolor) to the editor extensions; toolbar button "Highlight" with lucide `Highlighter`, toggling `toggleHighlight()`. Update the editor's allowlist comment.
  - `globals.css` `:root`: background `#f3eee4`, card/popover `#fffaf0`, foreground `#1d1a16`, muted-foreground `#5d564c`, faint `#8a8074`, border/input `#ddd3c2`, rule `#ddd3c2`, brand `#c2410c`, brand-foreground `#fffaf0`, primary `#1d1a16`, primary-foreground `#f3eee4`, secondary/muted/accent `#ebe4d6`, highlight `#fde68a`, ring `#c2410c`, sidebar `#efe8db`, sidebar-foreground `#1d1a16`, sidebar-accent `#e4dccd`, sidebar-border `#ddd3c2`; `--radius: 0.25rem` (mockup corners are 3–4px). `.dark` ("dark paper", starting values — adjust for AA): background `#1a1814`, card `#221f1a`, foreground `#ece4d4`, muted-foreground `#a89f90`, faint `#7d7466`, border `#3a342b`, brand `#fb923c`, brand-foreground `#1a1814`, primary `#ece4d4`, primary-foreground `#1a1814`, secondary/muted/accent `#2a2620`, highlight `rgba(253,230,138,0.28)`, sidebar `#1f1c17`. Keep `@custom-variant dark`. Add the `@utility` blocks listed above. Body gets `bg-background bg-ruled`.
  - `layout.tsx`: replace Space Grotesk/JetBrains with `Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] })`, `Inter`, `IBM_Plex_Mono({ weight: ["400","500"], variable: "--font-plex-mono" })`; map in `@theme inline`. Default metadata title `"Harsh Pandey (Knight Developer) — AI engineer & builder"`, description `brand.subline`; add `alternates.types["application/rss+xml"] = [{ url: "/notes/rss.xml", title: "Notes by Harsh Pandey" }]`; viewport themeColor `#f3eee4` / `#1a1814`.
  - `prose.tsx`: body `font-display text-[1.125rem] leading-[1.75]`; headings Fraunces medium; inline code mono on `bg-card border-rule`; `pre` dark (`bg-[#1d1a16] text-[#ece4d4]`, same in dark mode); links accent underline; `[&_mark]:mark-hl [&_mark]:bg-transparent [&_mark]:text-inherit`; blockquote left border accent. Editor shares `proseClassNames` (already does).
- [ ] **Step 4: Verify** — `npm test` PASS; `npm run dev`, open `/admin/login` and `/` in light and dark: paper background with ruled lines, Fraunces headings, no unstyled flashes. (Pages still use old components — that's expected until Tasks 7–10.)
- [ ] **Step 5: Commit** — `feat(theme): Field notes tokens, fonts, prose and highlight marks`

---

### Task 6: Subscribe collection

Read first: `node_modules/next/dist/docs/01-app/02-guides/forms.md`, `…/02-guides/server-actions.md`.

**Files:**
- Create: `src/app/(site)/subscribe/actions.ts`, `src/components/public/subscribe-form.tsx`, `src/lib/supabase-errors.ts`, `src/lib/supabase-errors.test.ts`

**Interfaces:**
- Consumes: `subscribeSchema` (Task 1).
- Produces: `subscribeAction(prev: SubscribeFormState, formData: FormData): Promise<SubscribeFormState>`, `type SubscribeFormState = { ok?: boolean; error?: string }`; `<SubscribeForm variant="ink" | "card" source={string} />` (form fields `email`, `honeypot`, `source`); `isUniqueViolation(error: { code?: string } | null): boolean`.

- [ ] **Step 1: Failing test** in `supabase-errors.test.ts`:

```ts
test("isUniqueViolation recognises Postgres 23505 only", () => {
  assert.equal(isUniqueViolation({ code: "23505" }), true);
  assert.equal(isUniqueViolation({ code: "42501" }), false);
  assert.equal(isUniqueViolation(null), false);
});
```
- [ ] **Step 2: Run `npm test`** — FAIL.
- [ ] **Step 3: Implement.** Action mirrors `sendContactAction`: honeypot-filled → `{ ok: true }` without insert; insert `{ email, source }` (status defaults); `isUniqueViolation(error)` → `{ ok: true }`; other errors → `{ error: "Something went wrong. Please try again." }` + `console.error`. Success copy (shown by the form): **"You're in. You'll get the next note by email."** Form: `useActionState`, honeypot block copied from `ContactForm`, input placeholder `you@email.com`, button "Subscribe" (pending "Subscribing…"), reset on success, works without JS. Variants: `ink` = mockup `.sub` (dark ink panel input `#2a2620`, highlighter button); `card` = mockup `.endsub` input on paper + solid ink button. Below the field: mono small "No spam. Unsubscribe any time." Form `id="subscribe"` is **not** set here (sections set anchors).
- [ ] **Step 4: Run `npm test`** — PASS.
- [ ] **Step 5: Commit** — `feat: subscriber collection form and action`

---

### Task 7: Site chrome — nav, footer, socials, layout

**Files:**
- Modify: `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx`, `src/components/public/nav.tsx`, `src/components/public/footer.tsx`, `src/components/public/social-icons.tsx`, `src/components/seo/json-ld.tsx`

**Interfaces:**
- Consumes: `getProfile`, `getSkillsByCategory`, `getCurrentExperience`, `getEducation`, `handleSlug`, `brand`, `buildPersonJsonLd`/`buildWebsiteJsonLd`/`serializeJsonLd` (Task 4), `JsonLd` (below).
- Produces: `SiteNav({ name, handle })`, `SiteFooter({ name, handle, socials })`, `SocialLinks` now includes `youtube` (new `YouTubeIcon`) and labels X under `twitter`; `src/components/seo/json-ld.tsx` exports `JsonLd({ data }: { data: unknown })` (replaces `PersonJsonLd`).

- [ ] **Step 1: Implement.**
  - Layout: fetch profile, skills (flatten names, first 8), current experience, education (first institution); render `<JsonLd data={{ "@context": "https://schema.org", "@graph": [person, website] }} />` once for every public page (remove it from `(site)/page.tsx`). Drop `blogEnabled` entirely.
  - Nav (mockup `nav.top`): left "Harsh Pandey" Fraunces 19px semibold + mono `@{handleSlug(handle)}` in faint; links Notes `/notes`, Projects `/projects`, About `/about` (active link ink, others muted); solid ink "Subscribe" button → `/#subscribe` (on note pages it scrolls to the in-page card: link to `#subscribe`, each page provides that anchor); theme toggle. Mobile drawer: same items. Sticky header uses `bg-background/85 backdrop-blur` with bottom `border-rule`.
  - Footer: `© {year} {name} · {handle}` left (mono, faint); right links notes · rss (`/notes/rss.xml`) · subscribe (`/#subscribe`) and `SocialLinks`.
- [ ] **Step 2: Verify** — `npm run lint` clean for these files; `npm run dev`: nav shows no "Start a project"/"Services"/"Blog"; `view-source:/` contains exactly one `application/ld+json` with `"alternateName":["Knight Developer","knightdeveloper"]`.
- [ ] **Step 3: Commit** — `feat: Field notes nav, footer and site-wide person JSON-LD`

---

### Task 8: Homepage

**Files:**
- Modify: `src/components/site-home.tsx`, `src/components/sections/hero.tsx`, `src/app/(site)/page.tsx`, `src/components/sections/section-heading.tsx`
- Create: `src/components/sections/{proof-strip,built,notes-preview,newsletter,work}.tsx`, `src/components/public/note-row.tsx`
- Delete: `src/components/sections/{services,about,projects-preview,experience}.tsx`

**Interfaces:**
- Consumes: `proofCells`, `nowRows`, `projectKicker`, `fillYears`, `formatExperienceYears`, `getFeaturedProjects(3)`, `getLatestPosts(5)`, `getExperiences`, `SubscribeForm`, `dateRange`.
- Produces: `NoteRow({ post }: { post: Post })` (reused by Task 9); `Work({ experiences, variant }: { experiences: Experience[]; variant: "home" | "full" })` (reused by Task 10); `SectionHeading({ title, href?, linkLabel?, note? })` restyled to mockup `.sec-h` (Fraunces 30px title, 1.5px ink bottom rule, mono right link) + optional italic Fraunces `note`.

- [ ] **Step 1: Implement**, matching mockup v3 "Homepage" tab top to bottom:
  - **Hero** (`hero.tsx`, client only for motion): kicker mono accent `{title} · {location first comma segment}`; `h1` = full name (Fraunces ~76px desktop / ~52px mobile); thesis = `fillYears(headline)` Fraunces 30px with the phrase between `*asterisks*` in the stored text rendered as accent italic (support exactly one `*…*` pair; otherwise plain); lede = `fillYears(tagline)`; buttons "See what I've built →" (`/projects`, solid ink) and "Read my notes" (`/notes`, outline) in mono; `SocialLinks` row. Right column: polaroid (`avatar_url ?? "/profile.png"`, hide on load error, caption = location first segment, tape strip, rotate 2.2°) and Now card (`nowRows`, heading "Now" + `format(now_updated_at ?? updated_at, "MMM yyyy")`, rotate −1.4°, `shadow-ink-lg`); hide the card when `nowRows` is empty. On mobile both stack under the text, rotations kept, no overflow at 375px.
  - **ProofStrip**: `proofCells(profile)`; 4-col grid on desktop / 2-col mobile, dashed dividers, Fraunces 30px value, mono label; render nothing when empty.
  - **Built** (`key: projects`, anchor `id="built"`): `SectionHeading title="Things I've built" note="My own projects, built outside of work." href="/projects" linkLabel="all projects →"`; 3 cards (mockup `.wk.big`: card bg, ink border, `shadow-ink`), kicker `projectKicker(label, !!links.live)`, Fraunces title, summary, tags as mono chips; card links to `/projects/{slug}`.
  - **NotesPreview** (`key: blog`): `SectionHeading title="Notes" href="/notes" linkLabel="all notes →"`; `NoteRow` list (mockup `.note`: date mono | title + excerpt + source line `↳ notes on {source_title}` only when set | read time + first tag). Empty state: Fraunces italic line **"The first note is on its way. Subscribe and you'll get it the day it's out."** + `<SubscribeForm variant="card" source="/" />`.
  - **Newsletter** (`key: newsletter`, anchor `id="subscribe"`): ink panel — "Get the next note *in your inbox.*" (highlighter-colored italic), sub "One email when I publish something new. Nothing else.", `<SubscribeForm variant="ink" source="/" />`. When this section is disabled, keep an empty `<div id="subscribe" />` near the notes preview so the nav button still lands somewhere sensible (render it in `SiteHome` if `newsletter` isn't enabled).
  - **Work** (`key: experience`, `variant="home"`): `SectionHeading title="Work" note="What I've built for the teams I've worked with." href="/about#work" linkLabel="full story on About →"`; rows (mockup `.role`): `dateRange(...)` mono (accent when `is_current`), "Role · Company" Fraunces, `highlights[0]`, first two `tags` as chips. `variant="full"` (About): all highlights as a list.
  - `site-home.tsx`: Hero + ProofStrip always, then enabled sections in order mapped by the four keys.
  - `(site)/page.tsx` metadata: title `` `${full_name} (${handle}) — ${title}` ``, description `stripEmphasis(fillYears(headline, years))`, canonical `/`.
- [ ] **Step 2: Verify** against the seeded new project (`npm run dev`): matches the mockup v3 homepage at 1280px and 375px, light + dark; hero shows "1.5+" (or the current value) where `{years}` was; no literal `*`, `{years}` or "undefined"; Notes shows the empty state (no notes yet) with a working-looking subscribe form.
- [ ] **Step 3: Commit** — `feat: Field notes homepage (hero, proof, built, notes, subscribe, work)`

---

### Task 9: Notes — list, note page, OG image, RSS, redirects

Read first: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`, `…/03-api-reference/05-config/01-next-config-js/redirects.md`, `…/03-api-reference/04-functions/image-response.md`, `…/03-api-reference/04-functions/generate-metadata.md`.

**Files:**
- Create: `src/app/(site)/notes/page.tsx`, `src/app/(site)/notes/[slug]/page.tsx`, `src/app/(site)/notes/[slug]/og/route.tsx`, `src/app/(site)/notes/rss.xml/route.ts`, `src/components/public/notes-list.tsx`, `src/components/public/source-card.tsx`, `src/assets/fonts/fraunces-latin-400-normal.woff`, `src/assets/fonts/ibm-plex-mono-latin-400-normal.woff`, `src/lib/og-fonts.ts`
- Modify: `next.config.ts`, `src/components/public/tag-filter.tsx`
- Delete: `src/app/(site)/blog/` (both pages), `src/components/public/blog-grid.tsx`, `src/components/public/post-card.tsx`

**Interfaces:**
- Consumes: `NoteRow`, `getPublishedPosts`, `getPostBySlug`, `getAdjacentPosts`, `getProfile`, `buildBlogPostingJsonLd`, `buildRssXml`, `JsonLd`, `SubscribeForm`, `Prose`.
- Produces: `loadOgFonts(): Promise<{ name: string; data: Buffer; weight: 400; style: "normal" }[]>` (reads both woff files via `readFile(join(process.cwd(), "src/assets/fonts/…"))`) — reused by Task 11.

- [ ] **Step 1: Fonts.** Download once: `curl -L -o src/assets/fonts/fraunces-latin-400-normal.woff https://cdn.jsdelivr.net/npm/@fontsource/fraunces@5.2.5/files/fraunces-latin-400-normal.woff` and `… /@fontsource/ibm-plex-mono@5.2.5/files/ibm-plex-mono-latin-400-normal.woff` (both OFL; WOFF is supported by ImageResponse, WOFF2 is not). Verify each starts with bytes `wOFF` (`head -c4`).
- [ ] **Step 2: Implement.**
  - `/notes`: heading kicker "Notes", Fraunces h1 "Notes", sub "What I'm building, what goes wrong, and what I'm learning next."; `NotesList` (client: `TagFilter` restyled to mono chips with ink active state + `NoteRow` list); empty → same empty-state copy + card subscribe form as homepage. Metadata: title `Notes — Harsh Pandey`, canonical `/notes`.
  - `/notes/[slug]`: layout per mockup "A note" tab, `max-w-[680px]`: "← all notes" (mono) → meta row (date `MMM d, yyyy` · `{n} min read` · tag chips) → h1 Fraunces ~50px → dek = excerpt (omit when blank) → `SourceCard` (only when `source_url`; label `Notes on` + kind; action text `watch ↗` for video, `listen ↗` for podcast, else `read ↗`; title falls back to the URL host) → "The short version" (only when `tldr.length`; accent left border, mono label, bullet list) → cover image if set → `Prose` → end card `id="subscribe"`: Fraunces "Liked this? Get the next one." + "Every new note, in your inbox. One email per note, nothing else." + `<SubscribeForm variant="card" source={`/notes/${slug}`} />` → author line: avatar circle, "**{full_name}** ({handle}) · {title}. [More about me](/about)" → previous/next cards (omit missing side). `notFound()` for unknown/draft slugs. `<JsonLd>` BlogPosting with `imageUrl` = cover or `${siteUrl}/notes/${slug}/og`. Metadata: title `{post.title} — Harsh Pandey`, description excerpt, canonical `/notes/{slug}`, `openGraph: { type: "article", publishedTime, images: [{ url: cover ?? `/notes/${slug}/og`, width: 1200, height: 630 }] }`, `twitter.card = "summary_large_image"`. **No `isBlogEnabled` gating.**
  - `og/route.tsx` (GET, `ImageResponse` 1200×630, fonts from `loadOgFonts`): paper `#f3eee4` with ruled lines; mono accent kicker `NOTE · {MMM d, yyyy}`; Fraunces title ink 64px, clamp to 3 lines (shrink to 52px when > 70 chars); bottom row mono `{full_name} · @{handleSlug(handle)}` left, `knightdeveloper.com` (host of `siteUrl`) right; 6px accent bar at left edge. Unknown slug → 404 response.
  - `rss.xml/route.ts`: `GET` → `buildRssXml({ siteUrl, title: "Notes by Harsh Pandey", description: fillYears(headline) stripped, posts })`, header `Content-Type: application/rss+xml; charset=utf-8`, `export const dynamic = "force-dynamic"`.
  - `next.config.ts`: `redirects()` → `/blog` → `/notes` and `/blog/:slug` → `/notes/:slug`, both `permanent: true`.
  - Update `revalidatePath` targets in `src/app/admin/(dashboard)/blog/actions.ts` from `/blog…` to `/notes`, `/notes/${slug}` (keep `/`).
- [ ] **Step 3: Verify** (`npm run dev`, any DB state):
  - `curl -sI localhost:3002/blog/hello | grep -i -E "^(HTTP|location)"` → `308` + `location: /notes/hello`.
  - `curl -s -o /dev/null -w "%{http_code}" localhost:3002/notes/does-not-exist` → `404`.
  - `curl -s localhost:3002/notes/rss.xml | head -3` → XML declaration + `<rss`.
  - In the (still old-UI) admin, publish a throwaway note with only title + body: note page `view-source` has `og:image` ending `/notes/<slug>/og`, that URL renders the card, and the page shows no excerpt/source/short-version/cover/tag blocks. Delete the note afterwards. (The richer note with source/tldr is exercised in Task 14 once the form fields exist.)
- [ ] **Step 4: Commit** — `feat: notes pages, note OG images, RSS feed and /blog redirects`

---

### Task 10: Projects pages and About page

**Files:**
- Modify: `src/app/(site)/projects/page.tsx`, `src/app/(site)/projects/[slug]/page.tsx`, `src/components/public/project-card.tsx`, `src/components/public/projects-grid.tsx`, `src/components/sections/{skills,achievements,education,contact,contact-form}.tsx`
- Create: `src/app/(site)/about/page.tsx`

**Interfaces:**
- Consumes: `Work` (variant `full`), `projectKicker`, `fillYears`, `formatExperienceYears`, `buildProfilePageJsonLd`, `JsonLd`, `ContactForm`.

- [ ] **Step 1: Implement.**
  - `/projects`: kicker "Projects", h1 "Things I've built", sub "My own projects, built outside of work."; grid of `ProjectCard` (same card as homepage Built, 2-col desktop) with restyled `TagFilter`. Detail page: Field notes article layout (like note page without source/tldr/subscribe), live/repo links as mono buttons. Metadata canonical `/projects`, `/projects/{slug}`.
  - `/about` (sections in this order, each hidden when it has no data): header — polaroid photo + h1 full name + mono line "known online as {handle}" + `fillYears(bio)` in Fraunces 19px; `id="work"` Work (`variant="full"`); Skills by category (mono chips per category, Fraunces category titles); Achievements (list); Education; "Say hello" (`id="contact"`): restyled `ContactForm` + email + `SocialLinks`; résumé text link "Résumé (PDF)" only when `resume_url`. Metadata: title `About — Harsh Pandey`, description first sentence of filled bio, canonical `/about`; `<JsonLd>` ProfilePage.
  - Restyle `skills/achievements/education/contact` section components to the notebook look (they're now About-page blocks; drop their homepage `id` anchors except those above).
- [ ] **Step 2: Verify** — `/about` and `/projects` render the seeded content and match the notebook look at 1280px and 375px; contact form still inserts (checked in Task 14); no "Start a project" anywhere: `grep -rn "Start a project\|Available for new\|get hired" src` → no matches.
- [ ] **Step 3: Commit** — `feat: About page and Field notes projects pages`

---

### Task 11: Discoverability — llms.txt, robots, sitemap, default OG

**Files:**
- Create: `src/app/llms.txt/route.ts`
- Modify: `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image.tsx`

**Interfaces:**
- Consumes: `buildLlmsTxt`, `loadOgFonts`, content fetchers.

- [ ] **Step 1: Implement.**
  - `llms.txt/route.ts`: `GET` → `buildLlmsTxt(...)` with `formatExperienceYears(profile?.career_start_date)`, `Content-Type: text/plain; charset=utf-8`, force-dynamic.
  - `robots.ts`: `rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }, { userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"], allow: "/", disallow: "/admin" }]`, sitemap unchanged.
  - `sitemap.ts`: static `/`, `/about`, `/notes`, `/projects`; notes at `/notes/{slug}`; projects as today.
  - `opengraph-image.tsx` (site default): paper card — Fraunces name 72px, mono accent kicker "AI ENGINEER & BUILDER", Fraunces 30px line "I build AI that does the actual work.", bottom mono `@knightdeveloper · knightdeveloper.com`; uses `loadOgFonts`; stays static (no DB).
- [ ] **Step 2: Verify** — `curl -s localhost:3002/llms.txt | head -3` starts `# Harsh Pandey (Knight Developer)` and contains no `*` or `{years}`; `curl -s localhost:3002/robots.txt` lists the four bots and `Disallow: /admin`; `curl -s localhost:3002/sitemap.xml | grep -c "/notes"` ≥ 1; `localhost:3002/opengraph-image` renders.
- [ ] **Step 3: Commit** — `feat: llms.txt, AI-crawler robots rules, sitemap and default OG card`

---

### Task 12: Admin look — shell, login, page headers, dashboard

**Files:**
- Modify: `src/components/admin/shell.tsx`, `src/app/admin/login/page.tsx`, `src/components/admin/login-form.tsx`, `src/app/admin/(dashboard)/page.tsx`, list pages under `src/app/admin/(dashboard)/{profile,sections,blog,projects,experience,skills,achievements,education,messages}/page.tsx`
- Create: `src/components/admin/page-header.tsx`

**Interfaces:**
- Produces: `AdminPageHeader({ kicker, title, description?, actions? }: { kicker: string; title: string; description?: string; actions?: ReactNode })` — mono uppercase accent kicker, Fraunces 28px title, muted description, actions right-aligned.

- [ ] **Step 1: Implement.**
  - Shell: paper sidebar (`bg-sidebar`, `border-rule`), header block "Admin" Fraunces 18px + mono `@knightdeveloper` faint; nav order **Dashboard · Profile · Sections · Notes (`/admin/blog`, icon `NotebookPen`) · Projects · Experience · Skills · Achievements · Education · Messages · Subscribers (`/admin/subscribers`, icon `Users`)**; active item = ink background + paper text; "View site ↗" link above sign-out. Mobile drawer same.
  - Every list page swaps its `<h1>` block for `AdminPageHeader` (kickers: "Overview", "You", "Homepage", "Writing", "Your projects", "Career", "Career", "Career", "Career", "Inbox", "Audience"). "Blog" wording → "Notes" in visible copy (page titles, buttons "New note", empty states).
  - Login: centered card on ruled paper, `shadow-ink-lg`, Fraunces "Admin" title, mono "Harsh Pandey · Knight Developer".
  - Dashboard: `AdminPageHeader kicker="Overview" title="Dashboard" actions={<Button render={<Link href="/admin/blog/new" />}>Write a note</Button>}`; five stat cards — Published notes, Drafts, Projects, Unread messages, Active subscribers (counts via `safeCount`; subscribers `.eq("status","active")`); latest messages card unchanged.
- [ ] **Step 2: Verify** — `npm run lint` and `npx tsc --noEmit` clean for admin files; `/admin/login` renders in light and dark.
- [ ] **Step 3: Commit** — `feat(admin): Field notes admin shell, login and dashboard`

---

### Task 13: Admin forms and Subscribers

**Files:**
- Modify: `src/components/admin/profile-form.tsx`, `src/app/admin/(dashboard)/profile/actions.ts`, `src/components/admin/post-form.tsx`, `src/app/admin/(dashboard)/blog/actions.ts`, `src/components/admin/project-form.tsx`, `src/app/admin/(dashboard)/projects/actions.ts`, `src/components/admin/experience-form.tsx`, `src/app/admin/(dashboard)/experience/actions.ts`
- Create: `src/app/admin/(dashboard)/subscribers/{page.tsx,actions.ts,export/route.ts}`, `src/lib/csv.ts`, `src/lib/csv.test.ts`

**Interfaces:**
- Consumes: Task 1 schemas; `EntityTable`, `RowActions`.
- Produces: `toSubscribersCsv(rows: Subscriber[]): string`; `deleteSubscriberAction(id: string): Promise<EntityActionResult>`; `setSubscriberStatusAction(id: string, status: Subscriber["status"]): Promise<EntityActionResult>`.

- [ ] **Step 1: Failing test** in `csv.test.ts`:

```ts
test("toSubscribersCsv writes a header and quotes risky cells", () => {
  const csv = toSubscribersCsv([{ id: "1", email: "a@b.co", status: "active", source: "/notes/x,y", created_at: "2026-10-22T10:00:00Z" }]);
  assert.equal(csv, 'email,status,source,subscribed_at\r\na@b.co,active,"/notes/x,y",2026-10-22T10:00:00Z\r\n');
});
test("toSubscribersCsv neutralises spreadsheet formulas", () => {
  const csv = toSubscribersCsv([{ id: "1", email: "=cmd@x.co", status: "active", source: null, created_at: "t" }]);
  assert.ok(csv.includes("'=cmd@x.co"));
});
```
- [ ] **Step 2: Run `npm test`** — FAIL.
- [ ] **Step 3: Implement.**
  - **Profile form/action:** new card "Who you are" — `handle`, `title`, `headline` (help: "Wrap one phrase in *asterisks* to italicise it. Use {years} for your live years of experience."), `tagline` (same {years} help), `bio` (same), `career_start_date` (date; help "First full-time role. Years on the site are counted from here."). Card "Now" — three inputs `now.building`, `now.writing`, `now.learning`. Card "Highlights" — three rows `highlights.{i}.value` / `highlights.{i}.label` (help: "The first cell, years of experience, is automatic."). Socials add `socials.youtube`, `socials.instagram` (**fixes the Instagram link being wiped on save**). Action: build the new fields from FormData; read the existing row's `now`; set `now_updated_at = new Date().toISOString()` only when any trimmed now value differs; upsert as today; `revalidatePath("/")`, `"/about"`.
  - **Post form/action:** card "Source (optional)" — `source_title`, `source_url`, `source_kind` select (None + `SOURCE_KINDS` capitalised). Card "The short version (optional)" — `tldr` ×3 single-line inputs (`formData.getAll("tldr")`). For published notes, a "View on site ↗" link to `/notes/{slug}`. Include new fields in insert/update payloads. (Revalidate paths already updated in Task 9.)
  - **Project form/action:** `label` input (help "Short kicker, e.g. AI product, SaaS. ‘· live’ is added automatically."); include in payload.
  - **Experience form/action:** `tags` input (comma-separated, help "1–2 short tags shown on the homepage").
  - **Subscribers page:** `AdminPageHeader kicker="Audience" title="Subscribers" description="{n} active"` + "Export CSV" button (`<a href="/admin/subscribers/export" download>`); `EntityTable`-style table (email, status badge, source, date) with row actions Delete and Mark unsubscribed / Mark active (no edit page — pass actions without `editHref`, extend `EntityTable`/`RowActions` minimally if `editHref` is required); empty state "No subscribers yet. The subscribe box is live on the homepage and every note."
  - **Export route:** `GET` → `getSessionUser()` else `401`; fetch all subscribers newest first; return `toSubscribersCsv` with `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="subscribers-YYYY-MM-DD.csv"`.
  - `toSubscribersCsv`: header `email,status,source,subscribed_at`, CRLF line endings, RFC 4180 quoting when a cell has `,` `"` CR/LF, prefix `'` when a cell starts with `= + - @`.
- [ ] **Step 4: Run** `npm test` PASS; `npx tsc --noEmit` and `npm run lint` clean.
- [ ] **Step 5: Commit** — `feat(admin): new profile/note/project/experience fields and Subscribers`

---

### Task 14: Acceptance on Harsh's new Supabase project + cleanup

- [ ] **Step 1: Unreachable-database check (Review Focus 3).** Start a second dev server with real env vars overridden (process env wins over `.env.local`): `NEXT_PUBLIC_SUPABASE_URL=https://unreachable.invalid npx next dev -p 3003`; then `for p in / /notes /projects /about /notes/rss.xml /llms.txt /sitemap.xml /robots.txt; do curl -s -o /dev/null -w "$p %{http_code}\n" localhost:3003$p; done` → all `200`; stop it.
- [ ] **Step 2: Walk the spec §11.4 checklist in the running app** (normal `npm run dev`) (use the `run` skill to launch and drive the app in a browser; if no browser automation is available, a throwaway Playwright script in the scratchpad — never committed). For each line, record pass/fail:
  - Login → dashboard; logout; signed-out `/admin/profile` redirects to `/admin/login`; a non-admin email is rejected.
  - Profile: edit Now + highlights + Instagram/YouTube → save → homepage shows them, Now card month updates, Instagram link survives a second save. Then clear all Now fields, all highlights and the career start date → homepage shows no Now card, no proof strip, no `{years}` text (Review Focus 1) → restore.
  - Sections: toggle Notes off → homepage block hidden, `/notes` still 200; reorder; toggle back.
  - Notes: create draft with cover upload + inline image + highlight + source + 3 tldr lines → not on `/notes`; publish → on homepage, `/notes`, RSS, sitemap, `llms.txt`; note page shows source card + short version; `og` URL renders; create a second note with the same title → slug gets `-2`; create a **bare** note (title + body only) → page shows no empty blocks (Review Focus 2); delete both.
  - Projects: create with cover upload + label + live link → kicker "Label · live"; edit; delete.
  - Experience (tags), Skills, Achievements, Education: create, edit, delete each → reflected on `/about` (and Work on homepage).
  - Contact form on `/about` → row in Messages → mark read.
  - Subscribe on homepage with `"  Test@Example.com "`, then again on a note page → **one** row `test@example.com`, same success message both times (Review Focus 4); Export CSV downloads; mark unsubscribed; delete.
  - Redirects and 404 (Task 9 Step 3 commands) against the seeded DB.
  - Light + dark, 375px and 1280px: homepage, note page, About, admin dashboard.
- [ ] **Step 3: Clean up test data** (service-role scratch script or SQL editor): delete all rows in `posts`, `subscribers`, `contact_messages`; remove every object in the `media` and `blog-images` buckets created during testing; run `supabase/seed.sql` (same way Harsh chose in Task 3) to reset content tables to the seed. Re-check `/` matches the seeded content and the admin dashboard shows 0 notes / 0 subscribers / 0 messages.
- [ ] **Step 4: Full checks** — `npm test`, `npm run lint`, `npm run build` all pass; `git status` shows no stray scratch files; `.env.local` untouched.
- [ ] **Step 5: Commit** any fixes found during acceptance (`fix: …` per issue), then report to Harsh: checklist results, what he must do to go live (set the new Supabase env vars on his host and deploy; reset the temporary admin password if one was created).
