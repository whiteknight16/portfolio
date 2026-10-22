"use client";

import { useMemo, useState } from "react";
import { NoteRow } from "@/components/public/note-row";
import { Reveal } from "@/components/public/reveal";
import { TagFilter } from "@/components/public/tag-filter";
import type { Post } from "@/lib/types";

/**
 * The `/notes` list: a mono topic filter (shown once there are at least two
 * tags to choose between) over `NoteRow`s. Takes every published note from
 * the server page and filters on the client.
 */
export function NotesList({ posts }: { posts: Post[] }) {
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const seen = new Set<string>();
    for (const post of posts) {
      for (const t of post.tags) if (t.trim()) seen.add(t);
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filtered = useMemo(
    () => (tag === null ? posts : posts.filter((p) => p.tags.includes(tag))),
    [posts, tag],
  );

  return (
    <div>
      {tags.length > 1 ? (
        <Reveal>
          <TagFilter tags={tags} value={tag} onChange={setTag} className="mt-5 mb-1.5" />
        </Reveal>
      ) : null}

      <Reveal delay={0.05} className="mt-2">
        {filtered.map((post) => (
          <NoteRow key={post.id} post={post} />
        ))}
      </Reveal>
    </div>
  );
}
