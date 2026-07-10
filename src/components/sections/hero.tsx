"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/public/social-icons";
import { brand } from "@/lib/config";
import type { Profile } from "@/lib/types";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// Portrait lives at public/profile.png; falls back to the spec card if absent.
const PORTRAIT_SRC = "/profile.png";

/**
 * First thing a visitor sees. Left column carries the identity (status line,
 * name, one-line thesis, primary actions, socials); the right column shows the
 * portrait when present, and falls back to a monospace "spec card" otherwise —
 * either way the space is filled deliberately. Reads from `profile` with
 * sensible fallbacks and drops the motion tree for reduced-motion visitors.
 */
export function Hero({ profile }: { profile: Profile | null }) {
  const reduceMotion = useReducedMotion();
  const [showPortrait, setShowPortrait] = useState(true);

  const name = profile?.full_name ?? brand.name;
  const title = profile?.title ?? "Full Stack Developer";
  const headline =
    profile?.headline ??
    "I design and build reliable, thoughtful software across the stack.";
  const resumeUrl = profile?.resume_url;
  const location = profile?.location ?? "India";

  const specRows: { k: string; v: string }[] = [
    { k: "ROLE", v: title },
    { k: "FOCUS", v: "Full-stack · Real-time · GenAI" },
    { k: "STACK", v: "Next.js · FastAPI · LiveKit" },
    { k: "BASED", v: location },
  ];

  const Wrap = reduceMotion ? "div" : motion.div;
  const Line = reduceMotion ? "div" : motion.div;
  const animProps = reduceMotion
    ? {}
    : ({ initial: "hidden", animate: "show", variants: container } as const);
  const lineProps = reduceMotion ? {} : ({ variants: item } as const);

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* engineering-paper dot grid, faded toward the edges */}
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-0 -z-10 opacity-70 mask-[radial-gradient(75%_60%_at_30%_35%,black,transparent)]"
      />

      <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-6xl grid-cols-1 items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <Wrap {...animProps}>
          {/* status line */}
          <Line
            {...lineProps}
            className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            Available for work
          </Line>

          <Line
            {...lineProps}
            className="mt-7 font-display text-[3.25rem] font-semibold leading-[0.95] tracking-[-0.03em] text-foreground sm:text-7xl lg:text-8xl"
          >
            {name}
          </Line>

          <Line
            {...lineProps}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            {headline}
          </Line>

          <Line {...lineProps} className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              render={<a href="#projects" />}
            >
              View work
              <ArrowUpRight className="size-4" />
            </Button>
            {resumeUrl ? (
              <Button
                size="lg"
                variant="outline"
                render={
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" />
                }
              >
                <Download className="size-4" />
                Résumé
              </Button>
            ) : null}
            <Button size="lg" variant="ghost" render={<a href="#contact" />}>
              Contact
            </Button>
          </Line>

          <Line {...lineProps} className="mt-10">
            <SocialLinks socials={profile?.socials} />
          </Line>
        </Wrap>

        {/* portrait (preferred) with monospace spec-card fallback */}
        <Wrap {...animProps} className="hidden lg:block">
          {showPortrait ? (
            <Line {...lineProps} className="relative">
              {/* amber glow behind the portrait */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-brand/20 blur-3xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PORTRAIT_SRC}
                alt={`${name} — portrait`}
                onError={() => setShowPortrait(false)}
                className="w-full rounded-2xl border border-border object-cover shadow-2xl shadow-black/20"
              />
            </Line>
          ) : (
            <Line
              {...lineProps}
              className="rounded-xl border border-border bg-card/70 p-1.5 shadow-sm backdrop-blur"
            >
              <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-border" />
                <span className="size-2.5 rounded-full bg-border" />
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                  ~/harsh-pandey
                </span>
              </div>
              <dl className="divide-y divide-border font-mono text-sm">
                {specRows.map((row) => (
                  <div key={row.k} className="flex gap-4 px-3 py-3">
                    <dt className="w-14 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
                      {row.k}
                    </dt>
                    <dd className="text-pretty text-foreground">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </Line>
          )}
        </Wrap>
      </div>
    </section>
  );
}
