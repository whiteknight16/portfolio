import Link from "next/link";
import { TagChip } from "@/components/public/tag-chip";
import { projectKicker } from "@/lib/profile-view";
import type { Project } from "@/lib/types";

const MAX_TAGS = 4;

/**
 * Field notes project card (mockup `.wk.big`): mono kicker, Fraunces title,
 * summary and tags on a card with a hard ink shadow, linking to
 * `/projects/[slug]`. Shared by the homepage "Things I've built" and /projects.
 */
export function ProjectCard({ project }: { project: Project }) {
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
