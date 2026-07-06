"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { Reveal } from "@/components/public/reveal";
import { TagFilter } from "@/components/public/tag-filter";
import { ProjectCard } from "@/components/public/project-card";

/**
 * Client-side tag filter + grid for the `/projects` list. Takes the full
 * published-projects array from the server page and derives the distinct
 * tag set itself, so the server page stays a plain fetch-and-render.
 */
export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const seen = new Set<string>();
    for (const project of projects) {
      for (const t of project.tags) seen.add(t);
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filtered = useMemo(
    () => (tag === null ? projects : projects.filter((p) => p.tags.includes(tag))),
    [projects, tag],
  );

  return (
    <div>
      {tags.length > 0 ? (
        <Reveal>
          <TagFilter tags={tags} value={tag} onChange={setTag} className="mb-10" />
        </Reveal>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No projects match that tag.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <Reveal key={project.id} delay={Math.min(i * 0.06, 0.24)} className="h-full">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
