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

/** Fetches published projects, ordered by `sort_order` then `created_at`. */
export async function getPublishedProjects(): Promise<Project[]> {
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
}

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

/** Fetches all experiences, ordered by `sort_order`. */
export async function getExperiences(): Promise<Experience[]> {
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
}

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

/** Fetches all skills ordered by `sort_order`, grouped by category. */
export async function getSkillsByCategory(): Promise<
  { category: string; items: Skill[] }[]
> {
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
}

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

/** Fetches all education entries, ordered by `sort_order`. */
export async function getEducation(): Promise<Education[]> {
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
}

/** Fetches published posts, ordered by `published_at` descending. */
export async function getPublishedPosts(): Promise<Post[]> {
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
}

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
