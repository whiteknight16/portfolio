import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
