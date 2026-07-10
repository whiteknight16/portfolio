"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { projectSchema } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";
import type { EntityActionResult } from "@/components/admin/entity-table";

export type ProjectFormState = { ok?: boolean; error?: string };

type SupabaseServerClient = Awaited<ReturnType<typeof createServerSupabase>>;

/** Builds `projects.links` jsonb from the live/repo sub-fields, omitting any left empty. */
function buildLinks(links: { live?: string; repo?: string }) {
  const result: { live?: string; repo?: string } = {};
  if (links.live) result.live = links.live;
  if (links.repo) result.repo = links.repo;
  return result;
}

/**
 * Finds a slug not used by any other `projects` row, starting from
 * `desiredSlug` and appending `-2`, `-3`, … until one is free. Excludes
 * `excludeId` so editing a project doesn't collide with its own slug.
 */
async function findAvailableSlug(
  supabase: SupabaseServerClient,
  desiredSlug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = desiredSlug;
  let suffix = 2;

  for (;;) {
    let query = supabase.from("projects").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${desiredSlug}-${suffix}`;
    suffix += 1;
  }
}

/** Parses and validates a project form submission, deriving the slug from
 * the title when the slug field was left blank. */
function parseProjectForm(formData: FormData) {
  const rawTitle = String(formData.get("title") ?? "");
  const rawSlug = String(formData.get("slug") ?? "").trim();

  return projectSchema.safeParse({
    title: rawTitle,
    slug: rawSlug || slugify(rawTitle),
    summary: formData.get("summary"),
    content: formData.get("content"),
    cover_image_url: formData.get("cover_image_url"),
    tags: formData.get("tags"),
    links: {
      live: formData.get("links.live"),
      repo: formData.get("links.repo"),
    },
    featured: formData.get("featured") === "on",
    status: formData.get("status"),
    sort_order: formData.get("sort_order"),
  });
}

/**
 * Creates a new project. Slug uniqueness is resolved before insert; when the
 * project is created already published, `published_at` is stamped `now()`.
 */
export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { slug: desiredSlug, links, content, status, ...rest } = parsed.data;

  try {
    const supabase = await createServerSupabase();
    const slug = await findAvailableSlug(supabase, desiredSlug);

    const { error } = await supabase.from("projects").insert({
      ...rest,
      slug,
      links: buildLinks(links),
      content: sanitizeHtml(content),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    });

    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/projects");
  redirect("/admin/projects");
}

/**
 * Updates an existing project. Slug uniqueness excludes the project's own
 * row. `published_at` is stamped `now()` only the first time a project
 * transitions to "published" — otherwise the existing value (including
 * `null` for a still-unpublished draft) is preserved.
 */
export async function updateProjectAction(
  id: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { slug: desiredSlug, links, content, status, ...rest } = parsed.data;
  let slug = desiredSlug;

  try {
    const supabase = await createServerSupabase();
    slug = await findAvailableSlug(supabase, desiredSlug, id);

    const { data: existing } = await supabase
      .from("projects")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();

    const publishedAt =
      status === "published"
        ? (existing?.published_at ?? new Date().toISOString())
        : (existing?.published_at ?? null);

    const { error } = await supabase
      .from("projects")
      .update({
        ...rest,
        slug,
        links: buildLinks(links),
        content: sanitizeHtml(content),
        status,
        published_at: publishedAt,
      })
      .eq("id", id);

    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  redirect("/admin/projects");
}

/** Deletes a project by id. */
export async function deleteProjectAction(id: string): Promise<EntityActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/projects");
  return { ok: true };
}
