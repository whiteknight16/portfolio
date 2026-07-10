import { ImageResponse } from "next/og";
import { brand } from "@/lib/config";

/**
 * Site-wide default OG/Twitter card. Colocated at the app root so it applies
 * to every route that doesn't define a more specific `opengraph-image` —
 * Next.js auto-injects the `og:image`/`twitter:image` tags, no manual wiring
 * needed in `layout.tsx`'s `metadata`. Kept deliberately simple (no remote
 * fonts, no data fetching) so it stays statically generated at build time.
 */
export const alt = `${brand.name} — portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "#141518",
          color: "#ffffff",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 22,
            border: "3px solid rgba(255,255,255,0.14)",
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: -1,
            marginBottom: 48,
          }}
        >
          {brand.initials}
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 700, letterSpacing: -2 }}>
          {brand.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 32,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {brand.headline}
        </div>
      </div>
    ),
    { ...size },
  );
}
