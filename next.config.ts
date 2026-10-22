import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The blog was renamed to Notes; keep old shared links working (308).
  async redirects() {
    return [
      { source: "/blog", destination: "/notes", permanent: true },
      { source: "/blog/:slug", destination: "/notes/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
