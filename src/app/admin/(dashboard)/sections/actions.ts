"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export type SectionActionResult = { ok: true } | { error: string };

/** Flips a single section's visibility on the home page. */
export async function toggleSectionAction(
  key: string,
  enabled: boolean,
): Promise<SectionActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("site_sections")
      .update({ enabled })
      .eq("key", key);

    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}

/**
 * Persists a new display order for every section, given its keys in the
 * desired order. Assigns `sort_order` 1..n from array position and writes
 * each row sequentially — there are only a handful of sections, so a batch
 * upsert would add complexity (it requires every not-null column) without
 * meaningfully improving on plain updates.
 */
export async function reorderSectionsAction(
  orderedKeys: string[],
): Promise<SectionActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();

    for (let i = 0; i < orderedKeys.length; i++) {
      const { error } = await supabase
        .from("site_sections")
        .update({ sort_order: i + 1 })
        .eq("key", orderedKeys[i]);

      if (error) return { error: error.message };
    }
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}
