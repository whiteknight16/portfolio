import { getEnabledSections, getProfile } from "@/lib/content";
import { Hero } from "@/components/sections/hero";
import { ExperienceSection } from "@/components/sections/experience";
import { ProjectsPreview } from "@/components/sections/projects-preview";
import type { SiteSection } from "@/lib/types";

/**
 * The real portfolio home. A server component: fetches the profile once
 * (shared by `Hero`, `About`, and `Contact` to avoid duplicate reads) and
 * the enabled `site_sections`, then renders `Hero` followed by each enabled
 * section — in `sort_order` — mapped to its component. Sections not present
 * in `getEnabledSections()` (disabled in the admin) are simply skipped;
 * every section component additionally degrades to `null` on its own if it
 * has no data, so a briefly-unreachable database never crashes the page.
 */
export async function SiteHome() {
  const [profile, sections] = await Promise.all([getProfile(), getEnabledSections()]);

  return (
    <>
      <Hero profile={profile} />
      {sections.map((section) => renderSection(section))}
    </>
  );
}

function renderSection(section: SiteSection) {
  switch (section.key) {
    case "experience":
      return <ExperienceSection key={section.id} />;
    case "projects":
      return <ProjectsPreview key={section.id} />;
    default:
      return null;
  }
}
