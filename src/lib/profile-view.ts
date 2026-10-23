/**
 * Pure view helpers that turn a `Profile` into the shapes the home page renders.
 */

import { formatExperienceYears } from "./format.ts";
import type { Highlight, Profile, Project } from "./types.ts";

const MAX_HIGHLIGHTS = 3;
const NOW_KEYS = ["building", "writing", "learning"] as const;

/**
 * Proof-strip cells: computed years of experience first (when known), then up
 * to three non-blank highlights. A database that hasn't run migration 0006
 * has no `highlights` column, so a missing value reads as empty.
 */
export function proofCells(profile: Profile | null, now: Date = new Date()): Highlight[] {
  if (!profile) return [];
  const cells: Highlight[] = [];
  const years = formatExperienceYears(profile.career_start_date, now);
  if (years) cells.push({ value: `${years} yrs`, label: "shipping AI products to production" });
  const highlights = (profile.highlights ?? [])
    .map((h) => ({ value: (h?.value ?? "").trim(), label: (h?.label ?? "").trim() }))
    .filter((h) => h.value !== "" || h.label !== "")
    .slice(0, MAX_HIGHLIGHTS);
  return [...cells, ...highlights];
}

/** Non-blank "now" rows in building, writing, learning order (none when the pre-0006 `now` column is missing). */
export function nowRows(profile: Profile | null): { key: (typeof NOW_KEYS)[number]; text: string }[] {
  if (!profile) return [];
  const now = profile.now ?? {};
  return NOW_KEYS.flatMap((key) => {
    const text = now[key]?.trim();
    return text ? [{ key, text }] : [];
  });
}

/** Project card kicker: the label with " · live" appended when a live link exists; `null` when empty. */
export function projectKicker(label: string | null, hasLive: boolean): string | null {
  const parts = [label?.trim() || null, hasLive ? "live" : null].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/** The fields a `ProjectCard` renders: what a client component is sent instead of the whole row. */
export type ProjectCardData = Pick<Project, "id" | "slug" | "title" | "summary" | "label" | "tags" | "links">;

/** A project trimmed to `ProjectCardData` (no case-study HTML; only the live link, which sets the kicker). */
export function projectCardData(project: Project): ProjectCardData {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    label: project.label ?? null,
    tags: project.tags,
    links: project.links?.live ? { live: project.links.live } : {},
  };
}
