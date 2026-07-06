import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedProjects } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Top 3 featured/recent published projects, with a link through to the full
 * `/projects` list. Self-fetches; renders nothing when there are no
 * published projects yet. */
export async function ProjectsPreview() {
  const projects = await getFeaturedProjects(3);
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <SectionHeading eyebrow="04 — Projects" title="Selected work" />
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
            >
              View all projects
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={Math.min(i * 0.08, 0.24)} className="h-full">
              <Card className="h-full justify-between gap-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="mt-1.5 line-clamp-3 text-sm">
                    {project.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  {project.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 4).map((tag) => (
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
