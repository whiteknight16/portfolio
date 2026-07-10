"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/types";
import { Reveal } from "@/components/public/reveal";
import { TagFilter } from "@/components/public/tag-filter";
import { PostCard } from "@/components/public/post-card";

/**
 * Client-side tag filter + grid for the `/blog` list. Takes the full
 * published-posts array from the server page and derives the distinct tag
 * set itself, so the server page stays a plain fetch-and-render. Mirrors
 * `ProjectsGrid` (`@/components/public/projects-grid`).
 */
export function BlogGrid({ posts }: { posts: Post[] }) {
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const seen = new Set<string>();
    for (const post of posts) {
      for (const t of post.tags) seen.add(t);
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filtered = useMemo(
    () => (tag === null ? posts : posts.filter((p) => p.tags.includes(tag))),
    [posts, tag],
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
          No posts match that tag.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <Reveal key={post.id} delay={Math.min(i * 0.06, 0.24)} className="h-full">
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
