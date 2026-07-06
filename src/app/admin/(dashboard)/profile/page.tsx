import { createServerSupabase } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { ProfileForm } from "@/components/admin/profile-form";

// Reads the live profile row on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches the singleton profile row, degrading to `null` on any failure
 * (e.g. no live DB in this environment) rather than crashing the page. */
async function getProfile(): Promise<Profile | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("singleton", true)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function AdminProfilePage() {
  const profile = await getProfile();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          This information powers the hero, contact card, and resume link on
          the public site.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
