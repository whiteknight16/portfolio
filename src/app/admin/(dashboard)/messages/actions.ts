"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { EntityActionResult } from "@/components/admin/entity-table";

/** Toggles a contact message's read state. */
export async function markMessageReadAction(
  id: string,
  isRead: boolean,
): Promise<EntityActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: isRead })
      .eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true };
}
