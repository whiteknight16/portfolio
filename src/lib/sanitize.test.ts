import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeHtml } from "./sanitize.ts";

test("sanitizeHtml strips <script> tags entirely", () => {
  const dirty = "<p>Hello</p><script>alert('xss')</script>";
  assert.equal(sanitizeHtml(dirty), "<p>Hello</p>");
});

test("sanitizeHtml strips onerror and other event handler attributes", () => {
  const dirty = "<img src=\"x.png\" onerror=\"alert(1)\" alt=\"x\">";
  const clean = sanitizeHtml(dirty);
  assert.ok(!clean.includes("onerror"));
  assert.ok(clean.includes('src="x.png"'));
});

test("sanitizeHtml keeps allowlisted tags and attributes", () => {
  const html =
    '<h2>Title</h2><p>Body with <a href="https://x.com" target="_blank" rel="noopener">link</a></p><ul><li>item</li></ul>';
  assert.equal(sanitizeHtml(html), html);
});

test("sanitizeHtml drops disallowed tags like style/iframe but keeps their text where applicable", () => {
  const dirty = '<style>body{color:red}</style><iframe src="evil"></iframe><p>safe</p>';
  const clean = sanitizeHtml(dirty);
  assert.ok(!clean.includes("<style"));
  assert.ok(!clean.includes("<iframe"));
  assert.ok(clean.includes("<p>safe</p>"));
});
