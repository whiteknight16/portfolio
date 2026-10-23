import { test } from "node:test";
import assert from "node:assert/strict";
import { contactSchema, projectSchema, experienceSchema, profileSchema, postSchema, subscribeSchema } from "./validation.ts";

test("contactSchema accepts a valid submission with an empty honeypot", () => {
  const result = contactSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there",
    honeypot: "",
  });
  assert.equal(result.success, true);
});

test("contactSchema accepts honeypot: '' with a valid name/email/message, and rejects honeypot: 'spam'", () => {
  const accepted = contactSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there",
    honeypot: "",
  });
  assert.equal(accepted.success, true);

  const rejected = contactSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there",
    honeypot: "spam",
  });
  assert.equal(rejected.success, false);
});

test("contactSchema rejects a submission when the honeypot is filled in", () => {
  const result = contactSchema.safeParse({
    name: "Bot",
    email: "bot@example.com",
    message: "buy now",
    honeypot: "http://spam.example",
  });
  assert.equal(result.success, false);
});

test("contactSchema defaults a missing honeypot to empty and still passes", () => {
  const result = contactSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there",
  });
  assert.equal(result.success, true);
});

test("contactSchema rejects an invalid email", () => {
  const result = contactSchema.safeParse({
    name: "Ada",
    email: "not-an-email",
    message: "hi",
    honeypot: "",
  });
  assert.equal(result.success, false);
});

test("projectSchema transforms a CSV tags string into a trimmed array", () => {
  const result = projectSchema.parse({
    title: "Interview Genie",
    slug: "interview-genie",
    tags: "ai, career-tools ,, nextjs",
  });
  assert.deepEqual(result.tags, ["ai", "career-tools", "nextjs"]);
  assert.equal(result.status, "draft");
  assert.equal(result.cover_image_url, null);
});

test("experienceSchema requires end_date unless is_current is true", () => {
  const missingEnd = experienceSchema.safeParse({
    role: "Engineer",
    company: "Acme",
    start_date: "2024-01-01",
    is_current: false,
  });
  assert.equal(missingEnd.success, false);

  const current = experienceSchema.safeParse({
    role: "Engineer",
    company: "Acme",
    start_date: "2024-01-01",
    is_current: true,
  });
  assert.equal(current.success, true);
});

test("profileSchema accepts a root-relative resume_url (the seeded default)", () => {
  const result = profileSchema.safeParse({
    full_name: "Ada Lovelace",
    resume_url: "/resume.pdf",
  });
  assert.equal(result.success, true);
});

test("profileSchema accepts an absolute https resume_url", () => {
  const result = profileSchema.safeParse({
    full_name: "Ada Lovelace",
    resume_url: "https://x.com/cv.pdf",
  });
  assert.equal(result.success, true);
});

test("profileSchema accepts an empty resume_url", () => {
  const result = profileSchema.safeParse({
    full_name: "Ada Lovelace",
    resume_url: "",
  });
  assert.equal(result.success, true);
  assert.equal(result.data?.resume_url, null);
});

test("profileSchema rejects an invalid resume_url", () => {
  const result = profileSchema.safeParse({
    full_name: "Ada Lovelace",
    resume_url: "not a url",
  });
  assert.equal(result.success, false);
});

test("profileSchema accepts a root-relative avatar_url (the seeded /profile.png)", () => {
  const result = profileSchema.safeParse({
    full_name: "Ada Lovelace",
    avatar_url: "/profile.png",
  });
  assert.equal(result.success, true);
  assert.equal(result.data?.avatar_url, "/profile.png");
});

test("profileSchema accepts an uploaded https avatar_url and rejects junk", () => {
  const ok = profileSchema.safeParse({
    full_name: "Ada Lovelace",
    avatar_url: "https://abc.supabase.co/storage/v1/object/public/media/avatar/x.png",
  });
  assert.equal(ok.success, true);
  const bad = profileSchema.safeParse({ full_name: "Ada Lovelace", avatar_url: "javascript:alert(1)" });
  assert.equal(bad.success, false);
});

