import { NoteRow } from "@/components/public/note-row";
import { Reveal } from "@/components/public/reveal";
import { SubscribeForm } from "@/components/public/subscribe-form";
import { SectionHeading } from "@/components/sections/section-heading";
import type { Post } from "@/lib/types";

/**
 * Homepage Notes block: the latest notes as `NoteRow`s or, before the first
 * note exists, an empty state instead of a blank section. The empty state
 * carries its own subscribe form only when the homepage has no Newsletter
 * panel (`inlineSubscribe`); otherwise it points down to that panel, so the
 * page never shows two identical forms back to back.
 */
export function NotesPreview({
  posts,
  inlineSubscribe,
}: {
  posts: Post[];
  inlineSubscribe: boolean;
}) {
  return (
    <section id="notes" className="mx-auto max-w-5xl scroll-mt-24 px-4 pt-14 sm:px-6">
      <Reveal>
        <SectionHeading title="Notes" href="/notes" linkLabel="all notes →" />
      </Reveal>

      {posts.length > 0 ? (
        <Reveal delay={0.05} className="mt-2">
          {posts.map((post) => (
            <NoteRow key={post.id} post={post} />
          ))}
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          {inlineSubscribe ? (
            <div className="mt-5 grid gap-5 rounded-[4px] border border-rule bg-card px-5 py-5 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-7.5">
              <EmptyLine />
              <SubscribeForm variant="card" source="/" />
            </div>
          ) : (
            <div className="mt-5 rounded-[4px] border border-rule bg-card px-5 py-5 sm:px-6">
              <EmptyLine />
              <a
                href="#subscribe"
                className="mt-2.5 inline-block font-mono text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Subscribe below ↓
              </a>
            </div>
          )}
        </Reveal>
      )}
    </section>
  );
}

function EmptyLine() {
  return (
    <p className="font-display text-xl leading-snug text-foreground italic">
      The first note is on its way. Subscribe and you&apos;ll get it the day it&apos;s out.
    </p>
  );
}
