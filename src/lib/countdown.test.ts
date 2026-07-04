import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTimeLeft } from "./countdown.ts";

const now = new Date("2026-07-04T00:00:00Z");

test("breaks a future gap into whole days/hours/minutes/seconds", () => {
  // 1 day, 2 hours, 3 minutes, 4 seconds ahead of `now`.
  const target = new Date(now.getTime() + ((1 * 24 + 2) * 60 + 3) * 60_000 + 4_000);
  const t = computeTimeLeft(target, now);
  assert.deepEqual(t, {
    days: 1,
    hours: 2,
    minutes: 3,
    seconds: 4,
    isComplete: false,
  });
});

test("counts the full week to the real launch instant", () => {
  // Sat 4 Jul 00:00 IST -> Sat 11 Jul 00:00 IST is exactly 7 days.
  const t = computeTimeLeft("2026-07-11T00:00:00+05:30", "2026-07-04T00:00:00+05:30");
  assert.equal(t.days, 7);
  assert.equal(t.hours, 0);
  assert.equal(t.isComplete, false);
});

test("clamps to zero and completes once the target has passed", () => {
  const target = new Date(now.getTime() - 5_000);
  assert.deepEqual(computeTimeLeft(target, now), {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: true,
  });
});

test("treats hitting the target exactly as complete", () => {
  assert.equal(computeTimeLeft(now, now).isComplete, true);
});

test("accepts string and number targets equivalently", () => {
  const iso = "2026-07-11T00:00:00+05:30";
  const asNumber = new Date(iso).getTime();
  assert.deepEqual(computeTimeLeft(iso, now), computeTimeLeft(asNumber, now));
});
