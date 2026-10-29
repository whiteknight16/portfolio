import { test } from "node:test";
import assert from "node:assert/strict";
import { htmlToMarkdown } from "./html-text.ts";

test("paragraphs become blank-line separated text with whitespace collapsed", () => {
  assert.equal(htmlToMarkdown("<p>One\n   two</p>\n<p>Three</p>"), "One two\n\nThree");
});

test("headings become # lines, optionally shifted down", () => {
  assert.equal(htmlToMarkdown("<h2>Why</h2><p>x</p>"), "## Why\n\nx");
  assert.equal(htmlToMarkdown("<h2>Why</h2>", { headingOffset: 2 }), "#### Why");
  assert.equal(htmlToMarkdown("<h4>Deep</h4>", { headingOffset: 4 }), "###### Deep");
});

test("lists become - / 1. items, nested lists indented, Tiptap's <li><p> unwrapped", () => {
  const html =
    "<ul><li><p>First</p></li><li><p>Second</p><ul><li><p>Inner</p></li></ul></li></ul><ol><li>One</li><li>Two</li></ol>";
  assert.equal(htmlToMarkdown(html), "- First\n- Second\n  - Inner\n\n1. One\n2. Two");
});

test("links, inline code and code blocks", () => {
  assert.equal(
    htmlToMarkdown('<p>See <a href="https://x.dev/a" target="_blank" rel="noopener">the <strong>docs</strong></a> and <code>npm test</code>.</p>'),
    "See [the docs](https://x.dev/a) and `npm test`.",
  );
  assert.equal(htmlToMarkdown("<a>bare</a>"), "bare");
  assert.equal(
    htmlToMarkdown("<pre><code>const a = 1;\nif (a &lt; 2) {\n  go();\n}</code></pre>"),
    "```\nconst a = 1;\nif (a < 2) {\n  go();\n}\n```",
  );
});

test("other tags are stripped, keeping their text; images dropped", () => {
  assert.equal(
    htmlToMarkdown('<p><em>Very</em> <mark>important</mark><br>line two<img src="x.png" alt="x"></p>'),
    "Very important\nline two",
  );
  assert.equal(htmlToMarkdown("<blockquote><p>Quoted</p><p>Again</p></blockquote>"), "> Quoted\n>\n> Again");
  assert.equal(htmlToMarkdown("<p>a</p><hr><p>b</p>"), "a\n\n---\n\nb");
});

test("entities are decoded", () => {
  assert.equal(
    htmlToMarkdown("<p>Tom &amp; Jerry &lt;3 &quot;hi&quot; &#39;yo&#39; &#x2014;&nbsp;ok</p>"),
    "Tom & Jerry <3 \"hi\" 'yo' — ok",
  );
});

test("empty input and stray text are handled", () => {
  assert.equal(htmlToMarkdown(""), "");
  assert.equal(htmlToMarkdown("plain words"), "plain words");
  assert.equal(htmlToMarkdown("<p></p><p>  </p>"), "");
});
