import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildLlmsTxt,
  buildPersonJsonLd,
  buildProfilePageJsonLd,
  buildProjectJsonLd,
  buildRssXml,
} from "./seo.ts";
import type { Post, Profile, Project } from "./types.ts";

const S = "https://k.dev";
const I = S + "/og.png";
const L = "https://linkedin.com/in/harsh";
const Y = "https://youtube.com/@harsh";

const p: Profile = {
  id: "1",
  full_name: "Harsh Pandey",
  title: "AI engineer",
  headline: "I build *AI* that works, {years} years in",
  bio: "Bio with {years} years.",
  avatar_url: "/me.png",
  resume_url: null,
  location: null,
  email: null,
  phone: null,
  socials: { github: "https://github.com/h" },
  handle: "Knight Developer",
  tagline: "t",
  career_start_date: "2025-01-01",
  now: {},
  now_updated_at: null,
  highlights: [],
  singleton: true,
  updated_at: "2026-01-01T00:00:00Z",
};

const post: Post = {
  id: "p1",
  title: "Hello",
  slug: "hello",
  excerpt: "An excerpt",
  content: "<p>hi</p>",
  cover_image_url: "https://k.dev/c.png",
  tags: ["ai", "voice"],
  source_title: "Src",
  source_url: null,
  source_kind: null,
  tldr: ["a"],
  status: "published",
  reading_minutes: 1,
  published_at: "2026-02-01T00:00:00Z",
  created_at: "2026-02-01T00:00:00Z",
  updated_at: "2026-02-02T00:00:00Z",
};
const bare: Post = {
  ...post,
  excerpt: "",
  tags: [],
  source_title: null,
  source_url: null,
  source_kind: null,
  tldr: [],
  cover_image_url: null,
};

test("person JSON-LD carries both names, socials and employer", () => {
  const ld = buildPersonJsonLd({ siteUrl: "https://k.dev", profile: { ...p, socials: { linkedin: L, youtube: Y } }, skills: ["LiveKit"], currentCompany: "BerriBot", school: "REC Sonbhadra" });
  assert.deepEqual(ld.alternateName, ["Knight Developer", "knightdeveloper"]);
  assert.ok((ld.sameAs as string[]).includes(Y));
  assert.deepEqual(ld.worksFor, { "@type": "Organization", name: "BerriBot" });
  assert.deepEqual(ld.knowsAbout, ["LiveKit"]);
});
test("person JSON-LD omits worksFor/alumniOf when unknown", () => {
  const ld = buildPersonJsonLd({ siteUrl: "https://k.dev", profile: p, skills: [], currentCompany: null, school: null });
  assert.equal("worksFor" in ld, false); assert.equal("alumniOf" in ld, false);
});
test("blog posting links its source only when set", () => {
  assert.equal(buildBlogPostingJsonLd({ siteUrl: S, post: { ...post, source_url: "https://youtu.be/x" }, imageUrl: I }).isBasedOn, "https://youtu.be/x");
  assert.equal("isBasedOn" in buildBlogPostingJsonLd({ siteUrl: S, post: bare, imageUrl: I }), false);
});
test("rss escapes titles and wraps content safely", () => {
  const xml = buildRssXml({ siteUrl: S, title: "Notes", description: "d", posts: [{ ...post, title: "A & B", content: "<p>x]]>y</p>" }] });
  assert.match(xml, /<title>A &amp; B<\/title>/);
  assert.match(xml, /<link>https:\/\/k\.dev\/notes\/hello<\/link>/);
  assert.ok(!xml.includes("x]]>y"));
});
test("rss with no posts is still a valid channel", () => {
  assert.match(buildRssXml({ siteUrl: S, title: "Notes", description: "d", posts: [] }), /<channel>[\s\S]*<\/channel>/);
});
test("llms.txt leads with name and handle and lists notes", () => {
  const txt = buildLlmsTxt({ siteUrl: S, profile: p, years: "1.5+", posts: [post], projects: [] });
  assert.ok(txt.startsWith("# Harsh Pandey (Knight Developer)"));
  assert.ok(txt.includes(`- [${post.title}](https://k.dev/notes/${post.slug})`));
  assert.ok(!txt.includes("{years}"));
});
test("llms.txt states current focus from now, omitted when blank", () => {
  const txt = buildLlmsTxt({ siteUrl: S, profile: { ...p, now: { building: "an AI tutor", learning: "ML" } }, years: null, posts: [], projects: [] });
  assert.ok(txt.includes("## Now"));
  assert.ok(txt.includes("- Building: an AI tutor"));
  assert.ok(txt.includes("- Learning: ML"));
  assert.ok(!txt.includes("Writing"));
  assert.ok(!buildLlmsTxt({ siteUrl: S, profile: { ...p, now: {} }, years: null, posts: [], projects: [] }).includes("## Now"));
});
test("profile page JSON-LD lives on /about and points at the person", () => {
  const ld = buildProfilePageJsonLd(S);
  assert.equal(ld.url, "https://k.dev/about");
  assert.equal(ld["@id"], "https://k.dev/about#profilepage");
  assert.deepEqual(ld.mainEntity, { "@id": "https://k.dev/#person" });
});
test("profile text never leaks emphasis markers or {years}", () => {
  const ld = buildPersonJsonLd({ siteUrl: S, profile: { ...p, title: "*AI* engineer {years}" }, skills: [], currentCompany: null, school: null });
  for (const v of [ld.description, ld.jobTitle]) {
    assert.ok(!String(v).includes("*") && !String(v).includes("{years}"));
  }
  const txt = buildLlmsTxt({ siteUrl: S, profile: { ...p, now: { building: "*x* {years}" } }, years: null, posts: [], projects: [] });
  assert.ok(!txt.includes("*") && !txt.includes("{years}"));
});

