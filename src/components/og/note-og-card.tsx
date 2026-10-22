import { ImageResponse } from "next/og";
import { ogTitleSize } from "@/lib/note-view";
import { loadOgFonts } from "@/lib/og-fonts";

const WIDTH = 1200;
const HEIGHT = 630;
const PAPER = "#f3eee4";
const RULE_LINE = "#e6dfd0";
const INK = "#1d1a16";
const MUTED = "#5d564c";
const ACCENT = "#b53c0b";
const RULED_LINES = Array.from({ length: Math.ceil(HEIGHT / 30) }, (_, i) => i * 30);

export type NoteOgValues = {
  title: string;
  /** Publish date as "Oct 9, 2026", or `null` to show just "NOTE". */
  date: string | null;
  name: string;
  /** Handle slug without the "@" ("knightdeveloper"). */
  handle: string;
  /** Site host shown bottom right ("knightdeveloper.com"). */
  host: string;
};

/**
 * A note's 1200×630 Open Graph card in the Field notes style: ruled paper,
 * an accent bar down the left edge, a mono "NOTE · date" kicker, the title
 * in Fraunces (clamped to three lines) and a name / site footer.
 */
export async function renderNoteOgCard({ title, date, name, handle, host }: NoteOgValues) {
  const kicker = (date ? `Note · ${date}` : "Note").toUpperCase();
  const fontSize = ogTitleSize(title);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: PAPER,
          color: INK,
          fontFamily: "Fraunces",
        }}
      >
        {RULED_LINES.map((top) => (
          <div
            key={top}
            style={{ position: "absolute", left: 0, right: 0, top, height: 1, background: RULE_LINE }}
          />
        ))}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: ACCENT }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "76px 84px 58px 90px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "IBM Plex Mono", fontSize: 22, letterSpacing: 3, color: ACCENT }}>
              {kicker}
            </div>
            <div
              style={{
                display: "block",
                marginTop: 30,
                fontSize,
                lineHeight: 1.08,
                letterSpacing: fontSize === 64 ? -1.6 : -1.2,
                lineClamp: 3,
              }}
            >
              {title}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `2px solid ${INK}`,
              paddingTop: 22,
              fontFamily: "IBM Plex Mono",
              fontSize: 22,
              color: MUTED,
            }}
          >
            <div>{`${name} · @${handle}`}</div>
            <div>{host}</div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: await loadOgFonts() },
  );
}
