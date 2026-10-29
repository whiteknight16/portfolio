import { test } from "node:test";
import assert from "node:assert/strict";
import { socialLinks } from "./socials.ts";

test("socialLinks keeps set profiles in display order with their labels", () => {
  assert.deepEqual(
    socialLinks({ website: "https://k.dev", github: "https://github.com/h", twitter: "", linkedin: "https://linkedin.com/in/h" }),
    [
      { key: "github", label: "GitHub", href: "https://github.com/h" },
      { key: "linkedin", label: "LinkedIn", href: "https://linkedin.com/in/h" },
      { key: "website", label: "Website", href: "https://k.dev" },
    ],
  );
});

test("socialLinks is empty without socials and ignores unknown keys", () => {
  assert.deepEqual(socialLinks(null), []);
  assert.deepEqual(socialLinks({ mastodon: "https://m.example/@h" }), []);
});
