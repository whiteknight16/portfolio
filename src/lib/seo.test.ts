import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildBlogPostingJsonLd,
  buildLlmsTxt,
  buildPersonJsonLd,
  buildRssXml,
} from "./seo.ts";
import type { Post, Profile } from "./types.ts";

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
