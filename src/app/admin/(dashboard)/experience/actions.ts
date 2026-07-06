"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { experienceSchema } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { EntityActionResult } from "@/components/admin/entity-table";

export type ExperienceFormState = { ok?: boolean; error?: string };

/** Parses and validates an experience form submission. `highlights` arrives
 * as a textarea (one bullet per line) and is split into an array before
 * validation so the schema's `text[]` handling receives it pre-split. */
function parseExperienceForm(formData: FormData) {
  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return experienceSchema.safeParse({
    role: formData.get("role"),
    company: formData.get("company"),
    location: formData.get("location"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    is_current: formData.get("is_current") === "on",
    highlights,
    sort_order: formData.get("sort_order"),
  });
}

/** Creates a new experience entry. */
export async function createExperienceAction(
  _prevState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseExperienceForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("experiences").insert(parsed.data);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  redirect("/admin/experience");
}

/** Updates an existing experience entry. */
export async function updateExperienceAction(
  id: string,
  _prevState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseExperienceForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("experiences")
      .update(parsed.data)
      .eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  redirect("/admin/experience");
}

/** Deletes an experience entry by id. */
export async function deleteExperienceAction(id: string): Promise<EntityActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}
