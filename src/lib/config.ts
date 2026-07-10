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
// the sitemap/robots file conventions. Falls back to localhost in dev so
// nothing crashes when the env var isn't set (e.g. running tests).
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
