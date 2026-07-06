import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FolderGit2 } from "lucide-react";
import { getProjectBySlug } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { Prose } from "@/components/public/prose";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config";

// Reads the live project row on every request — never prerender it.
export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const title = `${project.title} — ${brand.name}`;
  return {
    title,
    description: project.summary,
    openGraph: {
      title,
      description: project.summary,
      type: "article",
      images: project.cover_image_url ? [project.cover_image_url] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to projects
        </Link>
      </Reveal>

      <Reveal delay={0.05}>
        {project.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL.
          <img
            src={project.cover_image_url}
            alt=""
            className="mt-8 aspect-video w-full rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="mt-8 flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
            <FolderGit2 className="size-10" />
          </div>
        )}
      </Reveal>

      <Reveal delay={0.1}>
        <h1 className="mt-8 text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {project.title}
        </h1>
        <p className="mt-3 text-pretty text-base text-muted-foreground">{project.summary}</p>

        {project.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {project.links?.live || project.links?.repo ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.links?.live ? (
              <Button
                render={
                  <a href={project.links.live} target="_blank" rel="noopener noreferrer" />
                }
              >
                Live site
                <ArrowUpRight className="size-4" />
              </Button>
            ) : null}
            {project.links?.repo ? (
              <Button
                variant="outline"
                render={
                  <a href={project.links.repo} target="_blank" rel="noopener noreferrer" />
                }
              >
                Source code
                <ArrowUpRight className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </Reveal>

      <Reveal delay={0.15}>
        <Prose html={project.content} className="mt-10" />
      </Reveal>
    </div>
  );
}
