import type { ReactNode } from "react";
import { SiteNav } from "@/components/public/nav";
import { SiteFooter } from "@/components/public/footer";

/**
 * Public site chrome. This route group wraps home/projects/blog pages (once
 * they exist) with the nav + footer, without touching `/admin`, whose layout
 * lives at `src/app/admin/(dashboard)/layout.tsx`.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
