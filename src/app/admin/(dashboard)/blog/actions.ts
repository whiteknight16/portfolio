"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { postSchema } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { slugify, readingMinutes } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";
import type { EntityActionResult } from "@/components/admin/entity-table";

export type PostFormState = { ok?: boolean; error?: string };

type SupabaseServerClient = Awaited<ReturnType<typeof createServerSupabase>>;

/**
 * Finds a slug not used by any other `posts` row, starting from
 * `desiredSlug` and appending `-2`, `-3`, … until one is free. Excludes
 * `excludeId` so editing a post doesn't collide with its own slug.
 */
async function findAvailableSlug(
  supabase: SupabaseServerClient,
  desiredSlug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = desiredSlug;
  let suffix = 2;

  for (;;) {
    let query = supabase.from("posts").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${desiredSlug}-${suffix}`;
    suffix += 1;
  }
}

/** Parses and validates a post form submission, deriving the slug from
 * the title when the slug field was left blank. */
function parsePostForm(formData: FormData) {
  const rawTitle = String(formData.get("title") ?? "");
  const rawSlug = String(formData.get("slug") ?? "").trim();

  return postSchema.safeParse({
    title: rawTitle,
    slug: rawSlug || slugify(rawTitle),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    cover_image_url: formData.get("cover_image_url"),
    tags: formData.get("tags"),
    status: formData.get("status"),
  });
}

/**
 * Creates a new post. Slug uniqueness is resolved before insert; when the
 * post is created already published, `published_at` is stamped `now()`.
 */
export async function createPostAction(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parsePostForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { slug: desiredSlug, content, status, ...rest } = parsed.data;

  try {
    const supabase = await createServerSupabase();
    const slug = await findAvailableSlug(supabase, desiredSlug);
    const sanitizedContent = sanitizeHtml(content);

    const { error } = await supabase.from("posts").insert({
      ...rest,
      slug,
      content: sanitizedContent,
      reading_minutes: readingMinutes(sanitizedContent),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    });

    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

/**
 * Updates an existing post. Slug uniqueness excludes the post's own row.
 * `published_at` is stamped `now()` only the first time a post transitions
 * to "published" — otherwise the existing value (including `null` for a
 * still-unpublished draft) is preserved.
 */
export async function updatePostAction(
  id: string,
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parsePostForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { slug: desiredSlug, content, status, ...rest } = parsed.data;
  let slug = desiredSlug;

  try {
    const supabase = await createServerSupabase();
    slug = await findAvailableSlug(supabase, desiredSlug, id);

    const { data: existing } = await supabase
      .from("posts")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();

    const publishedAt =
      status === "published"
        ? (existing?.published_at ?? new Date().toISOString())
        : (existing?.published_at ?? null);

    const sanitizedContent = sanitizeHtml(content);

    const { error } = await supabase
      .from("posts")
      .update({
        ...rest,
        slug,
        content: sanitizedContent,
        reading_minutes: readingMinutes(sanitizedContent),
        status,
        published_at: publishedAt,
      })
      .eq("id", id);

    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

/** Deletes a post by id. */
export async function deletePostAction(id: string): Promise<EntityActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  return { ok: true };
}
