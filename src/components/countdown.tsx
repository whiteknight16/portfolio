"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCountdown } from "@/hooks/use-countdown";
import type { TimeLeft } from "@/lib/countdown";

const pad = (n: number) => n.toString().padStart(2, "0");

const UNITS: { key: keyof Omit<TimeLeft, "isComplete">; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

/**
 * Presentation-only countdown. Feeds off `useCountdown`; renders either the four
 * ticking unit cards or, once the launch instant passes, the arrival state.
 */
export function Countdown({ target }: { target: string }) {
  const timeLeft = useCountdown(target);

  if (timeLeft?.isComplete) {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="font-display text-3xl font-extrabold text-white sm:text-5xl"
      >
        It&rsquo;s live. Go look
        <span className="text-[#FFB020]"> →</span>
      </motion.p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {UNITS.map(({ key, label }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 * i + 0.3, type: "spring", stiffness: 120, damping: 14 }}
          className="relative flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.06] px-2 py-5 backdrop-blur-md sm:px-6 sm:py-7"
        >
          <div className="relative h-[1em] font-display text-5xl font-black leading-none tabular-nums text-white sm:text-7xl">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={timeLeft ? timeLeft[key] : "placeholder"}
                initial={{ y: "40%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-40%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {timeLeft ? pad(timeLeft[key]) : "--"}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.25em] text-white/50 sm:text-xs">
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
