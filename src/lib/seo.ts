/**
 * Pure SEO builders: JSON-LD, RSS and llms.txt. Every function takes the site
 * origin as a parameter so it stays framework-free and unit-testable.
 */

import {
  fillYears,
  formatExperienceYears,
  handleSlug,
  stripEmphasis,
} from "./format.ts";
import type { Post, Profile, Project } from "./types.ts";

const DEFAULT_HANDLE = "Knight Developer";
const SOCIAL_ORDER = ["linkedin", "github", "youtube", "instagram", "twitter", "website"] as const;

const clean = (text: string, years: string | null) => stripEmphasis(fillYears(text, years));
const absolute = (siteUrl: string, url: string) =>
  url.startsWith("/") ? `${siteUrl}${url}` : url;
const noteUrl = (siteUrl: string, slug: string) => `${siteUrl}/notes/${slug}`;

function socialUrls(profile: Profile | null): string[] {
  if (!profile) return [];
  return SOCIAL_ORDER.map((k) => profile.socials[k]).filter((v): v is string => !!v);
}

export function buildPersonJsonLd(args: {
  siteUrl: string;
  profile: Profile | null;
  skills: string[];
  currentCompany: string | null;
  school: string | null;
}): Record<string, unknown> {
  const { siteUrl, profile, skills, currentCompany, school } = args;
  const years = profile ? formatExperienceYears(profile.career_start_date) : null;
  const handle = profile?.handle || DEFAULT_HANDLE;
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: profile?.full_name ?? "Harsh Pandey",
    alternateName: [handle, handleSlug(handle)],
    url: siteUrl,
  };
  if (profile) {
    if (profile.title) ld.jobTitle = clean(profile.title, years);
    if (profile.headline) ld.description = clean(profile.headline, years);
    if (profile.avatar_url) ld.image = absolute(siteUrl, profile.avatar_url);
  }
  ld.sameAs = socialUrls(profile);
  ld.knowsAbout = skills;
  if (currentCompany) ld.worksFor = { "@type": "Organization", name: currentCompany };
  if (school) ld.alumniOf = { "@type": "CollegeOrUniversity", name: school };
  return ld;
}

export function buildWebsiteJsonLd(siteUrl: string, name: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name,
    publisher: { "@id": `${siteUrl}/#person` },
  };
}

export function buildProfilePageJsonLd(siteUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteUrl}/about#profilepage`,
    url: `${siteUrl}/about`,
    mainEntity: { "@id": `${siteUrl}/#person` },
  };
}

export function buildBlogPostingJsonLd(args: {
  siteUrl: string;
  post: Post;
  imageUrl: string;
}): Record<string, unknown> {
  const { siteUrl, post, imageUrl } = args;
  const url = noteUrl(siteUrl, post.slug);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
  };
  if (post.excerpt) ld.description = post.excerpt;
  ld.datePublished = post.published_at ?? post.created_at;
  ld.dateModified = post.updated_at;
  ld.author = { "@id": `${siteUrl}/#person` };
  ld.image = imageUrl;
  if (post.tags.length) ld.keywords = post.tags.join(", ");
  ld.mainEntityOfPage = url;
  if (post.source_url) ld.isBasedOn = post.source_url;
  return ld;
}

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const cdata = (text: string) => `<![CDATA[${text.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

export function buildRssXml(args: {
  siteUrl: string;
  title: string;
  description: string;
  posts: Post[];
}): string {
  const { siteUrl, title, description, posts } = args;
  const items = posts.map((post) => {
    const url = noteUrl(siteUrl, post.slug);
    const date = post.published_at ?? post.created_at;
    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${new Date(date).toUTCString()}</pubDate>`,
      `      <description>${escapeXml(post.excerpt)}</description>`,
      `      <content:encoded>${cdata(post.content)}</content:encoded>`,
      "    </item>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${siteUrl}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <atom:link href="${siteUrl}/notes/rss.xml" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

export function buildLlmsTxt(args: {
  siteUrl: string;
  profile: Profile | null;
  years: string | null;
  posts: Post[];
  projects: Project[];
}): string {
  const { siteUrl, profile, years, posts, projects } = args;
  const name = profile?.full_name ?? "Harsh Pandey";
  const handle = profile?.handle || DEFAULT_HANDLE;
  const blocks: string[] = [`# ${name} (${handle})`];
  if (profile?.headline) blocks.push(`> ${clean(profile.headline, years)}`);
  if (profile?.bio) blocks.push(clean(profile.bio, years));

  const now = profile?.now ?? {};
  const nowLines = (
    [
      ["Building", now.building],
      ["Writing", now.writing],
      ["Learning", now.learning],
    ] as const
  )
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `- ${k}: ${clean(v as string, years)}`);
  if (nowLines.length) blocks.push(["## Now", ...nowLines].join("\n"));

  blocks.push(
    [
      "## Pages",
      `- [About](${siteUrl}/about)`,
      `- [Notes](${siteUrl}/notes)`,
      `- [Projects](${siteUrl}/projects)`,
    ].join("\n"),
  );

  if (posts.length) {
    blocks.push(
      [
        "## Notes",
        ...posts.map((p) => {
          const line = `- [${p.title}](${noteUrl(siteUrl, p.slug)})`;
          return p.excerpt ? `${line}: ${p.excerpt}` : line;
        }),
      ].join("\n"),
    );
  }
  if (projects.length) {
    blocks.push(
      [
        "## Projects",
        ...projects.map((p) => {
          const line = `- [${p.title}](${siteUrl}/projects/${p.slug})`;
          return p.summary ? `${line}: ${p.summary}` : line;
        }),
      ].join("\n"),
    );
  }
  const socials = socialUrls(profile);
  if (socials.length) blocks.push(["## Elsewhere", ...socials.map((u) => `- ${u}`)].join("\n"));

  return blocks.join("\n\n") + "\n";
}

/** JSON for a `<script type="application/ld+json">` tag; `<` is escaped so content can't close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
