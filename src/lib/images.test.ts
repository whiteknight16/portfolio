import { test } from "node:test";
import assert from "node:assert/strict";
import { isOptimizableImage, supabaseStoragePattern } from "./images.ts";

const SUPA = "https://abc.supabase.co";
const OBJECT = `${SUPA}/storage/v1/object/public/media/avatar/me.png`;

test("supabaseStoragePattern allows only public storage objects on the project host", () => {
  assert.deepEqual(supabaseStoragePattern(SUPA), {
    protocol: "https",
    hostname: "abc.supabase.co",
    port: "",
    pathname: "/storage/v1/object/public/**",
  });
  assert.equal(supabaseStoragePattern(undefined), null);
  assert.equal(supabaseStoragePattern("not a url"), null);
});

test("isOptimizableImage: root-relative paths and this project's public storage objects", () => {
  assert.equal(isOptimizableImage("/profile.png", SUPA), true);
  assert.equal(isOptimizableImage(OBJECT, SUPA), true);
  assert.equal(isOptimizableImage("/profile.png", undefined), true);
});

test("isOptimizableImage rejects every other host, path or protocol", () => {
  assert.equal(isOptimizableImage("https://cdn.example/c.png", SUPA), false);
  assert.equal(isOptimizableImage(`${SUPA}/storage/v1/object/sign/media/x.png`, SUPA), false);
  assert.equal(isOptimizableImage(OBJECT.replace("https:", "http:"), SUPA), false);
  assert.equal(isOptimizableImage(OBJECT, undefined), false);
  assert.equal(isOptimizableImage("//evil.example/x.png", SUPA), false);
  assert.equal(isOptimizableImage("", SUPA), false);
});
