import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type OgFont = { name: string; data: Buffer; weight: 400; style: "normal" };

const FONT_DIR = join(process.cwd(), "src/assets/fonts");

/**
 * Fraunces and IBM Plex Mono (regular, Latin) for `ImageResponse` cards.
 * WOFF, not WOFF2: Satori can't read WOFF2. Read from disk at request time
 * (`process.cwd()` is the project root), so the fonts never count towards
 * the route bundle.
 */
export async function loadOgFonts(): Promise<OgFont[]> {
  const [fraunces, plexMono] = await Promise.all([
    readFile(join(FONT_DIR, "fraunces-latin-400-normal.woff")),
    readFile(join(FONT_DIR, "ibm-plex-mono-latin-400-normal.woff")),
  ]);
  return [
    { name: "Fraunces", data: fraunces, weight: 400, style: "normal" },
    { name: "IBM Plex Mono", data: plexMono, weight: 400, style: "normal" },
  ];
}
