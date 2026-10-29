import { test } from "node:test";
import assert from "node:assert/strict";
import {
  noteAuthor,
  noteImageUrl,
  noteMetadata,
  noteRowData,
  noteUpdatedDate,
  ogTitleSize,
  safeHttpUrl,
  sourceCard,
  tldrLines,
  urlHost,
} from "./note-view.ts";
import type { Post, Profile, SourceKind } from "./types.ts";

const src = (source_url: string | null, source_title: string | null = null, source_kind: SourceKind | null = null) => ({
  source_url,
  source_title,
  source_kind,
});

test("safeHttpUrl keeps http(s) URLs and rejects everything else", () => {
  assert.equal(safeHttpUrl("https://youtu.be/VMj-3S1tku0"), "https://youtu.be/VMj-3S1tku0");
  assert.equal(safeHttpUrl("  http://example.com/a  "), "http://example.com/a");
  assert.equal(safeHttpUrl("javascript:alert(1)"), null);
  assert.equal(safeHttpUrl("mailto:me@example.com"), null);
  assert.equal(safeHttpUrl("not a url"), null);
  assert.equal(safeHttpUrl(""), null);
  assert.equal(safeHttpUrl(null), null);
});

test("urlHost drops a leading www. and returns null for junk", () => {
  assert.equal(urlHost("https://www.youtube.com/watch?v=1"), "youtube.com");
  assert.equal(urlHost("https://knightdeveloper.com"), "knightdeveloper.com");
  assert.equal(urlHost("https://arxiv.org/abs/1706.03762"), "arxiv.org");
  assert.equal(urlHost("nope"), null);
});

test("sourceCard is null without a usable source URL", () => {
  assert.equal(sourceCard(src(null, "A title", "video")), null);
  assert.equal(sourceCard(src("   ", "A title", "video")), null);
  assert.equal(sourceCard(src("javascript:alert(1)", "A title", "video")), null);
});

test("sourceCard picks the action text from the kind", () => {
  assert.equal(sourceCard(src("https://youtube.com/x", "T", "video"))?.action, "watch ↗");
  assert.equal(sourceCard(src("https://pod.example/x", "T", "podcast"))?.action, "listen ↗");
  for (const kind of ["article", "paper", "course", "book", "other"] as const) {
    assert.equal(sourceCard(src("https://example.com/x", "T", kind))?.action, "read ↗");
  }
  assert.equal(sourceCard(src("https://example.com/x", "T", null))?.action, "read ↗");
});

test("sourceCard labels 'Notes on' plus the kind, except for other/unset", () => {
  assert.equal(sourceCard(src("https://youtube.com/x", "T", "video"))?.label, "Notes on · video");
  assert.equal(sourceCard(src("https://example.com/x", "T", "paper"))?.label, "Notes on · paper");
  assert.equal(sourceCard(src("https://example.com/x", "T", "other"))?.label, "Notes on");
  assert.equal(sourceCard(src("https://example.com/x", "T", null))?.label, "Notes on");
});

test("sourceCard shows the host under a real title, and falls back to the host as the title", () => {
  assert.deepEqual(
    sourceCard(src("https://www.youtube.com/watch?v=VMj", "  The spelled-out intro  ", "video")),
    {
      url: "https://www.youtube.com/watch?v=VMj",
      label: "Notes on · video",
      title: "The spelled-out intro",
      host: "youtube.com",
      action: "watch ↗",
    },
  );
  const untitled = sourceCard(src("https://www.youtube.com/watch?v=VMj", "   ", "video"));
  assert.equal(untitled?.title, "youtube.com");
  assert.equal(untitled?.host, null);
});

test("tldrLines trims, drops blank lines and keeps at most three", () => {
  assert.deepEqual(tldrLines([]), []);
  assert.deepEqual(tldrLines(["  a ", "", "   "]), ["a"]);
  assert.deepEqual(tldrLines(["a", "b", "c", "d"]), ["a", "b", "c"]);
});

test("tldrLines treats a missing pre-0006 tldr column as empty", () => {
  assert.deepEqual(tldrLines(undefined), []);
  assert.deepEqual(tldrLines(null), []);
});

test("ogTitleSize shrinks titles longer than 70 characters", () => {
  assert.equal(ogTitleSize("Building micrograd from scratch, part 1"), 64);
  assert.equal(ogTitleSize("x".repeat(70)), 64);
  assert.equal(ogTitleSize("x".repeat(71)), 52);
});

test("noteImageUrl prefers the cover and otherwise points at the generated card", () => {
  const siteUrl = "https://knightdeveloper.com";
  assert.equal(
    noteImageUrl(siteUrl, { slug: "hello", cover_image_url: "https://cdn.example/c.png" }),
    "https://cdn.example/c.png",
  );
  assert.equal(
    noteImageUrl(siteUrl, { slug: "hello", cover_image_url: null }),
    "https://knightdeveloper.com/notes/hello/og",
  );
});

const profile: Profile = {
  id: "1",
  full_name: "Harsh Pandey",
  title: "AI engineer & builder",
  headline: "",
  bio: "",
  avatar_url: "https://cdn.example/me.jpg",
  resume_url: null,
  location: null,
  email: null,
  phone: null,
  socials: {},
  handle: "Knight Developer",
  tagline: "",
  career_start_date: "2025-03-01",
  now: {},
  now_updated_at: null,
  highlights: [],
  singleton: true,
  updated_at: "2026-01-01T00:00:00Z",
};

test("noteAuthor reads the profile", () => {
  assert.deepEqual(noteAuthor(profile), {
    name: "Harsh Pandey",
    handle: "Knight Developer",
    title: "AI engineer & builder",
    avatarUrl: "https://cdn.example/me.jpg",
  });
});

