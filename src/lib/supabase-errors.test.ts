import { test } from "node:test";
import assert from "node:assert/strict";
import { isUniqueViolation } from "./supabase-errors.ts";

test("isUniqueViolation recognises Postgres 23505 only", () => {
  assert.equal(isUniqueViolation({ code: "23505" }), true);
  assert.equal(isUniqueViolation({ code: "42501" }), false);
  assert.equal(isUniqueViolation(null), false);
});
