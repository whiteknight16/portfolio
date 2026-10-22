import { NoteRow } from "@/components/public/note-row";
import { Reveal } from "@/components/public/reveal";
import { SubscribeForm } from "@/components/public/subscribe-form";
import { SectionHeading } from "@/components/sections/section-heading";
import type { Post } from "@/lib/types";

/**
 * Homepage Notes block: the latest notes as `NoteRow`s or, before the first
 * note exists, an empty state with a subscribe form instead of a blank section.
 */
export function NotesPreview({ posts }: { posts: Post[] }) {
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
          <div className="mt-5 grid gap-5 rounded-[4px] border border-rule bg-card px-5 py-5 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-7.5">
            <p className="font-display text-xl leading-snug text-foreground italic">
              The first note is on its way. Subscribe and you&apos;ll get it the day it&apos;s out.
            </p>
            <SubscribeForm variant="card" source="/" />
          </div>
        </Reveal>
      )}
    </section>
  );
}
