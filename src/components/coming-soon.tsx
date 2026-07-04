"use client";

import { motion } from "motion/react";
import { AnimatedBackground } from "@/components/animated-background";
import { Countdown } from "@/components/countdown";
import { brand, LAUNCH_DATE } from "@/lib/config";

/**
 * The whole page: ambient backdrop + centered hero (brand, headline, countdown,
 * footer). Composition only — each child owns its own behaviour.
 */
export function ComingSoon() {
  return (
    <>
      <AnimatedBackground />

      <main className="flex min-h-dvh flex-col items-center justify-between px-6 py-10 text-center sm:py-14">
        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#FF3D9A] via-[#FFB020] to-[#7C5CFF] font-display text-sm font-black text-black">
            {brand.initials}
          </span>
          <span className="text-sm font-semibold tracking-tight text-white/80">
            {brand.name}
          </span>
        </motion.div>

        {/* Hero */}
        <div className="flex max-w-2xl flex-col items-center gap-6">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-white/60"
          >
            Under construction
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="bg-gradient-to-br from-white via-white to-white/60 bg-clip-text font-display text-5xl font-black leading-[0.95] tracking-tight text-transparent sm:text-7xl"
          >
            {brand.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="max-w-md text-pretty text-base text-white/60 sm:text-lg"
          >
            {brand.subline}
          </motion.p>

          <div className="mt-4 w-full max-w-xl">
            <Countdown target={LAUNCH_DATE} />
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-sm text-white/40"
        >
          <a
            href={`mailto:${brand.email}`}
            className="underline-offset-4 transition-colors hover:text-white/80 hover:underline"
          >
            {brand.email}
          </a>
        </motion.footer>
      </main>
    </>
  );
}
