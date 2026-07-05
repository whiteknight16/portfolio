import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { readPublicEnv } from "@/lib/env";

/**
 * Returns the current Supabase user only if their email matches the
 * configured admin email. Anyone else (including other authenticated
 * Supabase users) is treated as unauthenticated for admin purposes.
 */
export async function getSessionUser() {
  const { adminEmail } = readPublicEnv();
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && user.email === adminEmail ? user : null;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}
