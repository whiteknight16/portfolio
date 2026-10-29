import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInBrief, buildQuickFacts } from "./facts.ts";
import type { Experience, Profile, Project } from "./types.ts";

const S = "https://www.k.dev";
const NOW = new Date(2026, 9, 29);
const LI = "https://linkedin.com/in/h";
const GH = "https://github.com/h";

const profile: Profile = {
  id: "1",
  full_name: "Harsh Pandey",
  title: "AI engineer & builder",
  headline: "",
  bio: "",
  avatar_url: null,
  resume_url: null,
  location: "New Delhi, India",
  email: null,
  phone: null,
  socials: { github: GH, linkedin: LI },
  handle: "Knight Developer",
  tagline: "",
  career_start_date: "2025-03-01",
  now: { building: "an AI tutor that teaches *live*" },
  now_updated_at: null,
  highlights: [],
  singleton: true,
  updated_at: "2026-01-01T00:00:00Z",
};

const project = (n: number): Project => ({
  id: `p${n}`,
  title: `Project ${n}`,
  slug: `project-${n}`,
  summary: "",
  content: "",
  cover_image_url: null,
  tags: [],
  links: {},
  label: null,
  featured: false,
  status: "published",
  sort_order: n,
  published_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});
const projects = [1, 2, 3, 4, 5].map(project);

const job: Experience = {
  id: "e1",
  role: "AI Engineer",
  company: "BerriBot",
  location: null,
  start_date: "2025-03-01",
  end_date: null,
  is_current: true,
  highlights: [],
  tags: [],
  sort_order: 1,
};
const pastJob: Experience = { ...job, id: "e0", company: "EY", is_current: false, end_date: "2024-12-01" };

test("quick facts: every row derived from the data, in order", () => {
  const facts = buildQuickFacts({ profile, projects, noteCount: 3, now: NOW });
  assert.deepEqual(facts, [
    { label: "Name", items: [{ text: "Harsh Pandey" }] },
    { label: "Also known as", items: [{ text: "Knight Developer" }] },
    { label: "Based in", items: [{ text: "New Delhi, India" }] },
    { label: "What I do", items: [{ text: "AI engineer & builder" }] },
    { label: "Shipping AI since", items: [{ text: "Mar 2025 · 1.5+ years" }] },
    { label: "Currently", items: [{ text: "Building an AI tutor that teaches live" }] },
    {
      label: "Built",
      items: [1, 2, 3, 4].map((n) => ({ text: `Project ${n}`, href: `/projects/project-${n}` })),
    },
    { label: "Writing", items: [{ text: "3 notes", href: "/notes" }] },
    {
      label: "Find me",
      items: [
        { text: "GitHub", href: GH },
        { text: "LinkedIn", href: LI },
      ],
    },
  ]);
});

test("quick facts omit rows without data and handle zero or one note", () => {
  const bare = {
    ...profile,
    location: null,
    title: " ",
    career_start_date: null,
    now: {},
    socials: {},
  };
  const facts = buildQuickFacts({ profile: bare, projects: [], noteCount: 0, now: NOW });
  assert.deepEqual(
    facts.map((f) => f.label),
    ["Name", "Also known as", "Writing"],
  );
  assert.deepEqual(facts.at(-1)?.items, [{ text: "First note coming soon" }]);
  const one = buildQuickFacts({ profile, projects: [], noteCount: 1, now: NOW });
  assert.deepEqual(one.find((f) => f.label === "Writing")?.items, [{ text: "1 note", href: "/notes" }]);
});

test("quick facts: a start date under six months shows just the month", () => {
  const facts = buildQuickFacts({
    profile: { ...profile, career_start_date: "2026-08-01" },
    projects: [],
    noteCount: 0,
    now: NOW,
  });
  assert.deepEqual(facts.find((f) => f.label === "Shipping AI since")?.items, [{ text: "Aug 2026" }]);
});

test("quick facts fall back to the brand name and handle without a profile", () => {
  const facts = buildQuickFacts({ profile: null, projects: [], noteCount: 0, now: NOW });
  assert.deepEqual(
    facts.map((f) => [f.label, f.items[0]?.text]),
    [
      ["Name", "Harsh Pandey"],
      ["Also known as", "Knight Developer"],
      ["Writing", "First note coming soon"],
    ],
  );
});

const args = {
  siteUrl: S,
  profile,
  projects,
  experiences: [pastJob, job],
  noteCount: 3,
  now: NOW,
};

test("in brief: the five Q&As, templated from the data", () => {
  assert.deepEqual(buildInBrief(args), [
    {
      question: "Who is Harsh Pandey?",
      answer:
        "Harsh Pandey is an AI engineer & builder based in New Delhi, India, known online as Knight Developer. Harsh Pandey builds AI products and has spent the last 1.5+ years shipping them to production.",
    },
    {
      question: "What is Knight Developer?",
      answer:
        "Knight Developer is the online handle of Harsh Pandey, used on k.dev and across Harsh Pandey's social profiles.",
    },
    {
      question: "What has Harsh Pandey built?",
      answer:
        "Personal projects include Project 1, Project 2, Project 3 and Project 4. See all projects at https://www.k.dev/projects.",
    },
    {
      question: "Where does Harsh Pandey work?",
      answer: "Harsh Pandey works as AI Engineer at BerriBot (since Mar 2025).",
    },
    {
      question: "Where does Harsh Pandey write?",
      answer:
        "Harsh Pandey writes notes at https://www.k.dev/notes (3 so far) and shares them on LinkedIn. New notes can be received by email.",
    },
  ]);
});

test("in brief drops what the data doesn't support", () => {
  const qas = buildInBrief({
    ...args,
    profile: { ...profile, location: null, career_start_date: null, socials: {} },
    projects: [],
    experiences: [pastJob],
    noteCount: 0,
  });
  assert.deepEqual(qas, [
    {
      question: "Who is Harsh Pandey?",
      answer:
        "Harsh Pandey is an AI engineer & builder, known online as Knight Developer. Harsh Pandey builds AI products.",
    },
    {
      question: "What is Knight Developer?",
      answer: "Knight Developer is the online handle of Harsh Pandey, used on k.dev.",
    },
    {
      question: "Where does Harsh Pandey write?",
      answer:
        "Harsh Pandey's notes are starting soon at https://www.k.dev/notes; new notes can be received by email.",
    },
  ]);
});

test("in brief: no 'Who is' without a title; LinkedIn only when set", () => {
  const qas = buildInBrief({ ...args, profile: { ...profile, title: "", socials: { github: GH } } });
  assert.equal(qas[0].question, "What is Knight Developer?");
  assert.equal(
    qas.find((qa) => qa.question.startsWith("Where does Harsh Pandey write"))?.answer,
    "Harsh Pandey writes notes at https://www.k.dev/notes (3 so far). New notes can be received by email.",
  );
});

test("in brief text never leaks emphasis markers or {years}", () => {
  const qas = buildInBrief({
    ...args,
    profile: { ...profile, title: "*Shipping* engineer, {years} years in", full_name: "Harsh *Pandey*" },
  });
  for (const { question, answer } of qas) {
    for (const text of [question, answer]) {
      assert.ok(!text.includes("*") && !text.includes("{years}"), text);
    }
  }
  assert.match(qas[0].answer, /^Harsh Pandey is a Shipping engineer, 1\.5\+ years in based in/);
});
