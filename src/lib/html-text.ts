/**
 * Sanitized rich-text HTML (see sanitize.ts) to readable Markdown, for plain
 * text outputs like /llms-full.txt. Headings become `#` lines, lists `- ` /
 * `1. ` items, links `[text](url)`, code backticks or fences, blockquotes `> `;
 * every other tag is stripped to its text and images are dropped. A small
 * tolerant parser, not a full HTML one: the input is our own sanitized output.
 */

type Element = { tag: string; attrs: Record<string, string>; children: Node[] };
type Node = Element | string;

const VOID = new Set(["br", "hr", "img", "wbr", "input", "source"]);
const BLOCK = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "pre", "blockquote", "hr",
  "figure", "section", "article", "table",
]);
const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

const TOKEN =
  /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+|<)/g;
const ATTR = /([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    if (name[0] !== "#") return NAMED[name.toLowerCase()] ?? entity;
    const code = name[1] === "x" || name[1] === "X" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  });
}

function parse(html: string): Element {
  const root: Element = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  for (const [, closing, rawTag, rawAttrs, selfClosing, text] of html.matchAll(TOKEN)) {
    const top = stack[stack.length - 1];
    if (text !== undefined) {
      top.children.push(text);
    } else if (rawTag) {
      const tag = rawTag.toLowerCase();
      if (closing) {
        const open = stack.findLastIndex((el) => el.tag === tag);
        if (open > 0) stack.length = open;
      } else {
        const attrs: Record<string, string> = {};
        for (const [, name, dq, sq, bare] of (rawAttrs ?? "").matchAll(ATTR)) {
          attrs[name.toLowerCase()] = decode(dq ?? sq ?? bare ?? "");
        }
        const el: Element = { tag, attrs, children: [] };
        top.children.push(el);
        if (!VOID.has(tag) && !selfClosing) stack.push(el);
      }
    }
  }
  return root;
}

/** Text exactly as written (for code), `<br>` as a newline. */
function rawText(node: Node): string {
  if (typeof node === "string") return decode(node);
  return node.tag === "br" ? "\n" : node.children.map(rawText).join("");
}

function inline(nodes: Node[]): string {
  return nodes
    .map((node) => {
      if (typeof node === "string") return decode(node).replace(/\s+/g, " ");
      switch (node.tag) {
        case "br":
          return "\n";
        case "img":
          return "";
        case "code":
          return `\`${rawText(node)}\``;
        case "a": {
          const text = tidy(inline(node.children));
          const href = node.attrs.href?.trim();
          return href && text ? `[${text}](${href})` : text;
        }
        default:
          return inline(node.children);
      }
    })
    .join("");
}

/** Inline text with single spaces and no blank edges on any line. */
const tidy = (text: string) =>
  text
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();

function blocks(nodes: Node[], offset: number): string[] {
  const out: string[] = [];
  let run: Node[] = [];
  const flush = () => {
    const text = tidy(inline(run));
    if (text) out.push(text);
    run = [];
  };
  for (const node of nodes) {
    if (typeof node === "string" || !BLOCK.has(node.tag)) {
      run.push(node);
      continue;
    }
    flush();
    const text = block(node, offset);
    if (text) out.push(text);
  }
  flush();
  return out;
}

function block(el: Element, offset: number): string {
  const heading = /^h([1-6])$/.exec(el.tag);
  if (heading) {
    const text = tidy(inline(el.children));
    return text ? `${"#".repeat(Math.min(6, Number(heading[1]) + offset))} ${text}` : "";
  }
  switch (el.tag) {
    case "ul":
    case "ol":
      return list(el, offset);
    case "pre":
      return `\`\`\`\n${rawText(el).replace(/^\n+|\s+$/g, "")}\n\`\`\``;
    case "blockquote":
      return blocks(el.children, offset)
        .join("\n\n")
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n");
    case "hr":
      return "---";
    default:
      return blocks(el.children, offset).join("\n\n");
  }
}

/** A tight list; an item's later lines (e.g. a nested list) are indented under its text. */
function list(el: Element, offset: number): string {
  const items = el.children.filter((c): c is Element => typeof c !== "string" && c.tag === "li");
  return items
    .map((li, i) => {
      const marker = el.tag === "ol" ? `${i + 1}. ` : "- ";
      const indent = " ".repeat(marker.length);
      const lines = blocks(li.children, offset).join("\n").split("\n");
      return marker + lines.map((line, j) => (j === 0 || !line ? line : indent + line)).join("\n");
    })
    .join("\n");
}

/** Markdown for sanitized HTML; `headingOffset` pushes headings down (h2 + 2 → `####`, capped at 6). */
export function htmlToMarkdown(html: string, { headingOffset = 0 }: { headingOffset?: number } = {}): string {
  return blocks(parse(html).children, headingOffset)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
