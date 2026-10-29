import type { NextConfig } from "next";
import { supabaseStoragePattern } from "./src/lib/images.ts";

const storagePattern = supabaseStoragePattern(process.env.NEXT_PUBLIC_SUPABASE_URL);

const nextConfig: NextConfig = {
  // next/image may resize uploaded avatars/covers from this project's public
  // Supabase Storage; other remote URLs render `unoptimized` (see src/lib/images.ts).
  images: {
    remotePatterns: storagePattern ? [storagePattern] : [],
  },
  // The OG cards read their fonts from disk via process.cwd(); make sure those
  // files are traced into the deployed serverless functions.
  outputFileTracingIncludes: {
    "/notes/\\[slug\\]/og": ["./src/assets/fonts/**/*"],
    "/opengraph-image": ["./src/assets/fonts/**/*"],
  },
  // The blog was renamed to Notes; keep old shared links working (308).
  async redirects() {
    return [
      { source: "/blog", destination: "/notes", permanent: true },
      { source: "/blog/:slug", destination: "/notes/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
