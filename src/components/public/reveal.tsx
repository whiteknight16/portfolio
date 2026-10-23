"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: ReactNode;
  /** Extra delay (seconds) before the entrance animation starts. */
  delay?: number;
  className?: string;
};

/**
 * Fades + translates children up into place the first time they scroll into
 * view. Visitors who prefer reduced motion get the content immediately, with
 * no animation. Always renders the same `motion.div` (only its animation
 * props change): the server can't know the preference, and swapping in a
 * plain `<div>` on the client would leave the server's inline `opacity: 0` in
 * place after hydration, hiding the content for exactly those visitors.
 * `data-reveal` lets the (site) layout's <noscript> style show it when JS
 * never runs.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      {...(shouldReduceMotion
        ? { animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
        : {
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-80px" },
            transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
          })}
      className={className}
      data-reveal=""
    >
      {children}
    </motion.div>
  );
}
