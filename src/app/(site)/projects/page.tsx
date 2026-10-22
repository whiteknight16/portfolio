import type { Metadata } from "next";
import { getProfile, getPublishedProjects } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { ProjectsGrid } from "@/components/public/projects-grid";
import { brand, rssAlternateTypes } from "@/lib/config";

// Reads published projects straight from the database on every request —
// there's nothing here worth prerendering or caching.
export const dynamic = "force-dynamic";

const SUB = "My own projects, built outside of work.";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.full_name || brand.name;
  const title = `Projects — ${name}`;
  return {
    title,
    description: SUB,
    alternates: { canonical: "/projects", types: rssAlternateTypes },
    openGraph: { title, description: SUB, type: "website", url: "/projects", siteName: name },
    twitter: { card: "summary_large_image", title, description: SUB },
  };
}

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 pb-4 sm:px-6 sm:pt-16">
      <Reveal>
        <header className="border-b-[1.5px] border-foreground pb-6">
          <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-brand uppercase">
            Projects
          </p>
          <h1 className="mt-3 font-display text-[44px] leading-none font-normal tracking-[-0.03em] text-foreground sm:text-[56px]">
            Things I&apos;ve built
          </h1>
          <p className="mt-4 max-w-xl font-display text-lg leading-normal font-light text-muted-foreground sm:text-xl">
            {SUB}
          </p>
        </header>
      </Reveal>

      <div className="mt-6">
        {projects.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No projects published yet. Check back soon.
          </p>
        ) : (
          <ProjectsGrid projects={projects} />
        )}
      </div>
    </div>
  );
}
