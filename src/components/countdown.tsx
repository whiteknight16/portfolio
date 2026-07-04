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
 * Presentation-only countdown. Feeds off `useCountdown`; renders four uniform
 * surface blocks or, once the launch instant passes, the arrival state.
 */
export function Countdown({ target }: { target: string }) {
  const timeLeft = useCountdown(target);

  if (timeLeft?.isComplete) {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="font-display text-3xl font-black text-white sm:text-5xl"
      >
        It&rsquo;s live. Go look
        <span className="text-white/50"> →</span>
      </motion.p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {UNITS.map(({ key, label }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 * i + 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex aspect-4/3 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/3"
        >
          <div className="relative h-[1em] font-display text-5xl font-black leading-none tabular-nums text-white sm:text-6xl">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={timeLeft ? timeLeft[key] : "init"}
                initial={{ y: "45%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-45%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {timeLeft ? pad(timeLeft[key]) : "00"}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="mt-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/40 sm:text-xs">
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
