"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { skillSchema } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { EntityActionResult } from "@/components/admin/entity-table";

export type SkillFormState = { ok?: boolean; error?: string };

function parseSkillForm(formData: FormData) {
  return skillSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    sort_order: formData.get("sort_order"),
  });
}

/** Creates a new skill. */
export async function createSkillAction(
  _prevState: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseSkillForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("skills").insert(parsed.data);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  redirect("/admin/skills");
}

/** Updates an existing skill. */
export async function updateSkillAction(
  id: string,
  _prevState: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseSkillForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("skills").update(parsed.data).eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  redirect("/admin/skills");
}

/** Deletes a skill by id. */
export async function deleteSkillAction(id: string): Promise<EntityActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}
