"use client";

import { motion, useReducedMotion } from "motion/react";
import { AnimatedBackground } from "@/components/animated-background";
import { Countdown } from "@/components/countdown";
import { brand, LAUNCH_DATE } from "@/lib/config";

const block = "rounded-2xl border border-white/10 bg-white/[0.025]";

// Shared entrance feel for every tile. Visitors who prefer reduced motion get
// the tile immediately, with no animation — same pattern as `Reveal`.
function Tile({
  className = "",
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * The whole page: restrained backdrop + a centered bento grid of monochrome
 * blocks (brand, status, headline, countdown, contact). Colour appears in a
 * single place — the live status dot — where it actually means something.
 */
export function ComingSoon() {
  return (
    <>
      <AnimatedBackground />

      <main className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:gap-4">
          {/* Brand block */}
          <Tile
            delay={0}
            className={`${block} col-span-2 flex items-center gap-3 p-5 sm:col-span-1`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 font-display text-sm font-black text-white">
              {brand.initials}
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              {brand.name}
            </span>
          </Tile>

          {/* Status block — the one place colour is used, and it carries meaning. */}
          <Tile
            delay={0.06}
            className={`${block} col-span-2 flex items-center gap-2.5 p-5 sm:col-span-1`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
              In progress
            </span>
          </Tile>

          {/* Headline block */}
          <Tile
            delay={0.12}
            className={`${block} col-span-2 flex flex-col gap-4 p-7 sm:p-10`}
          >
            <h1 className="font-display text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-7xl">
              {brand.headline}
            </h1>
            <p className="max-w-md text-pretty text-base text-white/50 sm:text-lg">
              {brand.subline}
            </p>
          </Tile>

          {/* Countdown blocks */}
          <div className="col-span-2">
            <Countdown target={LAUNCH_DATE} />
          </div>

          {/* Contact block */}
          <Tile
            delay={0.5}
            className={`${block} col-span-2 flex items-center justify-between gap-3 p-5`}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
              Get in touch
            </span>
            <a
              href={`mailto:${brand.email}`}
              className="font-display text-sm font-bold text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline sm:text-base"
            >
              {brand.email}
            </a>
          </Tile>
        </div>
      </main>
    </>
  );
}
