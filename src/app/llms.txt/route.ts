import { getProfile, getPublishedPosts, getPublishedProjects } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { formatExperienceYears } from "@/lib/format";
import { buildLlmsTxt } from "@/lib/seo";

// Built from live content on every request; the fetchers degrade to null / [].
export const dynamic = "force-dynamic";

export async function GET() {
  const [profile, posts, projects] = await Promise.all([
    getProfile(),
    getPublishedPosts(),
    getPublishedProjects(),
  ]);
  const years = formatExperienceYears(profile?.career_start_date ?? null);
  const body = buildLlmsTxt({ siteUrl, profile, years, posts, projects });
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
