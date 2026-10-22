import type { Metadata } from "next";
import { SiteHome } from "@/components/site-home";
import { getProfile } from "@/lib/content";
import { brand, rssAlternateTypes } from "@/lib/config";
import { fillYears, formatExperienceYears, stripEmphasis } from "@/lib/format";

// Reads the profile + enabled sections straight from the database on every
// request — there's nothing here worth prerendering or caching.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.full_name || brand.name;
  const handle = profile?.handle || brand.handle;
  const jobTitle = profile?.title || brand.headline;
  const title = `${name} (${handle}) — ${jobTitle}`;
  const years = formatExperienceYears(profile?.career_start_date ?? null);
  const description = stripEmphasis(fillYears(profile?.headline || brand.subline, years));

  return {
    title,
    description,
    alternates: { canonical: "/", types: rssAlternateTypes },
    openGraph: { title, description, type: "website", url: "/", siteName: name },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function HomePage() {
  return <SiteHome />;
}
