import type { ReactNode } from "react";
import { SiteNav } from "@/components/public/nav";
import { SiteFooter } from "@/components/public/footer";
import { getProfile } from "@/lib/content";

/**
 * Public site chrome. This route group wraps home/projects/blog pages with
 * the nav + footer, without touching `/admin`, whose layout lives at
 * `src/app/admin/(dashboard)/layout.tsx`.
 *
 * Fetches the profile once (a server component read) and wires the real
 * brand name, résumé link, and social URLs into `<SiteNav>`/`<SiteFooter>`,
 * which stay client components themselves (mobile menu, theme toggle) but no
 * longer need to guess at branding via hardcoded fallbacks.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav name={profile?.full_name} resumeUrl={profile?.resume_url ?? undefined} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        name={profile?.full_name}
        githubUrl={profile?.socials?.github}
        linkedinUrl={profile?.socials?.linkedin}
      />
    </div>
  );
}