test("breadcrumbs start at Home and use absolute URLs", () => {
  assert.deepEqual(
    buildBreadcrumbJsonLd(S, [
      { name: "Notes", path: "/notes" },
      { name: "Hello", path: "/notes/hello" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://k.dev/" },
        { "@type": "ListItem", position: 2, name: "Notes", item: "https://k.dev/notes" },
        { "@type": "ListItem", position: 3, name: "Hello", item: "https://k.dev/notes/hello" },
      ],
    },
  );
});
test("breadcrumbs for a top-level page are Home › page", () => {
  const ld = buildBreadcrumbJsonLd(S, [{ name: "About", path: "/about" }]);
  assert.deepEqual(
    (ld.itemListElement as { name: string }[]).map((i) => i.name),
    ["Home", "About"],
  );
});

const project: Project = {
  id: "pr1",
  title: "IVF Assistant",
  slug: "ivf-assistant",
  summary: "A live copilot.",
  content: "<p>x</p>",
  cover_image_url: null,
  tags: ["voice", "ai"],
  links: { live: "https://ivf.example", repo: "https://github.com/h/ivf" },
  label: null,
  featured: true,
  status: "published",
  sort_order: 1,
  published_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
};

test("project JSON-LD is a web SoftwareApplication by the person", () => {
  assert.deepEqual(buildProjectJsonLd({ siteUrl: S, project, imageUrl: I }), {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "IVF Assistant",
    description: "A live copilot.",
    url: "https://k.dev/projects/ivf-assistant",
    applicationCategory: "WebApplication",
    operatingSystem: "Web",
    author: { "@id": "https://k.dev/#person" },
    creator: { "@id": "https://k.dev/#person" },
    keywords: "voice, ai",
    image: I,
    sameAs: ["https://ivf.example", "https://github.com/h/ivf"],
    dateModified: "2026-03-01T00:00:00Z",
  });
});
test("project JSON-LD leaves out empty description, keywords and links", () => {
  const ld = buildProjectJsonLd({
    siteUrl: S,
    project: { ...project, summary: " ", tags: [], links: { live: "javascript:alert(1)" } },
    imageUrl: I,
  });
  for (const key of ["description", "keywords", "sameAs"]) assert.equal(key in ld, false, key);
});
