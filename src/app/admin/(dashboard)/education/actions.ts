"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { educationSchema } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { EntityActionResult } from "@/components/admin/entity-table";

export type EducationFormState = { ok?: boolean; error?: string };

function parseEducationForm(formData: FormData) {
  return educationSchema.safeParse({
    degree: formData.get("degree"),
    institution: formData.get("institution"),
    location: formData.get("location"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    description: formData.get("description"),
    sort_order: formData.get("sort_order"),
  });
}

/** Creates a new education entry. */
export async function createEducationAction(
  _prevState: EducationFormState,
  formData: FormData,
): Promise<EducationFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseEducationForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("education").insert(parsed.data);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  redirect("/admin/education");
}

/** Updates an existing education entry. */
export async function updateEducationAction(
  id: string,
  _prevState: EducationFormState,
  formData: FormData,
): Promise<EducationFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  const parsed = parseEducationForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("education")
      .update(parsed.data)
      .eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  redirect("/admin/education");
}

/** Deletes an education entry by id. */
export async function deleteEducationAction(id: string): Promise<EntityActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("education").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}
