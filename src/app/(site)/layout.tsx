import type { ReactNode } from "react";
import { SiteNav } from "@/components/public/nav";
import { SiteFooter } from "@/components/public/footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCurrentExperience,
  getEducation,
  getProfile,
  getSkillsByCategory,
} from "@/lib/content";
import { brand, siteUrl } from "@/lib/config";
import { buildPersonJsonLd, buildWebsiteJsonLd } from "@/lib/seo";

/**
 * Public site chrome. This route group wraps all public pages with the nav,
 * footer and the site-wide Person/WebSite JSON-LD, without touching `/admin`
 * (its layout lives at `src/app/admin/(dashboard)/layout.tsx`).
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [profile, skillGroups, currentExperience, education] = await Promise.all([
    getProfile(),
    getSkillsByCategory(),
    getCurrentExperience(),
    getEducation(),
  ]);

  const name = profile?.full_name ?? brand.name;
  const handle = profile?.handle || brand.handle;
  const skills = skillGroups
    .flatMap((group) => group.items.map((skill) => skill.name))
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildPersonJsonLd({
        siteUrl,
        profile,
        skills,
        currentCompany: currentExperience?.company ?? null,
        school: education[0]?.institution ?? null,
      }),
      buildWebsiteJsonLd(siteUrl, name),
    ],
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={jsonLd} />
      <SiteNav name={name} handle={handle} />
      <main className="flex-1">{children}</main>
      <SiteFooter name={name} handle={handle} socials={profile?.socials} />
    </div>
  );
}
