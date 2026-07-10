import type { Metadata } from "next";
import { getPublishedProjects } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { ProjectsGrid } from "@/components/public/projects-grid";
import { brand } from "@/lib/config";

// Reads published projects straight from the database on every request —
// there's nothing here worth prerendering or caching.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: `Projects — ${brand.name}`,
    description: "Selected projects, filterable by tag.",
  };
}

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <p className="flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          Projects
        </p>
        <h1 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Selected work
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-base text-muted-foreground">
          Things I&apos;ve designed, built, and shipped — filter by tag to narrow it down.
        </p>
      </Reveal>

      <div className="mt-12">
        {projects.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No projects published yet — check back soon.
          </p>
        ) : (
          <ProjectsGrid projects={projects} />
        )}
      </div>
    </div>
  );
}
