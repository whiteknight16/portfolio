/**
 * Row types mirroring `supabase/migrations/0001_schema.sql` column-for-column.
 * Nullable columns (no `not null`) are typed `T | null`; columns with a
 * `not null default` are required, non-optional fields.
 */

export interface Profile {
  id: string;
  full_name: string;
  title: string;
  headline: string;
  bio: string;
  avatar_url: string | null;
  resume_url: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  handle: string | null;
  tagline: string;
  career_start_date: string | null;
  now: NowCard;
  now_updated_at: string | null;
  highlights: Highlight[];
  singleton: boolean;
  updated_at: string;
}

/** The "now" card: what Harsh is building, writing and learning. */
export type NowCard = { building?: string; writing?: string; learning?: string };

/** A proof-strip stat, e.g. `{ value: "3", label: "products shipped" }`. */
export type Highlight = { value: string; label: string };

export interface SiteSection {
  id: string;
  key: "projects" | "blog" | "newsletter" | "experience";
  label: string;
  enabled: boolean;
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  links: {
    live?: string;
    repo?: string;
  };
  label: string | null;
  featured: boolean;
  status: "draft" | "published";
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  highlights: string[];
  tags: string[];
  sort_order: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  sort_order: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string;
  sort_order: number;
}

export type SourceKind = "video" | "article" | "paper" | "course" | "book" | "podcast" | "other";

export const SOURCE_KINDS: SourceKind[] = ["video", "article", "paper", "course", "book", "podcast", "other"];

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  source_title: string | null;
  source_url: string | null;
  source_kind: SourceKind | null;
  tldr: string[];
  status: "draft" | "published";
  reading_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  source: string | null;
  created_at: string;
}
