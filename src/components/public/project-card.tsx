import Link from "next/link";
import { ArrowUpRight, FolderGit2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Cover image + title + summary + tags + links for one project, linking
 * through to `/projects/[slug]`. Plain `<img>` (not `next/image`) since
 * `cover_image_url` is a remote Supabase URL — this avoids having to
 * register a `remotePatterns` entry for a project-controlled hostname.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="h-full justify-between gap-4 transition-shadow hover:shadow-md">
      <Link href={`/projects/${project.slug}`} className="block overflow-hidden">
        {project.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL; see comment above.
          <img
            src={project.cover_image_url}
            alt={project.title}
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground">
            <FolderGit2 className="size-8" />
          </div>
        )}
      </Link>

      <CardHeader>
        <CardTitle className="text-lg">
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors hover:text-muted-foreground"
          >
            {project.title}
          </Link>
        </CardTitle>
        <CardDescription className="mt-1.5 line-clamp-3 text-sm">
          {project.summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        {project.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {project.links?.live || project.links?.repo ? (
          <div className="flex gap-4 text-sm font-medium">
            {project.links?.live ? (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                Live
                <ArrowUpRight className="size-3.5" />
              </a>
            ) : null}
            {project.links?.repo ? (
              <a
                href={project.links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                Code
                <ArrowUpRight className="size-3.5" />
              </a>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
