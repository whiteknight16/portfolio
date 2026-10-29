/**
 * The About page's answer-shaped blocks (Quick facts and "In brief"), built
 * only from the profile, projects, experiences and note count so they never
 * drift from the rest of the site. Also feeds the FAQPage JSON-LD and
 * /llms-full.txt.
 */

import { format, parseISO } from "date-fns";
import { brand } from "./config.ts";
import {
  fillYears,
  formatExperienceYears,
  indefiniteArticle,
  naturalList,
  stripEmphasis,
} from "./format.ts";
import { urlHost } from "./note-view.ts";
import { socialLinks } from "./socials.ts";
import type { Experience, Profile, Project } from "./types.ts";

const MAX_BUILT = 4;
const MONTH_YEAR = "MMM yyyy";

/** One value in a fact row; `href` is site-relative (`/notes`) or absolute (a social profile). */
export type FactItem = { text: string; href?: string };
export type QuickFact = { label: string; items: FactItem[] };
export type QA = { question: string; answer: string };

/** Profile text with `{years}` filled and `*` markers removed, trimmed; `""` when blank. */
const clean = (text: string | null | undefined, years: string | null) =>
  stripEmphasis(fillYears(text ?? "", years)).trim();

/** The profile fields both blocks read, cleaned, with brand fallbacks for name and handle. */
function who(profile: Profile | null, now: Date) {
  const years = formatExperienceYears(profile?.career_start_date ?? null, now);
  return {
    years,
    name: clean(profile?.full_name, years) || brand.name,
    handle: clean(profile?.handle, years) || brand.handle,
    title: clean(profile?.title, years).replace(/\.+$/, ""),
    location: clean(profile?.location, years),
  };
}

/** Rows for the Quick facts box; a row without data is left out. */
export function buildQuickFacts(args: {
  profile: Profile | null;
  projects: Project[];
  noteCount: number;
  now?: Date;
}): QuickFact[] {
  const { profile, projects, noteCount, now = new Date() } = args;
  const { years, name, handle, title, location } = who(profile, now);
  const start = profile?.career_start_date;
  const building = clean(profile?.now?.building, years);

  const rows: [string, FactItem[]][] = [
    ["Name", [{ text: name }]],
    ["Also known as", [{ text: handle }]],
    ["Based in", location ? [{ text: location }] : []],
    ["What I do", title ? [{ text: title }] : []],
    [
      "Shipping AI since",
      start
        ? [{ text: [format(parseISO(start), MONTH_YEAR), years && `${years} years`].filter(Boolean).join(" · ") }]
        : [],
    ],
    ["Currently", building ? [{ text: `Building ${building}` }] : []],
    [
      "Built",
      projects.slice(0, MAX_BUILT).map((p) => ({ text: p.title, href: `/projects/${p.slug}` })),
    ],
    [
      "Writing",
      [
        noteCount > 0
          ? { text: `${noteCount} ${noteCount === 1 ? "note" : "notes"}`, href: "/notes" }
          : { text: "First note coming soon" },
      ],
    ],
    ["Find me", socialLinks(profile?.socials).map(({ label, href }) => ({ text: label, href }))],
  ];
  return rows.filter(([, items]) => items.length > 0).map(([label, items]) => ({ label, items }));
}

/**
 * The "In brief" questions and answers, written to be quoted on their own:
 * the name instead of pronouns, absolute URLs, and a Q&A left out when its
 * data is missing.
 */
export function buildInBrief(args: {
  siteUrl: string;
  profile: Profile | null;
  projects: Project[];
  experiences: Experience[];
  noteCount: number;
  now?: Date;
}): QA[] {
  const { siteUrl, profile, projects, experiences, noteCount, now = new Date() } = args;
  const { years, name, handle, title, location } = who(profile, now);
  const host = urlHost(siteUrl) ?? siteUrl;
  const socials = socialLinks(profile?.socials);
  const hasLinkedIn = socials.some((s) => s.key === "linkedin");
  const job = experiences.find((e) => e.is_current);
  const built = projects.slice(0, MAX_BUILT).map((p) => p.title);
  const qas: QA[] = [];

  if (title) {
    qas.push({
      question: `Who is ${name}?`,
      answer:
        `${name} is ${indefiniteArticle(title)} ${title}${location ? ` based in ${location}` : ""}, known online as ${handle}. ` +
        (years
          ? `${name} builds AI products and has spent the last ${years} years shipping them to production.`
          : `${name} builds AI products.`),
    });
  }
  qas.push({
    question: `What is ${handle}?`,
    answer: `${handle} is the online handle of ${name}, used on ${host}${socials.length ? ` and across ${name}'s social profiles` : ""}.`,
  });
  if (built.length) {
    qas.push({
      question: `What has ${name} built?`,
      answer: `Personal projects include ${naturalList(built)}. See all projects at ${siteUrl}/projects.`,
    });
  }
  if (job) {
    qas.push({
      question: `Where does ${name} work?`,
      answer: `${name} works as ${job.role} at ${job.company} (since ${format(parseISO(job.start_date), MONTH_YEAR)}).`,
    });
  }
  qas.push({
    question: `Where does ${name} write?`,
    answer:
      noteCount > 0
        ? `${name} writes notes at ${siteUrl}/notes (${noteCount} so far)${hasLinkedIn ? " and shares them on LinkedIn" : ""}. New notes can be received by email.`
        : `${name}'s notes are starting soon at ${siteUrl}/notes; new notes can be received by email.`,
  });

  return qas.map(({ question, answer }) => ({
    question: stripEmphasis(fillYears(question, years)),
    answer: stripEmphasis(fillYears(answer, years)),
  }));
}
