"use server";

import { revalidatePath } from "next/cache";
import { profileSchema } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase/server";

export type ProfileFormState = {
  ok?: boolean;
  error?: string;
};

/**
 * Validates and persists the singleton `profile` row.
 *
 * Uses `upsert` on the `singleton` unique column so this both updates the
 * existing row and creates one if it's somehow missing (e.g. a fresh
 * environment before the seed has run), in a single round trip.
 */
export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    title: formData.get("title"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    avatar_url: formData.get("avatar_url"),
    resume_url: formData.get("resume_url"),
    location: formData.get("location"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    socials: {
      github: formData.get("socials.github"),
      linkedin: formData.get("socials.linkedin"),
      twitter: formData.get("socials.twitter"),
      website: formData.get("socials.website"),
    },
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("profile")
      .upsert({ ...parsed.data, singleton: true }, { onConflict: "singleton" });

    if (error) {
      return { error: error.message };
    }
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/");
  return { ok: true };
}
