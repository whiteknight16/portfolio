/**
 * Single source of truth for site-wide constants.
 * Changing the launch moment or brand copy should only ever touch this file.
 */

// Absolute launch instant — Sat 11 Jul 2026, 00:00 IST (+05:30).
// Stored with an explicit offset so it resolves to the same moment for a
// visitor in any timezone.
export const LAUNCH_DATE = "2026-07-11T00:00:00+05:30";

export const brand = {
  name: "Harsh Pandey",
  initials: "HP",
  headline: "Something is coming.",
  subline:
    "A new home for the things I design, build, and break. Bookmark it the good stuff lands soon.",
  email: "harshp6421@gmail.com",
} as const;
