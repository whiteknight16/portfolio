import { test } from "node:test";
import assert from "node:assert/strict";
import { subscribePlacement } from "./home-view.ts";

test("subscribePlacement: the Newsletter panel is the target whenever it is shown", () => {
  assert.deepEqual(subscribePlacement(["projects", "blog", "newsletter", "experience"]), {
    target: "newsletter",
    notes: "below",
  });
  assert.deepEqual(subscribePlacement(["newsletter", "projects"]), { target: "newsletter", notes: null });
  assert.deepEqual(subscribePlacement(["newsletter"]), { target: "newsletter", notes: null });
});

test("subscribePlacement: the Notes link points up when the Newsletter panel comes first", () => {
  assert.deepEqual(subscribePlacement(["newsletter", "blog"]), { target: "newsletter", notes: "above" });
  assert.deepEqual(subscribePlacement(["projects", "newsletter", "experience", "blog"]), {
    target: "newsletter",
    notes: "above",
  });
});

test("subscribePlacement: without the Newsletter panel, Notes carries the form", () => {
  assert.deepEqual(subscribePlacement(["projects", "blog", "experience"]), { target: "notes", notes: "form" });
  assert.deepEqual(subscribePlacement(["experience", "blog"]), { target: "notes", notes: "form" });
  assert.deepEqual(subscribePlacement(["blog"]), { target: "notes", notes: "form" });
});

test("subscribePlacement: with neither Notes nor Newsletter, a block at the end of the page", () => {
  assert.deepEqual(subscribePlacement(["projects", "experience"]), { target: "end", notes: null });
  assert.deepEqual(subscribePlacement([]), { target: "end", notes: null });
});
