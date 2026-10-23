import { Container } from "@/components/public/container";
import { NoteRow } from "@/components/public/note-row";
import { Reveal } from "@/components/public/reveal";
import { SubscribeForm } from "@/components/public/subscribe-form";
import { SectionHeading } from "@/components/sections/section-heading";
import type { SubscribePlacement } from "@/lib/home-view";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Homepage Notes block: the latest notes as `NoteRow`s or, before the first
 * note exists, an empty state instead of a blank section. `subscribe` comes
 * from `subscribePlacement`: with no Newsletter panel on the page ("form")
 * the block carries the page's `#subscribe` card form, under the empty line
 * or below the rows; otherwise the empty state links down ("below") or up
 * ("above") to that panel, so the page never shows two forms back to back.
 */
export function NotesPreview({
  posts,
  subscribe,
}: {
  posts: Post[];
  subscribe: NonNullable<SubscribePlacement["notes"]>;
}) {
  return (
    <section id="notes" className="scroll-mt-24 pt-14">
      <Container>
        <Reveal>
          <SectionHeading title="Notes" href="/notes" linkLabel="all notes →" />
        </Reveal>

        {posts.length > 0 ? (
          <>
            <Reveal delay={0.05} className="mt-2">
              {posts.map((post) => (
                <NoteRow key={post.id} post={post} />
              ))}
            </Reveal>
            {subscribe === "form" ? (
              <Reveal delay={0.05}>
                <SubscribeCard hasNotes className="mt-6" />
              </Reveal>
            ) : null}
          </>
        ) : (
          <Reveal delay={0.05}>
            {subscribe === "form" ? (
              <SubscribeCard hasNotes={false} className="mt-5" />
            ) : (
              <div className="mt-5 rounded-[4px] border border-rule bg-card px-5 py-5 sm:px-6">
                <NotesEmptyLine />
                <a
                  href="#subscribe"
                  className="mt-2.5 inline-block font-mono text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {subscribe === "above" ? "Subscribe above ↑" : "Subscribe below ↓"}
                </a>
              </div>
            )}
          </Reveal>
        )}
      </Container>
    </section>
  );
}

/**
 * The homepage's card subscribe form, used when there is no Newsletter
 * panel; carries the page's `id="subscribe"`. The lead-in is the "first note
 * is on its way" line until a note exists, then the "next note" line.
 */
export function SubscribeCard({ hasNotes, className }: { hasNotes: boolean; className?: string }) {
  return (
    <div
      id="subscribe"
      className={cn(
        "scroll-mt-24 grid gap-5 rounded-[4px] border border-rule bg-card px-5 py-5 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-7.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12",
        className,
      )}
    >
      {hasNotes ? (
        <div>
          <p className="font-display text-xl leading-snug text-foreground italic">
            Get the next note in your inbox.
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            One email when I publish something new. Nothing else.
          </p>
        </div>
      ) : (
        <NotesEmptyLine />
      )}
      <SubscribeForm variant="card" source="/" />
    </div>
  );
}

/** The "no notes yet" line, shared by the homepage and the `/notes` empty state. */
export function NotesEmptyLine() {
  return (
    <p className="font-display text-xl leading-snug text-foreground italic">
      The first note is on its way. Subscribe and you&apos;ll get it the day it&apos;s out.
    </p>
  );
}
