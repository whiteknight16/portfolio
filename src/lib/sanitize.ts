/**
 * HTML sanitizer for rich-text fields (project/post `content`) coming out of
 * the admin's Tiptap editor. Wraps isomorphic-dompurify with a strict
 * allowlist — scripts, inline event handlers, and styles are always stripped.
 */

import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "a",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "code",
  "pre",
  "blockquote",
  "img",
  "hr",
  "br",
];

const ALLOWED_ATTR = ["href", "title", "target", "rel", "src", "alt"];

/** Attributes allowed per tag — scopes href/target/rel to <a> and src/alt to <img>. */
const ALLOWED_ATTR_BY_TAG: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt"],
};

DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  const allowedForTag = ALLOWED_ATTR_BY_TAG[node.tagName.toLowerCase()] ?? [];
  if (!allowedForTag.includes(data.attrName)) {
    data.keepAttr = false;
  }
});

/** Sanitize untrusted HTML down to a safe, presentational subset. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
