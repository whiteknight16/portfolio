import Link from "next/link";
import { Container } from "@/components/public/container";
import { ContentImage } from "@/components/public/content-image";
import { Prose } from "@/components/public/prose";
import { SourceCard } from "@/components/public/source-card";
import { SubscribeForm } from "@/components/public/subscribe-form";
import { TagChip } from "@/components/public/tag-chip";
import { formatNoteDate } from "@/lib/format";
import { sourceCard, tldrLines, type NoteAuthor } from "@/lib/note-view";
import type { Post } from "@/lib/types";

export type NoteLink = { slug: string; title: string };

type NoteArticleProps = {
  post: Post;
  author: NoteAuthor;
  /** The next-older note. */
  previous: NoteLink | null;
  /** The next-newer note. */
  next: NoteLink | null;
};

/**
 * A note page (mockup "A note" tab), from plain props so it renders the same
 * from the database or from fixtures. Every optional block (dek, tags,
 * source card, short version, cover, previous/next) disappears when its
 * field is empty, so a bare note is just its title and body.
 */
export function NoteArticle({ post, author, previous, next }: NoteArticleProps) {
  const date = formatNoteDate(post.published_at);
  const dek = post.excerpt.trim();
  const tags = post.tags.filter((tag) => tag.trim());
  const source = sourceCard(post);
  const tldr = tldrLines(post.tldr);

  return (
    <Container as="article" className="pt-9 pb-5 sm:pt-11">
      <div className="mx-auto max-w-170">
        <Link
          href="/notes"
          className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← all notes
        </Link>

        <div className="mt-6.5 flex flex-wrap items-center gap-x-3.5 gap-y-2 font-mono text-xs text-faint">
          {date && post.published_at ? (
            <>
              <time dateTime={post.published_at}>{date}</time>
              <span aria-hidden>·</span>
            </>
          ) : null}
          <span>{post.reading_minutes} min read</span>
          {tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {tags.map((tag) => (
                <li key={tag}>
                  <TagChip>{tag}</TagChip>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <h1 className="mt-3.5 font-display text-[36px] leading-[1.06] font-normal tracking-[-0.025em] text-balance text-foreground sm:text-[50px] sm:leading-[1.04]">
          {post.title}
        </h1>

        {dek ? (
          <p className="mt-4 font-display text-lg leading-normal font-light text-muted-foreground sm:text-xl">
            {dek}
          </p>
        ) : null}

        {source ? <SourceCard source={source} kind={post.source_kind} /> : null}

        {tldr.length > 0 ? (
          <section aria-labelledby="short-version" className="mt-6.5 border-l-[3px] border-brand py-1 pl-4.5">
            <h2
              id="short-version"
              className="font-mono text-[11px] font-medium tracking-[0.12em] text-brand uppercase"
            >
              The short version
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-4.5 text-[15px] leading-[1.6] text-foreground marker:text-faint">
              {tldr.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {post.cover_image_url ? (
          <ContentImage
            src={post.cover_image_url}
            alt=""
            width={1200}
            height={630}
            sizes="(min-width: 768px) 680px, 100vw"
            className="mt-8 w-full rounded-[4px] border border-rule object-cover"
          />
        ) : null}

        <Prose html={post.content} className="mt-7.5" />

        <section
          id="subscribe"
          aria-labelledby="note-subscribe"
          className="mt-10 scroll-mt-24 rounded-[4px] border-[1.5px] border-foreground bg-card px-5 py-5.5 shadow-ink-lg sm:px-6"
        >
          <h2
            id="note-subscribe"
            className="font-display text-2xl leading-tight font-normal tracking-[-0.015em] text-balance text-foreground"
          >
            Liked this? Get the next one.
          </h2>
          <p className="mt-1.5 mb-3.5 text-sm text-muted-foreground">
            Every new note, in your inbox. One email per note, nothing else.
          </p>
          <SubscribeForm variant="card" source={`/notes/${post.slug}`} />
        </section>

        <div className="mt-7.5 flex items-center gap-3.5 border-t border-rule pt-5.5 text-sm text-muted-foreground">
          <span className="size-11 shrink-0 overflow-hidden rounded-full border border-rule bg-linear-160 from-[#d8cdb9] to-[#b9ab94]">
            {/* Decorative: the name sits beside it. */}
            <ContentImage
              src={author.avatarUrl}
              alt=""
              width={44}
              height={44}
              className="size-full object-cover"
            />
          </span>
          <p>
            <b className="font-medium text-foreground">{author.name}</b> ({author.handle})
            {author.title ? <> · {author.title}.</> : "."}{" "}
            <Link
              href="/about"
              className="text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground"
            >
              More about me
            </Link>
          </p>
        </div>

        {previous || next ? (
          <nav aria-label="More notes" className="mt-6.5 grid gap-3.5 sm:grid-cols-2">
            {previous ? <NeighbourCard note={previous} direction="previous" /> : null}
            {next ? <NeighbourCard note={next} direction="next" /> : null}
          </nav>
        ) : null}
      </div>
    </Container>
  );
}

function NeighbourCard({ note, direction }: { note: NoteLink; direction: "previous" | "next" }) {
  const isNext = direction === "next";
  return (
    <Link
      href={`/notes/${note.slug}`}
      rel={isNext ? "next" : "prev"}
      className={
        isNext
          ? "block rounded-[4px] border border-rule bg-card px-3.5 py-3 text-right transition-colors hover:border-foreground/40 sm:col-start-2"
          : "block rounded-[4px] border border-rule bg-card px-3.5 py-3 transition-colors hover:border-foreground/40"
      }
    >
      <span className="block font-mono text-[11px] text-faint">{isNext ? "next →" : "← previous"}</span>
      <span className="mt-0.5 block font-display text-[15px] leading-snug font-medium text-foreground">
        {note.title}
      </span>
    </Link>
  );
}
