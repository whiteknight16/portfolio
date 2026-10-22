/**
 * Single source of truth for site-wide constants.
 * Changing the brand copy should only ever touch this file.
 */

export const brand = {
  name: "Harsh Pandey",
  handle: "Knight Developer",
  initials: "HP",
  headline: "AI engineer & builder",
  subline:
    "I build AI that does the actual work: not chatbots, but interviewers and tutors that run live, on voice and video.",
  email: "harshp6421@gmail.com",
} as const;

// Public site origin — used for `metadataBase`, absolute OG image URLs, and
// the sitemap/robots file conventions. Prefers the env var; falls back to the
// real production origin so absolute URLs stay correct even if the var is ever
// missing in prod (and so localhost never leaks into a deployed sitemap).
// Trailing slashes are stripped because callers build paths as `${siteUrl}/x`.
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.knightdeveloper.com";

export const siteUrl = rawSiteUrl.replace(/\/+$/, "");
