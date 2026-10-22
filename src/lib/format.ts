/**
 * Pure, framework-free formatting helpers shared by the site and admin CMS.
 */

import baseSlugify from "slugify";
import { format, parseISO } from "date-fns";

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
  // parseISO (not `new Date()`) so date-only strings like "2025-03-01" are read
  // as local midnight, not UTC midnight — avoiding a month shift in timezones
  // behind UTC when `format` renders in process-local time.
  const startLabel = format(parseISO(start), MONTH_YEAR);
  const endLabel = isCurrent || !end ? "Present" : format(parseISO(end), MONTH_YEAR);
  return `${startLabel} – ${endLabel}`;
}

/**
 * Years of experience from a career start date, floored to the half-year and
 * suffixed with "+" (e.g. "1.5+", "2+"). Returns `null` when unset or under
 * six months, so callers can hide the figure.
 */
export function formatExperienceYears(start: string | null, now: Date = new Date()): string | null {
  if (!start) return null;
  const s = parseISO(start);
  let months = (now.getFullYear() - s.getFullYear()) * 12 + (now.getMonth() - s.getMonth());
  if (now.getDate() < s.getDate()) months -= 1;
  if (months < 6) return null;
  const years = Math.floor(months / 6) / 2;
  return `${years}+`;
}

/** Replace every `{years}` token; when `years` is unknown, drop it and collapse the spacing. */
export function fillYears(text: string, years: string | null): string {
  if (years !== null) return text.replaceAll("{years}", years);
  return text.replaceAll("{years}", "").replace(/ {2,}/g, " ");
}

/** Lowercase a social handle and strip everything but letters and digits. */
export function handleSlug(handle: string): string {
  return handle.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Remove the `*…*` markers used to italicise one hero phrase (for metadata, JSON-LD, RSS, llms.txt). */
export function stripEmphasis(text: string): string {
  return text.replaceAll("*", "");
}
