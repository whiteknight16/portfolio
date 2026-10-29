import { getExperiences, getProfile, getPublishedPosts, getPublishedProjects } from "@/lib/content";
import { siteUrl } from "@/lib/config";
import { buildInBrief, buildQuickFacts } from "@/lib/facts";
import { formatExperienceYears } from "@/lib/format";
import { buildLlmsFullTxt } from "@/lib/seo";

// Built from live content on every request; the fetchers degrade to null / [].
export const dynamic = "force-dynamic";

/** /llms.txt plus the About facts and Q&A, the work history and every project and note in full. */
export async function GET() {
  const [profile, posts, projects, experiences] = await Promise.all([
    getProfile(),
    getPublishedPosts(),
    getPublishedProjects(),
    getExperiences(),
  ]);
  const years = formatExperienceYears(profile?.career_start_date ?? null);
  const body = buildLlmsFullTxt({
    siteUrl,
    profile,
    years,
    posts,
    projects,
    experiences,
    facts: buildQuickFacts({ profile, projects, noteCount: posts.length }),
    inBrief: buildInBrief({ siteUrl, profile, projects, experiences, noteCount: posts.length }),
  });
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
