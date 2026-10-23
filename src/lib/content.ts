import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import type {
  Achievement,
  Education,
  Experience,
  Post,
  Profile,
  Project,
  SiteSection,
  Skill,
} from "@/lib/types";

/**
 * Public content data-fetch layer.
 *
 * Every fetcher opens a fresh server-bound Supabase client, relies on RLS to
 * scope anonymous reads to published/enabled rows, and degrades to a sensible
 * empty (`null` or `[]`) on any failure — public pages must never crash just
 * because the database is briefly unreachable.
 */

/** Fetches the singleton profile row. Cached per-request to dedupe reads. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("singleton", true)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
});

/** Fetches enabled site sections, ordered by `sort_order`. */
export async function getEnabledSections(): Promise<SiteSection[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("site_sections")
      .select("*")
      .eq("enabled", true)
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Fetches published projects, ordered by `sort_order` then `created_at`. Cached per-request. */
export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
});

/**
 * Fetches published projects for the home-page preview: featured first,
 * newest first within each group, limited to `limit` rows.
 */
export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Fetches a single published project by slug. */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetches all experiences, ordered by `sort_order`. Cached per-request: the
 * (site) layout (via `getCurrentExperience`) and the page both read it.
 */
export const getExperiences = cache(async (): Promise<Experience[]> => {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
});

/**
 * Groups skills into categories, preserving the first-seen category order
 * from the input list. Pure and unit-testable in isolation from Supabase.
 */
export function groupByCategory(
  skills: Skill[],
): { category: string; items: Skill[] }[] {
  const groups: { category: string; items: Skill[] }[] = [];
  const indexByCategory = new Map<string, number>();

  for (const skill of skills) {
    const existingIndex = indexByCategory.get(skill.category);
    if (existingIndex === undefined) {
      indexByCategory.set(skill.category, groups.length);
      groups.push({ category: skill.category, items: [skill] });
    } else {
      groups[existingIndex].items.push(skill);
    }
  }

  return groups;
}

/**
 * Fetches all skills ordered by `sort_order`, grouped by category. Cached
 * per-request: the (site) layout and the About page both read it.
 */
export const getSkillsByCategory = cache(async (): Promise<
  { category: string; items: Skill[] }[]
> => {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return groupByCategory(data ?? []);
  } catch {
    return [];
  }
});

/** Fetches all achievements, ordered by `sort_order`. */
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetches all education entries, ordered by `sort_order`. Cached per-request:
 * the (site) layout and the About page both read it.
 */
export const getEducation = cache(async (): Promise<Education[]> => {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
});

/** Fetches published posts, ordered by `published_at` descending. Cached per-request. */
export const getPublishedPosts = cache(async (): Promise<Post[]> => {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
});

/** Fetches a single published post by slug. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Fetches the most recent published posts, newest first. */
export async function getLatestPosts(limit = 5): Promise<Post[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Neighbouring published posts by `published_at`: `previous` is the next-older
 * post, `next` the next-newer one. Either is null at the ends or on failure.
 */
export async function getAdjacentPosts(
  post: Post,
): Promise<{ previous: Post | null; next: Post | null }> {
  if (!post.published_at) return { previous: null, next: null };
  try {
    const supabase = await createServerSupabase();
    const [older, newer] = await Promise.all([
      supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .lt("published_at", post.published_at)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .gt("published_at", post.published_at)
        .order("published_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    return {
      previous: older.error ? null : older.data,
      next: newer.error ? null : newer.data,
    };
  } catch {
    return { previous: null, next: null };
  }
}

/** The current (first `is_current`) experience, or null. */
export async function getCurrentExperience(): Promise<Experience | null> {
  const experiences = await getExperiences();
  return experiences.find((e) => e.is_current) ?? null;
}
