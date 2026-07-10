import { ImageResponse } from "next/og";
import { brand } from "@/lib/config";

/**
 * Apple touch icon — same mark as `icon.svg` (dark rounded square + "HP"),
 * regenerated via `ImageResponse` because Apple only accepts jpg/jpeg/png
 * for this convention, not svg.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141518",
          color: "#ffffff",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 82,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        {brand.initials}
      </div>
    ),
    { ...size },
  );
}
