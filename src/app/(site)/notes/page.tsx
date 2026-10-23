import type { Metadata } from "next";
import { Container } from "@/components/public/container";
import { NotesList } from "@/components/public/notes-list";
import { Reveal } from "@/components/public/reveal";
import { SubscribeForm } from "@/components/public/subscribe-form";
import { NotesEmptyLine } from "@/components/sections/notes-preview";
import { getProfile, getPublishedPosts } from "@/lib/content";
import { brand, rssAlternateTypes } from "@/lib/config";

// Reads published notes straight from the database on every request.
export const dynamic = "force-dynamic";

const DESCRIPTION = "What I'm building, what goes wrong, and what I'm learning next.";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.full_name || brand.name;
  const title = `Notes — ${name}`;
  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: "/notes", types: rssAlternateTypes },
    openGraph: { title, description: DESCRIPTION, type: "website", url: "/notes", siteName: name },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION },
  };
}

export default async function NotesPage() {
  const posts = await getPublishedPosts();

  return (
    <Container className="pt-12 sm:pt-16">
      <Reveal>
        <header className="border-b-[1.5px] border-foreground pb-6">
          <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-brand uppercase">Notes</p>
          <h1 className="mt-3 font-display text-[44px] leading-none font-normal tracking-[-0.03em] text-foreground sm:text-[56px]">
            Notes
          </h1>
          <p className="mt-4 max-w-xl font-display text-lg leading-normal font-light text-muted-foreground sm:text-xl">
            {DESCRIPTION}
          </p>
        </header>
      </Reveal>

      {posts.length > 0 ? (
        <>
          <NotesList posts={posts} />
          <Reveal>
            <section
              id="subscribe"
              aria-labelledby="notes-subscribe"
              className="mt-12 scroll-mt-24 grid gap-5 rounded-[4px] border-[1.5px] border-foreground bg-card px-5 py-5.5 shadow-ink-lg sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-7.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12"
            >
              <div>
                <h2
                  id="notes-subscribe"
                  className="font-display text-2xl leading-tight font-normal tracking-[-0.015em] text-foreground"
                >
                  Get the next note in your inbox.
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  One email when I publish something new. Nothing else.
                </p>
              </div>
              <SubscribeForm variant="card" source="/notes" />
            </section>
          </Reveal>
        </>
      ) : (
        <Reveal delay={0.05}>
          <section
            id="subscribe"
            aria-label="Subscribe"
            className="mt-8 scroll-mt-24 grid gap-5 rounded-[4px] border border-rule bg-card px-5 py-5 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-7.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12"
          >
            <NotesEmptyLine />
            <SubscribeForm variant="card" source="/notes" />
          </section>
        </Reveal>
      )}
    </Container>
  );
}
