import Link from "next/link";
import { Reveal } from "@/components/public/reveal";
import { TagChip } from "@/components/public/tag-chip";
import { SectionHeading } from "@/components/sections/section-heading";
import { projectKicker } from "@/lib/profile-view";
import type { Project } from "@/lib/types";

const MAX_TAGS = 4;

/**
 * "Things I've built" (mockup `.work.three` / `.wk.big`): Harsh's own featured
 * projects only, never job work (that's the `Work` section). Renders nothing
 * when there are no published projects.
 */
export function Built({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section id="built" className="mx-auto max-w-5xl scroll-mt-24 px-4 pt-14 sm:px-6">
      <Reveal>
        <SectionHeading
          title="Things I've built"
          note="My own projects, built outside of work."
          href="/projects"
          linkLabel="all projects →"
        />
      </Reveal>

      <div className="mt-5 grid gap-4.5 md:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.id} delay={Math.min(i * 0.06, 0.18)} className="flex">
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const kicker = projectKicker(project.label, Boolean(project.links?.live));
  const tags = project.tags.slice(0, MAX_TAGS);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex w-full flex-col rounded-[4px] border border-foreground bg-card px-5.5 py-5 shadow-ink transition-[translate,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-ink-lg"
    >
      {kicker ? (
        <p className="font-mono text-[11px] tracking-[0.08em] text-brand uppercase">{kicker}</p>
      ) : null}
      <h3 className="mt-1.5 font-display text-[22px] leading-[1.15] font-[450] tracking-[-0.015em] text-foreground group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
        {project.title}
      </h3>
      {project.summary ? (
        <p className="mt-2 text-sm leading-[1.55] text-muted-foreground">{project.summary}</p>
      ) : null}
      {tags.length > 0 ? (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-3.5">
          {tags.map((tag) => (
            <TagChip key={tag}>{tag}</TagChip>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
