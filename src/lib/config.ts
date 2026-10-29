/**
 * Single source of truth for site-wide constants.
 * Changing the brand copy should only ever touch this file.
 */

export const brand = {
  name: "Harsh Pandey",
  handle: "Knight Developer",
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

/**
 * The notes RSS feed. A page that sets `alternates` (e.g. a canonical) replaces
 * the root layout's, so such pages set `types: rssAlternateTypes` to keep
 * the feed advertised.
 */
export const rssFeed = { url: "/notes/rss.xml", title: `Notes by ${brand.name}` };
export const rssAlternateTypes = { "application/rss+xml": [rssFeed] };

/**
 * The site default card (src/app/opengraph-image.tsx). A page that sets its
 * own `openGraph`/`twitter` metadata loses the root file-based image, so such
 * pages pass this explicitly. Resolved against `metadataBase`.
 */
export const defaultOgImages = ["/opengraph-image"];
