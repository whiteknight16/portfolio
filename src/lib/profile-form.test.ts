import { test } from "node:test";
import assert from "node:assert/strict";
import { nowChanged, readHighlights } from "./profile-form.ts";

test("nowChanged ignores whitespace-only differences", () => {
  assert.equal(nowChanged({ building: "x" }, { building: " x ", writing: "" }), false);
  assert.equal(nowChanged(null, {}), false);
});
test("nowChanged detects edits", () => {
  assert.equal(nowChanged({ building: "x" }, { building: "y" }), true);
  assert.equal(nowChanged({}, { learning: "rust" }), true);
  assert.equal(nowChanged({ writing: "a" }, {}), true);
});
test("readHighlights reads three slots", () => {
  const fd = new FormData();
  fd.set("highlights.1.value", "5k");
  fd.set("highlights.1.label", "users");
  const h = readHighlights(fd);
  assert.equal(h.length, 3);
  assert.deepEqual(h[1], { value: "5k", label: "users" });
  assert.deepEqual(h[0], { value: "", label: "" });
});
