// Regenerate every favicon / app-icon asset from scripts/icon-source.svg:
//
//   node scripts/generate-icons.mjs
//
// Writes src/app/icon.svg, src/app/favicon.ico (16, 32, 48 px),
// src/app/apple-icon.png (180 px) and public/icons/icon-{192,512}.png +
// icon-maskable-512.png. Dev-only: needs the `@resvg/resvg-js` devDependency.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAPER = "#f3eee4";

const source = readFileSync(join(root, "scripts/icon-source.svg"), "utf8");
const mark = source.match(/<g id="mark">[\s\S]*?<\/g>/)?.[0];
if (!mark) throw new Error('scripts/icon-source.svg needs a <g id="mark"> group');

/** The source without its comment and indentation: what browsers get as /icon.svg. */
const iconSvg =
  source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .trim() + "\n";

/**
 * A full-bleed paper square with the mark scaled about the centre. For icons
 * the platform masks itself (iOS home screen, Android adaptive icons), so no
 * rounded corners, transparency or border.
 */
const fullBleed = (scale) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<rect width="64" height="64" fill="${PAPER}"/>` +
  `<g transform="translate(32 32) scale(${scale}) translate(-32 -32)">${mark}</g></svg>`;

const png = (svg, size) => new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();

/** A .ico holding one PNG-compressed image per size (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, entry); // width
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1); // height
    header.writeUInt8(0, entry + 2); // palette size
    header.writeUInt8(0, entry + 3); // reserved
    header.writeUInt16LE(1, entry + 4); // colour planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

function write(path, data) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, data);
  console.log(`wrote ${path} (${data.length} bytes)`);
}

write("src/app/icon.svg", iconSvg);
write("src/app/favicon.ico", ico([16, 32, 48].map((size) => ({ size, data: png(source, size) }))));
// iOS rounds the corners itself; 0.8 leaves comfortable padding round the mark.
write("src/app/apple-icon.png", png(fullBleed(0.8), 180));
write("public/icons/icon-192.png", png(source, 192));
write("public/icons/icon-512.png", png(source, 512));
// Maskable: everything inside the central 80% circle (radius 25.6 of 64); at
// 0.72 the farthest point, the dot's edge, sits about 22 units from the centre.
write("public/icons/icon-maskable-512.png", png(fullBleed(0.72), 512));