test("subscribeSchema trims and lowercases the email", () => {
  const r = subscribeSchema.parse({ email: "  Ada@Example.com ", honeypot: "" });
  assert.equal(r.email, "ada@example.com");
});

test("subscribeSchema rejects a filled honeypot and a bad email", () => {
  assert.equal(subscribeSchema.safeParse({ email: "a@b.co", honeypot: "x" }).success, false);
  assert.equal(subscribeSchema.safeParse({ email: "nope" }).success, false);
});

test("postSchema drops blank tldr lines and caps at three", () => {
  const r = postSchema.parse({ title: "T", slug: "t", tldr: ["a", " ", "b", "c", "d"] });
  assert.deepEqual(r.tldr, ["a", "b", "c"]);
});

test("postSchema normalizes an empty source to nulls", () => {
  const r = postSchema.parse({ title: "T", slug: "t", source_title: "", source_url: "", source_kind: "" });
  assert.equal(r.source_url, null);
  assert.equal(r.source_kind, null);
});

test("profileSchema keeps only highlights with a value or label, max three", () => {
  const r = profileSchema.parse({
    full_name: "H",
    highlights: [
      { value: "2", label: "x" },
      { value: "", label: "" },
    ],
  });
  assert.deepEqual(r.highlights, [{ value: "2", label: "x" }]);
});

test("optional URL fields only accept absolute http(s) URLs", () => {
  for (const bad of ["javascript:alert(1)", "data:text/html,x", "vbscript:msgbox(1)", "ftp://example.com/x"]) {
    assert.equal(postSchema.safeParse({ title: "T", slug: "t", source_url: bad }).success, false, `source_url ${bad}`);
    assert.equal(postSchema.safeParse({ title: "T", slug: "t", cover_image_url: bad }).success, false, `post cover ${bad}`);
    assert.equal(
      projectSchema.safeParse({ title: "T", slug: "t", cover_image_url: bad }).success,
      false,
      `project cover ${bad}`,
    );
  }
  const ok = postSchema.parse({
    title: "T",
    slug: "t",
    source_url: " https://youtu.be/VMj-3S1tku0 ",
    cover_image_url: "http://cdn.example/c.png",
  });
  assert.equal(ok.source_url, "https://youtu.be/VMj-3S1tku0");
  assert.equal(ok.cover_image_url, "http://cdn.example/c.png");
  assert.equal(projectSchema.parse({ title: "T", slug: "t", cover_image_url: "" }).cover_image_url, null);
});

test("project links only accept absolute http(s) URLs", () => {
  assert.equal(projectSchema.safeParse({ title: "T", slug: "t", links: { live: "javascript:alert(1)" } }).success, false);
  assert.equal(projectSchema.safeParse({ title: "T", slug: "t", links: { repo: "data:text/html,x" } }).success, false);
  const ok = projectSchema.parse({
    title: "T",
    slug: "t",
    links: { live: "https://ig.example", repo: "" },
  });
  assert.equal(ok.links.live, "https://ig.example");
  assert.equal(ok.links.repo, undefined);
});

test("subscribeSchema keeps a root-relative source, capped at 200 characters", () => {
  assert.equal(subscribeSchema.parse({ email: "a@b.co", source: "/notes/hello" }).source, "/notes/hello");
  const long = subscribeSchema.parse({ email: "a@b.co", source: `/${"x".repeat(300)}` }).source;
  assert.equal(long?.length, 200);
  assert.ok(long?.startsWith("/x"));
});

test("subscribeSchema stores null for a source that isn't a root-relative path", () => {
  for (const source of ["", "   ", "https://evil.example", "notes", "//evil.example", "javascript:alert(1)"]) {
    const r = subscribeSchema.safeParse({ email: "a@b.co", source });
    assert.equal(r.success, true, source);
    assert.equal(r.data?.source, null, source);
  }
  assert.equal(subscribeSchema.parse({ email: "a@b.co" }).source, null);
});
