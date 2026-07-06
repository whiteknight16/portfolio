"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/public/social-icons";
import { brand } from "@/lib/config";
import type { Profile } from "@/lib/types";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/**
 * First thing a visitor sees: name, role, one-line headline, primary CTAs,
 * and social links. Reads from `profile` with sensible fallbacks so the page
 * never looks broken if the database is briefly unreachable. A client
 * component for the staggered entrance — `initial={false}` under reduced
 * motion skips the animation without a separate render branch.
 */
export function Hero({ profile }: { profile: Profile | null }) {
  const reduceMotion = useReducedMotion();

  const name = profile?.full_name ?? brand.name;
  const title = profile?.title ?? "Software Engineer";
  const headline =
    profile?.headline ?? "I design and build reliable, thoughtful software.";
  const resumeUrl = profile?.resume_url;

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]"
      >
        <div className="absolute left-1/2 top-[-15%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-foreground/[0.04] blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl flex-col justify-center px-4 py-20 sm:px-6">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={container}
        >
          <motion.p
            variants={item}
            className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground"
          >
            {title}
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-4 text-balance font-display text-5xl font-black leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl"
          >
            {name}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground sm:text-xl"
          >
            {headline}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<a href="#projects" />}>
              View work
              <ArrowUpRight className="size-4" />
            </Button>
            {resumeUrl ? (
              <Button
                size="lg"
                variant="outline"
                render={<a href={resumeUrl} target="_blank" rel="noopener noreferrer" />}
              >
                <Download className="size-4" />
                Résumé
              </Button>
            ) : null}
            <Button size="lg" variant="ghost" render={<a href="#contact" />}>
              Contact
            </Button>
          </motion.div>

          <motion.div variants={item} className="mt-12">
            <SocialLinks socials={profile?.socials} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
