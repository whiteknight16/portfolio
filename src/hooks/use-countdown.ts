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
    // Shared tick: recomputes and syncs React state from the system clock
    // (the external source of truth). Used both as the interval callback
    // and for the immediate first paint below, so the initial value never
    // waits a full second to appear.
    const tick = () => {
      const next = computeTimeLeft(target);
      setTimeLeft(next);
      if (next.isComplete) clearInterval(id);
    };

    const id = setInterval(tick, 1000);
    tick();

    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}
