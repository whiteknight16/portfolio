"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { achievementSchema } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { EntityActionResult } from "@/components/admin/entity-table";

export type AchievementFormState = { ok?: boolean; error?: string };

function parseAchievementForm(formData: FormData) {
  return achievementSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    sort_order: formData.get("sort_order"),
  });
}

/** Creates a new achievement. */
export async function createAchievementAction(
  _prevState: AchievementFormState,
  formData: FormData,
): Promise<AchievementFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseAchievementForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("achievements").insert(parsed.data);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  redirect("/admin/achievements");
}

/** Updates an existing achievement. */
export async function updateAchievementAction(
  id: string,
  _prevState: AchievementFormState,
  formData: FormData,
): Promise<AchievementFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseAchievementForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("achievements")
      .update(parsed.data)
      .eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  redirect("/admin/achievements");
}

/** Deletes an achievement by id. */
export async function deleteAchievementAction(id: string): Promise<EntityActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}
