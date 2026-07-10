import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPosts, isBlogEnabled } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { BlogGrid } from "@/components/public/blog-grid";
import { brand } from "@/lib/config";

// Reads published posts straight from the database on every request —
// there's nothing here worth prerendering or caching.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: `Blog — ${brand.name}`,
    description: "Writing on things I've built, learned, and broken — filterable by tag.",
  };
}

export default async function BlogPage() {
  if (!(await isBlogEnabled())) notFound();
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <p className="flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-brand" />
          Blog
        </p>
        <h1 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Writing
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-base text-muted-foreground">
          Notes on things I&apos;ve built, learned, and broken — filter by tag to narrow it down.
        </p>
      </Reveal>

      <div className="mt-12">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No posts published yet — check back soon.
          </p>
        ) : (
          <BlogGrid posts={posts} />
        )}
      </div>
    </div>
  );
}
