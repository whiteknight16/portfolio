/**
 * Pure countdown math — no React, no side effects, so it can be unit-tested
 * in isolation. `useCountdown` wraps this with a ticking clock.
 */

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** true once `now` has reached or passed `target`. */
  isComplete: boolean;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Break the gap between `now` and `target` into whole days/hours/minutes/seconds.
 * Once the target has passed, every field clamps to 0 and `isComplete` is true —
 * the UI never has to deal with negative numbers.
 */
export function computeTimeLeft(
  target: Date | string | number,
  now: Date | string | number = new Date(),
): TimeLeft {
  const toMs = (v: Date | string | number) =>
    v instanceof Date ? v.getTime() : typeof v === "number" ? v : new Date(v).getTime();
  const diff = toMs(target) - toMs(now);

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    seconds: Math.floor((diff % MINUTE) / SECOND),
    isComplete: false,
  };
}
