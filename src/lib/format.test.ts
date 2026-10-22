import { test } from "node:test";
import assert from "node:assert/strict";
import {
  slugify,
  readingMinutes,
  dateRange,
  formatExperienceYears,
  fillYears,
  handleSlug,
  stripEmphasis,
  splitEmphasis,
  formatNoteDate,
} from "./format.ts";

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

test("splitEmphasis splits exactly one *…* pair", () => {
  assert.deepEqual(splitEmphasis("I build AI that *does the actual work*: live"), {
    before: "I build AI that ",
    em: "does the actual work",
    after: ": live",
  });
  assert.deepEqual(splitEmphasis("*all of it*"), { before: "", em: "all of it", after: "" });
});

test("splitEmphasis returns null unless there is exactly one non-empty pair", () => {
  assert.equal(splitEmphasis("no markers"), null);
  assert.equal(splitEmphasis("one * stray"), null);
  assert.equal(splitEmphasis("*one* and *two*"), null);
  assert.equal(splitEmphasis("an empty ** pair"), null);
  assert.equal(splitEmphasis("blank * * pair"), null);
});

test("formatNoteDate uses the UTC calendar date so server and browser agree", () => {
  assert.equal(formatNoteDate("2026-10-20T23:30:00+00:00"), "Oct 20, 2026");
  assert.equal(formatNoteDate("2026-10-21T02:00:00+05:30"), "Oct 20, 2026");
  assert.equal(formatNoteDate("2026-01-09T08:00:00Z"), "Jan 9, 2026");
});

test("formatNoteDate returns null when unset or unparseable", () => {
  assert.equal(formatNoteDate(null), null);
  assert.equal(formatNoteDate("not a date"), null);
});
