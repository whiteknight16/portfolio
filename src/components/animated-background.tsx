"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Restrained, near-monochrome backdrop: two very faint light pools that drift
 * slowly over a charcoal base, plus fine grain and a vignette. Decorative only.
 * Holds still when the visitor prefers reduced motion.
 */
export function AnimatedBackground() {
  const reduce = useReducedMotion();

  const pools = [
    {
      className: "left-[-10%] top-[-20%] h-[55vmax] w-[55vmax] bg-white",
      drift: { x: [0, 40, -20, 0], y: [0, 30, -10, 0] },
      duration: 34,
      opacity: 0.05,
    },
    {
      className: "right-[-15%] bottom-[-25%] h-[50vmax] w-[50vmax] bg-white",
      drift: { x: [0, -30, 20, 0], y: [0, -20, 25, 0] },
      duration: 40,
      opacity: 0.035,
    },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B0C0E]"
    >
      {pools.map((pool, i) => (
        <motion.div
          key={i}
          style={{ opacity: pool.opacity }}
          className={`absolute rounded-full blur-[120px] ${pool.className}`}
          animate={reduce ? undefined : pool.drift}
          transition={
            reduce
              ? undefined
              : { duration: pool.duration, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}
      {/* Fine grain to kill banding and add texture. */}
      <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[3px_3px]" />
      {/* Vignette to settle the edges. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#0B0C0E_95%)]" />
    </div>
  );
}
