import type { MetadataRoute } from "next";
import { getPublishedPosts, getPublishedProjects } from "@/lib/content";
import { siteUrl } from "@/lib/config";

/**
 * Generated at request time (content.ts fetchers hit Supabase live) and
 * degrades gracefully: `getPublishedProjects`/`getPublishedPosts` already
 * swallow fetch errors and return `[]`, so a briefly-unreachable database
 * yields a sitemap with just the static routes instead of a crash.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    getPublishedProjects(),
    getPublishedPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: project.updated_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
