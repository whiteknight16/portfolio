"use client";

import { useEffect, useState } from "react";
import { computeTimeLeft, type TimeLeft } from "@/lib/countdown";

/**
 * Ticks once per second toward `target`.
 *
 * Returns `null` until the component has mounted on the client. Rendering the
 * countdown only after mount keeps the server and first client render identical,
 * which avoids a hydration mismatch (the server has no idea what second it is).
 */
export function useCountdown(target: Date | string | number): TimeLeft | null {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Paint the first real value immediately on mount.
    setTimeLeft(computeTimeLeft(target));

    const id = setInterval(() => {
      const next = computeTimeLeft(target);
      setTimeLeft(next);
      if (next.isComplete) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}
