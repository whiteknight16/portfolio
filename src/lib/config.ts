/**
 * Single source of truth for site-wide constants.
 * Changing the brand copy should only ever touch this file.
 */

export const brand = {
  name: "Harsh Pandey",
  initials: "HP",
  headline: "Full Stack Developer",
  subline:
    "Full Stack Developer specializing in MERN, Next.js, FastAPI, and Generative AI.",
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
