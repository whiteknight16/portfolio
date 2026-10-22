import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, readingMinutes, dateRange, formatExperienceYears, fillYears, handleSlug, stripEmphasis } from "./format.ts";

test("slugify lowercases and hyphenates", () => {
  assert.equal(slugify("Interview Genie — AI!"), "interview-genie-ai");
});

test("slugify collapses whitespace and strips punctuation", () => {
  assert.equal(slugify("  Hello,   World!!  "), "hello-world");
  assert.equal(slugify("C++ & Rust: A Love Story?"), "c-and-rust-a-love-story");
});

test("readingMinutes: ~200 wpm, min 1", () => {
  assert.equal(readingMinutes("<p>" + "word ".repeat(400) + "</p>"), 2);
  assert.equal(readingMinutes("<p>short</p>"), 1);
});

test("readingMinutes strips tags before counting words", () => {
  const html = "<h1>Title</h1>" + "<p>" + "word ".repeat(199) + "</p>";
  // 200 words total (Title + 199 "word") -> 1 minute at 200wpm boundary.
  assert.equal(readingMinutes(html), 1);
});

test("dateRange formats current role", () => {
  assert.equal(dateRange("2025-03-01", null, true), "Mar 2025 – Present");
});

test("dateRange formats a closed range", () => {
  assert.equal(dateRange("2024-03-01", "2024-08-15", false), "Mar 2024 – Aug 2024");
});

test("dateRange formats an exact month range unaffected by timezone", () => {
  assert.equal(dateRange("2024-07-01", "2024-08-31", false), "Jul 2024 – Aug 2024");
});

test("formatExperienceYears floors to the half-year with a plus", () => {
  assert.equal(formatExperienceYears("2025-03-01", new Date(2026, 9, 22)), "1.5+"); // 19 months
  assert.equal(formatExperienceYears("2025-03-01", new Date(2027, 2, 1)), "2+"); // 24 months
  assert.equal(formatExperienceYears("2025-03-01", new Date(2025, 8, 1)), "0.5+"); // 6 months
});

test("formatExperienceYears hides under six months and when unset", () => {
  assert.equal(formatExperienceYears("2025-03-01", new Date(2025, 7, 31)), null); // 5 months
  assert.equal(formatExperienceYears(null, new Date(2026, 9, 22)), null);
});

test("fillYears replaces every token and collapses spacing when unknown", () => {
  assert.equal(fillYears("the last {years} years, {years}!", "1.5+"), "the last 1.5+ years, 1.5+!");
  assert.equal(fillYears("the last {years} years", null), "the last years");
  assert.equal(fillYears("no token", "2+"), "no token");
});

test("handleSlug lowercases and strips non-alphanumerics", () => {
  assert.equal(handleSlug("Knight Developer"), "knightdeveloper");
});

test("stripEmphasis removes asterisk markers only", () => {
  assert.equal(
    stripEmphasis("I build AI that *does the actual work*: live"),
    "I build AI that does the actual work: live",
  );
});
