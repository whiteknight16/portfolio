import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Newspaper } from "lucide-react";
import { getPostBySlug, isBlogEnabled } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { Prose } from "@/components/public/prose";
import { Badge } from "@/components/ui/badge";
import { brand } from "@/lib/config";

// Reads the live post row on every request — never prerender it.
export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = `${post.title} — ${brand.name}`;
  return {
    title,
    description: post.excerpt,
    openGraph: {
      title,
      description: post.excerpt,
      type: "article",
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  if (!(await isBlogEnabled())) notFound();
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to blog
        </Link>
      </Reveal>

      <Reveal delay={0.05}>
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL.
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="mt-8 aspect-video w-full rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="mt-8 flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
            <Newspaper className="size-10" />
          </div>
        )}
      </Reveal>

      <Reveal delay={0.1}>
        <h1 className="mt-8 text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          {post.published_at ? (
            <span>{format(parseISO(post.published_at), "MMM d, yyyy")}</span>
          ) : null}
          {post.published_at ? <span aria-hidden>·</span> : null}
          <span>{post.reading_minutes} min read</span>
        </div>

        {post.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </Reveal>

      <Reveal delay={0.15}>
        <Prose html={post.content} className="mt-10" />
      </Reveal>
    </div>
  );
}
