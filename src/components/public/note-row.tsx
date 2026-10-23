import Link from "next/link";
import { TagChip } from "@/components/public/tag-chip";
import { formatNoteDate } from "@/lib/format";
import type { Post } from "@/lib/types";

/**
 * One note in a list (mockup `.note`): date | title, excerpt and an optional
 * "↳ notes on …" source line | read time and first tag. The whole row links to
 * the note. Safe inside client components (no server-only imports; the date is
 * formatted in UTC so it hydrates identically everywhere).
 */
export function NoteRow({ post }: { post: Post }) {
  const date = formatNoteDate(post.published_at);
  const excerpt = post.excerpt.trim();
  const source = post.source_title?.trim();
  const tag = post.tags[0];

  return (
    <article className="group relative grid grid-cols-1 gap-y-2 border-b border-rule py-5.5 sm:grid-cols-[92px_1fr_120px] sm:gap-x-5.5">
      <p className="font-mono text-xs text-faint sm:pt-1.5">
        {date && post.published_at ? <time dateTime={post.published_at}>{date}</time> : null}
      </p>

      <div>
        <h3 className="font-display text-[22px] leading-[1.2] font-medium tracking-[-0.01em] text-foreground">
          <Link
            href={`/notes/${post.slug}`}
            className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4"
          >
            {post.title}
          </Link>
        </h3>
        {excerpt ? (
          <p className="mt-1.75 max-w-[72ch] text-[14.5px] leading-[1.55] text-muted-foreground">
            {excerpt}
          </p>
        ) : null}
        {source ? (
          <p className="mt-2.5 font-mono text-[11.5px] text-brand">↳ notes on {source}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[11.5px] text-faint sm:flex-col sm:items-end sm:pt-1.5 sm:text-right">
        <span>{post.reading_minutes} min</span>
        {tag ? <TagChip>{tag}</TagChip> : null}
      </div>
    </article>
  );
}