test("noteAuthor fills {years}, strips emphasis and a trailing period from the title", () => {
  const now = new Date(2026, 9, 23);
  const author = noteAuthor({ ...profile, title: "Shipping *AI* for {years} years." }, now);
  assert.equal(author.title, "Shipping AI for 1.5+ years");
});

test("noteAuthor falls back to the brand without a profile, or with blank fields", () => {
  const fallback = {
    name: "Harsh Pandey",
    handle: "Knight Developer",
    title: "AI engineer & builder",
    avatarUrl: "/profile.png",
  };
  assert.deepEqual(noteAuthor(null), fallback);
  assert.deepEqual(
    noteAuthor({ ...profile, full_name: "", handle: null, title: "", avatar_url: null }),
    fallback,
  );
});

const post: Post = {
  id: "p1",
  title: "Building micrograd from scratch, part 1",
  slug: "building-micrograd-part-1",
  excerpt: "Following Karpathy's video line by line.",
  content: "<p>Body</p>",
  cover_image_url: null,
  tags: ["neural nets", "micrograd"],
  source_title: null,
  source_url: null,
  source_kind: null,
  tldr: [],
  status: "published",
  reading_minutes: 9,
  published_at: "2026-10-09T10:00:00Z",
  created_at: "2026-10-08T10:00:00Z",
  updated_at: "2026-10-10T10:00:00Z",
};
const site = { siteUrl: "https://knightdeveloper.com", name: "Harsh Pandey" };

test("noteMetadata: title, canonical, article OG with the generated card, large Twitter card", () => {
  const card = "https://knightdeveloper.com/notes/building-micrograd-part-1/og";
  assert.deepEqual(noteMetadata(post, site), {
    title: "Building micrograd from scratch, part 1 — Harsh Pandey",
    description: "Following Karpathy's video line by line.",
    alternates: {
      canonical: "/notes/building-micrograd-part-1",
      types: { "application/rss+xml": [{ url: "/notes/rss.xml", title: "Notes by Harsh Pandey" }] },
    },
    openGraph: {
      type: "article",
      title: "Building micrograd from scratch, part 1 — Harsh Pandey",
      description: "Following Karpathy's video line by line.",
      url: "/notes/building-micrograd-part-1",
      siteName: "Harsh Pandey",
      locale: "en_US",
      publishedTime: "2026-10-09T10:00:00Z",
      modifiedTime: "2026-10-10T10:00:00Z",
      tags: ["neural nets", "micrograd"],
      images: [{ url: card, width: 1200, height: 630, alt: "Building micrograd from scratch, part 1" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Building micrograd from scratch, part 1 — Harsh Pandey",
      description: "Following Karpathy's video line by line.",
      images: [card],
    },
  });
});

test("noteMetadata uses the cover when set", () => {
  const meta = noteMetadata({ ...post, cover_image_url: "https://cdn.example/c.png" }, site);
  assert.deepEqual(meta.twitter, {
    card: "summary_large_image",
    title: "Building micrograd from scratch, part 1 — Harsh Pandey",
    description: "Following Karpathy's video line by line.",
    images: ["https://cdn.example/c.png"],
  });
});

test("noteMetadata for a bare note leaves out description and tags", () => {
  const meta = noteMetadata({ ...post, excerpt: "  ", tags: [] }, site);
  assert.equal(meta.description, undefined);
  const og = meta.openGraph as Record<string, unknown>;
  assert.equal(og.description, undefined);
  assert.equal(og.tags, undefined);
  assert.deepEqual(og.images, [
    {
      url: "https://knightdeveloper.com/notes/building-micrograd-part-1/og",
      width: 1200,
      height: 630,
      alt: "Building micrograd from scratch, part 1",
    },
  ]);
});

test("noteMetadata and sourceCard survive a note row from before 0006 (no tldr/source columns)", () => {
  const legacy = { ...post } as Partial<Post>;
  delete legacy.tldr;
  delete legacy.source_url;
  delete legacy.source_title;
  delete legacy.source_kind;
  assert.equal(sourceCard(legacy as Post), null);
  assert.deepEqual(tldrLines((legacy as Post).tldr), []);
  assert.equal(noteMetadata(legacy as Post, site).title, "Building micrograd from scratch, part 1 — Harsh Pandey");
});

test("noteRowData keeps only what a note row renders (no body HTML)", () => {
  assert.deepEqual(noteRowData({ ...post, source_title: "Karpathy" }), {
    id: "p1",
    slug: "building-micrograd-part-1",
    title: "Building micrograd from scratch, part 1",
    excerpt: "Following Karpathy's video line by line.",
    published_at: "2026-10-09T10:00:00Z",
    reading_minutes: 9,
    source_title: "Karpathy",
    tags: ["neural nets", "micrograd"],
  });
  const legacy = { ...post } as Partial<Post>;
  delete legacy.source_title;
  assert.equal(noteRowData(legacy as Post).source_title, null);
  assert.equal("content" in noteRowData(post), false);
});

test("noteUpdatedDate shows an edit made more than a day after publishing", () => {
  const published_at = "2026-10-09T10:00:00Z";
  assert.equal(noteUpdatedDate({ published_at, updated_at: "2026-10-22T08:00:00Z" }), "Oct 22, 2026");
  assert.equal(noteUpdatedDate({ published_at, updated_at: "2026-10-10T10:00:00Z" }), null);
  assert.equal(noteUpdatedDate({ published_at, updated_at: "2026-10-09T10:05:00Z" }), null);
  assert.equal(noteUpdatedDate({ published_at: null, updated_at: "2026-10-22T08:00:00Z" }), null);
  assert.equal(noteUpdatedDate({ published_at, updated_at: "nope" }), null);
});
