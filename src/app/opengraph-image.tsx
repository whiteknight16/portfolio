import { ImageResponse } from "next/og";
import {
  ACCENT,
  HEIGHT,
  INK,
  MUTED,
  PAPER,
  RULED_LINES,
  RULE_LINE,
  WIDTH,
} from "@/components/og/note-og-card";
import { brand, siteUrl } from "@/lib/config";
import { handleSlug } from "@/lib/format";
import { urlHost } from "@/lib/note-view";
import { loadOgFonts } from "@/lib/og-fonts";

/**
 * Site-wide default OG/Twitter card in the Field notes style. Pages that set
 * their own `openGraph` metadata reference it explicitly (`defaultOgImages`).
 * Static: no data fetching, rendered once at build time.
 */
export const alt = `${brand.name} (${brand.handle}) — ${brand.headline}`;
export const size = { width: WIDTH, height: HEIGHT };
export const contentType = "image/png";

export default async function Image() {
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
            <div style={{ display: "flex", fontFamily: "IBM Plex Mono", fontSize: 22, letterSpacing: 3, color: ACCENT }}>
              AI ENGINEER &amp; BUILDER
            </div>
            <div style={{ display: "flex", marginTop: 30, fontSize: 72, lineHeight: 1.08, letterSpacing: -1.8 }}>
              {brand.name}
            </div>
            <div style={{ display: "flex", marginTop: 26, fontSize: 30, lineHeight: 1.3, color: MUTED }}>
              I build AI that does the actual work.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              borderTop: `2px solid ${INK}`,
              paddingTop: 22,
              fontFamily: "IBM Plex Mono",
              fontSize: 22,
              color: MUTED,
            }}
          >
            {`@${handleSlug(brand.handle)} · ${urlHost(siteUrl) ?? siteUrl}`}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
