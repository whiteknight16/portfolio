import { test } from "node:test";
import assert from "node:assert/strict";
import { proofCells, nowRows, projectKicker, projectCardData } from "./profile-view.ts";
import type { Profile, Highlight, Project } from "./types.ts";

const p: Profile = {
  id: "1",
  full_name: "Harsh Pandey",
  title: "",
  headline: "",
  bio: "",
  avatar_url: null,
  resume_url: null,
  location: null,
  email: null,
  phone: null,
  socials: {},
  handle: null,
  tagline: "",
  career_start_date: "2025-03-01",
  now: {},
  now_updated_at: null,
  highlights: [],
  singleton: true,
  updated_at: "2026-01-01T00:00:00Z",
};
const h1: Highlight = { value: "10", label: "one" };
const h2: Highlight = { value: "20", label: "two" };
const h3: Highlight = { value: "30", label: "three" };
const h4: Highlight = { value: "40", label: "four" };

test("proofCells puts computed years first, then up to three highlights", () => {
  const cells = proofCells({ ...p, highlights: [h1, h2, h3, h4] }, new Date(2026, 9, 22));
  assert.deepEqual(cells[0], { value: "1.5+ yrs", label: "shipping AI products to production" });
  assert.equal(cells.length, 4);
});

test("proofCells drops the years cell when unknown and skips blank highlights", () => {
  const cells = proofCells({ ...p, career_start_date: null, highlights: [{ value: "", label: "" }, h1] });
  assert.deepEqual(cells, [h1]);
  assert.deepEqual(proofCells(null), []);
});

test("nowRows keeps non-blank rows in building, writing, learning order", () => {
  assert.deepEqual(nowRows({ ...p, now: { learning: "ML", building: "  " } }), [{ key: "learning", text: "ML" }]);
  assert.deepEqual(nowRows({ ...p, now: {} }), []);
});

test("proofCells and nowRows treat missing pre-0006 columns as empty", () => {
  // A database that hasn't run 0006 returns rows without `now` / `highlights`.
  const legacy = { ...p, career_start_date: null } as Partial<Profile>;
  delete legacy.now;
  delete legacy.highlights;
  assert.deepEqual(proofCells(legacy as Profile), []);
  assert.deepEqual(nowRows(legacy as Profile), []);
});

test("proofCells tolerates highlight objects with a missing value or label", () => {
  const cells = proofCells({ ...p, career_start_date: null, highlights: [{ value: "3" } as Highlight, {} as Highlight] });
  assert.deepEqual(cells, [{ value: "3", label: "" }]);
});

test("projectCardData keeps only what a project card renders", () => {
  const project: Project = {
    id: "p1",
    title: "Interview Genie",
    slug: "interview-genie",
    summary: "Mock interviews.",
    content: "<p>long case study</p>",
    cover_image_url: "https://cdn.example/c.png",
    tags: ["ai"],
    links: { live: "https://ig.example", repo: "https://github.com/x/y" },
    label: "SaaS",
    featured: true,
    status: "published",
    sort_order: 1,
    published_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
  assert.deepEqual(projectCardData(project), {
    id: "p1",
    slug: "interview-genie",
    title: "Interview Genie",
    summary: "Mock interviews.",
    label: "SaaS",
    tags: ["ai"],
    links: { live: "https://ig.example" },
  });
  const legacy = { ...project, links: {} } as Partial<Project>;
  delete legacy.label;
  assert.deepEqual(projectCardData(legacy as Project), {
    id: "p1",
    slug: "interview-genie",
    title: "Interview Genie",
    summary: "Mock interviews.",
    label: null,
    tags: ["ai"],
    links: {},
  });
});

test("projectKicker appends live", () => {
  assert.equal(projectKicker("SaaS", true), "SaaS · live");
  assert.equal(projectKicker(null, true), "live");
  assert.equal(projectKicker(null, false), null);
});
