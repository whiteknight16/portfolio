import { test } from "node:test";
import assert from "node:assert/strict";
import { contactSchema, projectSchema, experienceSchema, profileSchema } from "./validation.ts";

test("contactSchema accepts a valid submission with an empty honeypot", () => {
  const result = contactSchema.safeParse({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there",
    honeypot: "",
  });
  assert.equal(result.success, true);
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
