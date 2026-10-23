import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile, getProjectBySlug } from "@/lib/content";
import { Container } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { Prose } from "@/components/public/prose";
import { TagChip } from "@/components/public/tag-chip";
import { brand, rssAlternateTypes } from "@/lib/config";
import { safeHttpUrl } from "@/lib/note-view";
import { projectKicker } from "@/lib/profile-view";

// Reads the live project row on every request — never prerender it.
export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [project, profile] = await Promise.all([getProjectBySlug(slug), getProfile()]);
  if (!project) return {};

  const name = profile?.full_name || brand.name;
  const title = `${project.title} — ${name}`;
  const path = `/projects/${project.slug}`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: path, types: rssAlternateTypes },
    openGraph: {
      title,
      description: project.summary,
      type: "article",
      url: path,
      siteName: name,
      images: project.cover_image_url ? [project.cover_image_url] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: project.summary },
  };
}

const MONO_BUTTON =
  "inline-block rounded-[3px] border-[1.5px] border-foreground px-3.75 py-2.5 font-mono text-[12.5px] font-medium transition-colors";

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const kicker = projectKicker(project.label, false);
  const tags = project.tags.filter((tag) => tag.trim());
  const live = safeHttpUrl(project.links?.live ?? null);
  const repo = safeHttpUrl(project.links?.repo ?? null);

  return (
    <Container as="article" className="pt-9 pb-5 sm:pt-11">
      <div className="mx-auto max-w-170">
        <Reveal>
          <Link
            href="/projects"
            className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← all projects
          </Link>

          {kicker ? (
            <p className="mt-6.5 font-mono text-[11px] font-medium tracking-[0.12em] text-brand uppercase">
              {kicker}
            </p>
          ) : null}

          <h1 className="mt-3.5 font-display text-[36px] leading-[1.06] font-normal tracking-[-0.025em] text-balance text-foreground sm:text-[50px] sm:leading-[1.04]">
            {project.title}
          </h1>

          {project.summary ? (
            <p className="mt-4 font-display text-lg leading-normal font-light text-muted-foreground sm:text-xl">
              {project.summary}
            </p>
          ) : null}

          {tags.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
              {tags.map((tag) => (
                <li key={tag}>
                  <TagChip>{tag}</TagChip>
                </li>
              ))}
            </ul>
          ) : null}

          {live || repo ? (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {live ? (
                <a
                  href={live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${MONO_BUTTON} bg-foreground text-background hover:opacity-85`}
                >
                  Live site ↗
                </a>
              ) : null}
              {repo ? (
                <a
                  href={repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${MONO_BUTTON} text-foreground hover:bg-foreground/5`}
                >
                  Source code ↗
                </a>
              ) : null}
            </div>
          ) : null}
        </Reveal>

        {project.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase storage URL.
          <img
            src={project.cover_image_url}
            alt=""
            className="mt-8 w-full rounded-[4px] border border-rule object-cover"
          />
        ) : null}

        <Prose html={project.content} className="mt-7.5" />
      </div>
    </Container>
  );
}
