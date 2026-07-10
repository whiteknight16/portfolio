import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Achievement } from "@/lib/types";
import { AchievementForm } from "@/components/admin/achievement-form";

// Reads the live achievement row on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches a single `achievements` row by id, returning `null` on any failure
 * (missing row, or e.g. no live DB in this environment) rather than
 * crashing the page — the caller renders a 404 either way. */
async function getAchievement(id: string): Promise<Achievement | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const achievement = await getAchievement(id);
  if (!achievement) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Edit achievement
        </h1>
        <p className="text-sm text-muted-foreground">
          Update details for &quot;{achievement.title}&quot;.
        </p>
      </div>
      <AchievementForm achievement={achievement} />
    </div>
  );
}
