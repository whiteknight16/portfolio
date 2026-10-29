import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

/**
 * AI crawlers are welcome, by name: the site is meant to be found, read and
 * quoted by AI search and assistants (training, search and on-demand fetches).
 */
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
      { userAgent: AI_BOTS, allow: "/", disallow: "/admin" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
