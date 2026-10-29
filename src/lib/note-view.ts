/**
 * Pure view helpers for a note page and its generated Open Graph card.
 */

import type { Metadata } from "next";
import { brand, openGraphBase, rssAlternateTypes } from "./config.ts";
import { fillYears, formatExperienceYears, formatNoteDate, stripEmphasis } from "./format.ts";
import type { Post, Profile } from "./types.ts";

const MAX_TLDR = 3;
const OG_TITLE_LONG = 70;
const FALLBACK_AVATAR = "/profile.png";
const DAY_MS = 24 * 60 * 60 * 1000;

/** The URL, trimmed, when it is an absolute http(s) URL; `null` otherwise (so `javascript:` never becomes a link). */
export function safeHttpUrl(url: string | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  try {
    const { protocol } = new URL(trimmed);
    return protocol === "http:" || protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

/** Hostname without a leading `www.` ("youtube.com"), or `null` when unparseable. */
export function urlHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export type SourceCardView = {
  url: string;
  /** "Notes on · video", or just "Notes on" when the kind is `other`/unset. */
  label: string;
  /** The source title, falling back to the URL's host. */
  title: string;
  /** The host, shown under a real title; `null` when the title already is the host. */
  host: string | null;
  action: "watch ↗" | "listen ↗" | "read ↗";
};

/** The "Notes on" source card for a note, or `null` when it has no usable source URL. */
export function sourceCard(
  post: Pick<Post, "source_url" | "source_title" | "source_kind">,
): SourceCardView | null {
  const url = safeHttpUrl(post.source_url);
  if (!url) return null;
  const kind = post.source_kind;
  const host = urlHost(url);
  const title = post.source_title?.trim();
  return {
    url,
    label: kind && kind !== "other" ? `Notes on · ${kind}` : "Notes on",
    title: title || host || url,
    host: title ? host : null,
    action: kind === "video" ? "watch ↗" : kind === "podcast" ? "listen ↗" : "read ↗",
  };
}

/** "The short version" bullets: trimmed, non-blank, at most three (none when the pre-0006 `tldr` column is missing). */
export function tldrLines(tldr: string[] | null | undefined): string[] {
  return (tldr ?? [])
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_TLDR);
}

/** The fields a `NoteRow` renders: what a client component is sent instead of the whole row. */
export type NoteRowData = Pick<
  Post,
  "id" | "slug" | "title" | "excerpt" | "published_at" | "reading_minutes" | "source_title" | "tags"
>;

/** A note trimmed to `NoteRowData` (no body HTML). */
export function noteRowData(post: Post): NoteRowData {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    published_at: post.published_at,
    reading_minutes: post.reading_minutes,
    source_title: post.source_title ?? null,
    tags: post.tags,
  };
}

/**
 * "Oct 22, 2026" when the note was last edited more than a day after it was
 * published (so a same-day typo fix doesn't count); `null` otherwise.
 */
export function noteUpdatedDate(post: Pick<Post, "published_at" | "updated_at">): string | null {
  if (!post.published_at) return null;
  const edited = Date.parse(post.updated_at) - Date.parse(post.published_at);
  return edited > DAY_MS ? formatNoteDate(post.updated_at) : null;
}

/** OG card title size in px: 64, or 52 for titles over 70 characters. */
export function ogTitleSize(title: string): 64 | 52 {
  return title.length > OG_TITLE_LONG ? 52 : 64;
}

/** The note's share image: its cover when set, otherwise its generated `/og` card. */
export function noteImageUrl(
  siteUrl: string,
  post: Pick<Post, "slug" | "cover_image_url">,
): string {
  return post.cover_image_url || `${siteUrl}/notes/${post.slug}/og`;
}

export type NoteAuthor = {
  name: string;
  handle: string;
  /** One-line title, `{years}` filled, emphasis and any trailing period removed. */
  title: string;
  avatarUrl: string;
};

/** The author line under a note, from the profile with brand fallbacks for blank fields. */
export function noteAuthor(profile: Profile | null, now: Date = new Date()): NoteAuthor {
  const years = formatExperienceYears(profile?.career_start_date ?? null, now);
  const title = stripEmphasis(fillYears(profile?.title || brand.headline, years))
    .trim()
    .replace(/\.+$/, "");
  return {
    name: profile?.full_name || brand.name,
    handle: profile?.handle || brand.handle,
    title,
    avatarUrl: profile?.avatar_url || FALLBACK_AVATAR,
  };
}

/**
 * A note page's metadata: "{title} — {name}", the excerpt as description
 * (left out when blank), canonical `/notes/{slug}` (plus the RSS feed link,
 * which a page-level `alternates` would otherwise drop), an article Open Graph
 * entry (shared site name/locale, published and modified times) whose image
 * is the cover or the generated card, and a large Twitter card. Relative URLs resolve against the root layout's `metadataBase`.
 */
export function noteMetadata(post: Post, site: { siteUrl: string; name: string }): Metadata {
  const title = `${post.title} — ${site.name}`;
  const description = post.excerpt.trim() || undefined;
  const image = noteImageUrl(site.siteUrl, post);
  const path = `/notes/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path, types: rssAlternateTypes },
    openGraph: {
      ...openGraphBase,
      type: "article",
      title,
      description,
      url: path,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      tags: post.tags.length ? post.tags : undefined,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
