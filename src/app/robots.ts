import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

/** AI crawlers are welcome: the site is meant to be found and quoted. */
const AI_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
      { userAgent: AI_BOTS, allow: "/", disallow: "/admin" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
