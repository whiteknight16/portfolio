import { test } from "node:test";
import assert from "node:assert/strict";
import { readPublicEnv } from "./env.ts";

test("readPublicEnv throws when supabase url missing", () => {
  assert.throws(() => readPublicEnv({}), /NEXT_PUBLIC_SUPABASE_URL/);
});

test("readPublicEnv returns values when present", () => {
  const e = readPublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    ADMIN_EMAIL: "a@b.com",
  });
  assert.equal(e.supabaseUrl, "https://x.supabase.co");
  assert.equal(e.adminEmail, "a@b.com");
});
