"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { EntityActionResult } from "@/components/admin/entity-table";
import type { Subscriber } from "@/lib/types";

/** Permanently removes a subscriber. */
export async function deleteSubscriberAction(id: string): Promise<EntityActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("subscribers").delete().eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/admin/subscribers");
  return { ok: true };
}

/** Marks a subscriber active or unsubscribed. */
export async function setSubscriberStatusAction(
  id: string,
  status: Subscriber["status"],
): Promise<EntityActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authorized." };
  if (status !== "active" && status !== "unsubscribed") return { error: "Invalid status." };

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("subscribers").update({ status }).eq("id", id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Could not reach the database. Please try again." };
  }

  revalidatePath("/admin/subscribers");
  return { ok: true };
}
