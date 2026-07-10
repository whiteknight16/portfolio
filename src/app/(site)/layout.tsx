import type { ReactNode } from "react";
import { SiteNav } from "@/components/public/nav";
import { SiteFooter } from "@/components/public/footer";
import { getEnabledSections, getProfile } from "@/lib/content";

/**
 * Public site chrome. This route group wraps home/projects/blog pages with
 * the nav + footer, without touching `/admin`, whose layout lives at
 * `src/app/admin/(dashboard)/layout.tsx`.
 *
 * Fetches the profile and the enabled sections once (server reads) and wires
 * the real brand name, résumé link, social URLs, and the Blog visibility
 * toggle into `<SiteNav>`/`<SiteFooter>`, which stay client components
 * themselves (mobile menu, theme toggle).
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [profile, sections] = await Promise.all([
    getProfile(),
    getEnabledSections(),
  ]);
  const blogEnabled = sections.some((section) => section.key === "blog");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav
        name={profile?.full_name}
        resumeUrl={profile?.resume_url ?? undefined}
        blogEnabled={blogEnabled}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        name={profile?.full_name}
        socials={profile?.socials}
        blogEnabled={blogEnabled}
      />
    </div>
  );
}
