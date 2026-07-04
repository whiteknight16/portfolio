"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Ambient playful backdrop: three oversized blurred gradient blobs drifting
 * behind a fine grain/noise overlay. Purely decorative — no logic, no props.
 * When the visitor prefers reduced motion the blobs hold still.
 */
export function AnimatedBackground() {
  const reduce = useReducedMotion();

  const blobs = [
    {
      className: "left-[-15%] top-[-10%] h-[55vmax] w-[55vmax] bg-[#FF3D9A]",
      drift: { x: [0, 60, -30, 0], y: [0, -40, 30, 0] },
      duration: 22,
    },
    {
      className: "right-[-20%] top-[10%] h-[50vmax] w-[50vmax] bg-[#FFB020]",
      drift: { x: [0, -50, 40, 0], y: [0, 50, -20, 0] },
      duration: 26,
    },
    {
      className:
        "bottom-[-25%] left-[20%] h-[60vmax] w-[60vmax] bg-[#7C5CFF]",
      drift: { x: [0, 40, -50, 0], y: [0, -30, 40, 0] },
      duration: 30,
    },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B0710]"
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full opacity-70 blur-[90px] mix-blend-screen ${blob.className}`}
          animate={reduce ? undefined : blob.drift}
          transition={
            reduce
              ? undefined
              : {
                  duration: blob.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}
      {/* Fine grain to kill gradient banding and add texture. */}
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:3px_3px]" />
      {/* Vignette so the type stays legible over bright blobs. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#0B0710_95%)]" />
    </div>
  );
}
