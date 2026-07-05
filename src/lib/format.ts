/**
 * Pure, framework-free formatting helpers shared by the site and admin CMS.
 */

import baseSlugify from "slugify";
import { format } from "date-fns";

const WORDS_PER_MINUTE = 200;

/** Lowercase, hyphenated, punctuation-free slug (e.g. for project/post URLs). */
export function slugify(input: string): string {
  return baseSlugify(input, {
    lower: true,
    strict: true, // strip characters other than [A-Za-z0-9] and replacement char
    trim: true,
  });
}

/** Strip HTML tags, count words, and estimate reading time at ~200wpm (min 1 minute). */
export function readingMinutes(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = text === "" ? 0 : text.split(" ").length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

const MONTH_YEAR = "MMM yyyy";

/** Format a start/end date pair as "Mar 2025 – Present" or "Mar 2024 – Aug 2024". */
export function dateRange(start: string, end: string | null, isCurrent: boolean): string {
  const startLabel = format(new Date(start), MONTH_YEAR);
  const endLabel = isCurrent || !end ? "Present" : format(new Date(end), MONTH_YEAR);
  return `${startLabel} – ${endLabel}`;
}
