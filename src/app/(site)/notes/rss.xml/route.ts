import { getProfile, getPublishedPosts } from "@/lib/content";
import { brand, rssFeed, siteUrl } from "@/lib/config";
import { fillYears, formatExperienceYears, stripEmphasis } from "@/lib/format";
import { buildRssXml } from "@/lib/seo";

// Built from the live notes on every request; an unreachable database still
// yields a valid, empty feed (the fetchers degrade to [] / null).
export const dynamic = "force-dynamic";

export async function GET() {
  const [posts, profile] = await Promise.all([getPublishedPosts(), getProfile()]);
  const years = formatExperienceYears(profile?.career_start_date ?? null);
  const description = stripEmphasis(fillYears(profile?.headline || brand.subline, years));

  const xml = buildRssXml({ siteUrl, title: rssFeed.title, description, posts });
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
