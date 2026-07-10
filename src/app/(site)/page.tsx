import type { Metadata } from "next";
import { SiteHome } from "@/components/site-home";
import { getProfile } from "@/lib/content";
import { brand } from "@/lib/config";

// Reads the profile + enabled sections straight from the database on every
// request — there's nothing here worth prerendering or caching.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.full_name ?? brand.name;
  const title = profile?.title ? `${name} — ${profile.title}` : name;
  const description = profile?.headline ?? brand.subline;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default function HomePage() {
  return <SiteHome />;
}
