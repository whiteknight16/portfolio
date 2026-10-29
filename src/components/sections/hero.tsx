"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Container } from "@/components/public/container";
import { ContentImage } from "@/components/public/content-image";
import { Emphasis } from "@/components/public/emphasis";
import { SocialLinks } from "@/components/public/social-icons";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

// The server can't know the visitor's motion preference, so both variant sets
// share the same `hidden` state (identical SSR markup, no hydration mismatch);
// reduced-motion visitors just get an instant, unstaggered `show`.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const instantContainer: Variants = { hidden: {}, show: {} };

const instantItem: Variants = {
  hidden: item.hidden,
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

/** Everything the hero shows, already resolved on the server (years filled, dates formatted). */
export type HeroProps = {
  name: string;
  /** `title · first location segment`, e.g. "AI engineer & builder · New Delhi". */
  kicker: string;
  /** Headline with `{years}` filled; may carry one `*…*` accent phrase. */
  thesis: string;
  /** Tagline with `{years}` filled; may carry one `*…*` accent phrase. */
  lede: string;
  photoSrc: string;
  /** Polaroid caption: first segment of the location. */
  caption: string | null;
  nowRows: { key: string; text: string }[];
  /** "Oct 2026" — when the Now card was last updated. */
  nowMonth: string | null;
  socials: Profile["socials"] | null;
};

/**
 * Field notes hero (mockup `.hero2`): kicker, name, thesis and lede on the
 * left; a taped polaroid with the Now card pinned over it on the right (stacked
 * underneath on mobile). Client component only for the entrance motion and the
 * photo's error fallback; reduced-motion visitors see it without animation.
 */
export function Hero({
  name,
  kicker,
  thesis,
  lede,
  photoSrc,
  caption,
  nowRows,
  nowMonth,
  socials,
}: HeroProps) {
  const reduceMotion = useReducedMotion();
  const [showPhoto, setShowPhoto] = useState(true);

  // Always motion elements (never swapped for plain divs): swapping on the
  // client leaves the server's inline `opacity: 0` in place for reduced-motion
  // visitors, hiding the hero. `data-reveal` lets the (site) layout's
  // <noscript> style show the lines when JS never runs.
  const wrapProps = {
    initial: "hidden",
    animate: "show",
    variants: reduceMotion ? instantContainer : container,
  } as const;
  const lineProps = { variants: reduceMotion ? instantItem : item, "data-reveal": "" } as const;

  return (
    <section className="overflow-x-clip">
      <Container className="grid grid-cols-1 gap-12 pt-10 pb-10 sm:pt-14 lg:grid-cols-[1.25fr_1fr] lg:items-start xl:gap-16 xl:pt-16 xl:pb-12">
        <motion.div {...wrapProps}>
          <motion.div
            {...lineProps}
            className="font-mono text-[11px] font-medium tracking-[0.12em] text-brand uppercase"
          >
            {kicker}
          </motion.div>

          <motion.div {...lineProps}>
            <h1 className="mt-3.5 font-display text-[52px] leading-[0.95] font-normal tracking-[-0.035em] text-foreground sm:text-[64px] lg:text-[76px] xl:text-[84px] 2xl:text-[92px]">
              {name}
            </h1>
          </motion.div>

          <motion.div {...lineProps}>
            <p className="mt-4.5 font-display text-2xl leading-[1.18] font-[350] tracking-[-0.02em] text-pretty text-foreground sm:text-[30px] xl:text-[32px] 2xl:text-[36px]">
              <Emphasis text={thesis} />
            </p>
          </motion.div>

          {lede ? (
            <motion.div {...lineProps}>
              <p className="mt-4 max-w-[62ch] text-base leading-[1.65] text-pretty text-muted-foreground">
                <Emphasis text={lede} />
              </p>
            </motion.div>
          ) : null}

          <motion.div {...lineProps} className="mt-6 flex flex-wrap gap-2.5">
            <HeroLink href="/projects" solid>
              See what I&apos;ve built →
            </HeroLink>
            <HeroLink href="/notes">Read my notes</HeroLink>
          </motion.div>

          <motion.div {...lineProps}>
            <SocialLinks socials={socials} className="mt-5.5 gap-4.5" iconClassName="size-4.5" />
          </motion.div>
        </motion.div>

        {/* Photo + Now card as one composition: capped so the overlap holds as the
         * column widens, pinned to the right edge, scaling up a little on xl/2xl. */}
        <motion.div
          {...wrapProps}
          className="relative mx-auto w-full max-w-100 pt-2 lg:mr-0 lg:max-w-105 xl:max-w-115 2xl:max-w-125"
        >
          {showPhoto ? (
            <motion.div {...lineProps}>
              <figure className="relative ml-auto w-67.5 max-w-[85%] rotate-[2.2deg] border border-rule bg-card p-2.5 pb-8.5 shadow-[4px_6px_0_color-mix(in_oklab,var(--foreground)_85%,transparent)] xl:w-75 2xl:w-80">
                <span
                  aria-hidden
                  className="absolute -top-3 left-1/2 h-6 w-22.5 -translate-x-1/2 -rotate-4 bg-[#fde68a]/75 dark:bg-[#fde68a]/45"
                />
                {/* Above the fold, so preloaded; `sizes` matches the figure's inner width. */}
                <ContentImage
                  ref={(el: HTMLImageElement | null) => {
                    // An error that fired before hydration never reaches onError.
                    if (el?.complete && el.naturalWidth === 0) setShowPhoto(false);
                  }}
                  src={photoSrc}
                  alt={`Photo of ${name}`}
                  width={300}
                  height={340}
                  sizes="(min-width: 1536px) 300px, (min-width: 1280px) 280px, 250px"
                  preload
                  onError={() => setShowPhoto(false)}
                  className="block h-72.5 w-full bg-muted object-cover xl:h-80 2xl:h-85"
                />
                {caption ? (
                  // Right-aligned so it stays visible beside the Now card pinned over the
                  // bottom-left; below `sm` the card would half-cover it, so it hides there.
                  <figcaption
                    className={cn(
                      "absolute right-3.5 bottom-2.25 font-display text-sm text-muted-foreground italic",
                      nowRows.length > 0 && "hidden sm:block",
                    )}
                  >
                    {caption}
                  </figcaption>
                ) : null}
              </figure>
            </motion.div>
          ) : null}

          {nowRows.length > 0 ? (
            <motion.div {...lineProps}>
              <NowCard rows={nowRows} month={nowMonth} overlap={showPhoto} />
            </motion.div>
          ) : null}
        </motion.div>
      </Container>
    </section>
  );
}

function HeroLink({ href, solid, children }: { href: string; solid?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={
        solid
          ? "inline-block rounded-[3px] border-[1.5px] border-foreground bg-foreground px-3.75 py-2.5 font-mono text-[12.5px] font-medium text-background transition-opacity hover:opacity-85"
          : "inline-block rounded-[3px] border-[1.5px] border-foreground px-3.75 py-2.5 font-mono text-[12.5px] font-medium text-foreground transition-colors hover:bg-foreground/5"
      }
    >
      {children}
    </Link>
  );
}

function NowCard({
  rows,
  month,
  overlap,
}: {
  rows: { key: string; text: string }[];
  month: string | null;
  overlap: boolean;
}) {
  return (
    <div
      className={cn(
        "relative w-75 max-w-full rotate-[-1.4deg] rounded-[3px] border border-rule bg-card px-4 py-3.5 shadow-ink-lg xl:w-80 2xl:w-85",
        overlap && "-mt-15",
      )}
    >
      <p className="flex justify-between font-mono text-[11px] font-medium tracking-widest uppercase">
        <span className="text-brand">Now</span>
        {month ? <span className="text-faint">{month}</span> : null}
      </p>
      <dl className="mt-2 grid grid-cols-[68px_1fr] gap-x-2.5 gap-y-1.75 text-[13.5px] leading-[1.4]">
        {rows.map((row) => (
          <div key={row.key} className="contents">
            <dt className="pt-0.5 font-mono text-[11.5px] text-faint">{row.key}</dt>
            <dd className="text-foreground">{row.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
