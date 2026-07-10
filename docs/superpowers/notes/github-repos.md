# GitHub repo research — whiteknight16 (Harsh Pandey)

Source: `curl -s "https://api.github.com/users/whiteknight16/repos?per_page=100&sort=updated"`
Fetched 2026-07-05. No rate-limiting encountered; full response returned (89 repos, non-forks and forks included).

## Notable repos

| Repo (html_url) | Description | Homepage | Stars | Language | Notes |
|---|---|---|---|---|---|
| https://github.com/whiteknight16/interview-genie | (none in metadata) | https://interview-genie-snowy.vercel.app | 0 | TypeScript | Matches seed project **Interview Genie** |
| https://github.com/whiteknight16/Gymkhana | (none in metadata) | — | 0 | JavaScript | Matches seed project **Gymkhana**; large repo (9.2MB), no deployed homepage found |
| https://github.com/whiteknight16/Notes-Nest | (none in metadata; README: "Your Next Js powered web based note taking app") | https://notes-nest.vercel.app | 0 | TypeScript | Full-stack notes app: Next.js, TS, Tailwind, ShadCN/UI, Kinde auth, Stripe, Prisma, PostgreSQL. Added as a new project row (`notes-nest`). |
| https://github.com/whiteknight16/portfolio | (none) | https://portfolio-fawn-eight-87.vercel.app | 0 | TypeScript | **This is the current repo being built** (confirmed via `git remote -v` → `whiteknight16/portfolio`). Excluded — self-referential, not a separate portfolio item. |
| https://github.com/whiteknight16/Lumino | (none) | — | 0 | TypeScript | README is the unmodified default TanStack Start scaffold boilerplate — no custom content found. Not added. |
| https://github.com/whiteknight16/WordWise-Extension | "A handy extension for browsers that will help you get some motivation and get going" | — | 0 | JavaScript | Small browser extension (quote-of-the-day). Real but minor; not added (kept to "clearly portfolio-worthy" bar). |
| https://github.com/whiteknight16/ticknest-react-native | (none) | — | 0 | JavaScript | README is an unmodified Expo Snack template — not added. |
| https://github.com/whiteknight16/Drum-Kit, AudioBook, Image-Classifier, WT-Forms-Practice, and the many `*-Python` repos | (none) | — | 0-1 | mostly Python | Small beginner/course-style exercises (Angela Yu 100 Days of Code pattern — Turtle games, "Weather-Alert", "Password-Manager-Python", etc.), dated 2022-2023. Not portfolio-worthy per task guidance. |
| owasp.github.io, GameZone, List-Of-Open-Source-Internships-Programs, oppia, node-express-course | — | various | — | — | Forks (`fork: true`) — excluded per task instructions. |

No other candidate repos stood out as "clearly portfolio-worthy" beyond Notes-Nest, so only one extra project row was added (task allowed up to 2).

## REC Mirzapur — not found

No repo in the account matches "REC Mirzapur" (searched repo names case-insensitively for `rec`, `mirzapur`, `college` — zero matches across all 89 repos). The official college website is likely either:
- not hosted on this GitHub account,
- a private repo, or
- hosted under a different account/org.

`links` for `rec-mirzapur` was left as `'{}'::jsonb` (unchanged) — no URL was invented.

## Mapping applied to `supabase/seed.sql`

| Seed slug | links set |
|---|---|
| `interview-genie` | `{"repo":"https://github.com/whiteknight16/interview-genie","live":"https://interview-genie-snowy.vercel.app"}` |
| `gymkhana` | `{"repo":"https://github.com/whiteknight16/Gymkhana"}` (no live homepage found) |
| `rec-mirzapur` | unchanged — `{}` (no matching repo found; needs manual info from Harsh) |
| `notes-nest` (new row, sort_order 4, status `published`, not featured) | `{"repo":"https://github.com/whiteknight16/Notes-Nest","live":"https://notes-nest.vercel.app"}` |

## Caveats / needs live verification

- Homepage URLs (`interview-genie-snowy.vercel.app`, `notes-nest.vercel.app`) came directly from the GitHub API `homepage` field but were not independently loaded/verified to confirm they currently resolve (deployments can go stale).
- `rec-mirzapur` still has no links — recommend asking Harsh directly for the URL/repo, since it isn't discoverable via the public GitHub API.
