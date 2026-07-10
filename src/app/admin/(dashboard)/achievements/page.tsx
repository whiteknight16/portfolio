import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Achievement } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EntityTable, type EntityTableColumn } from "@/components/admin/entity-table";
import { deleteAchievementAction } from "@/app/admin/(dashboard)/achievements/actions";

// Reads the live achievements list on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches all `achievements` rows ordered by `sort_order`, degrading to `[]`
 * on any failure (e.g. no live DB in this environment) rather than
 * crashing the page. */
async function getAchievements(): Promise<Achievement[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: EntityTableColumn<Achievement>[] = [
  {
    header: "Title",
    cell: (achievement) => (
      <span className="font-medium text-foreground">{achievement.title}</span>
    ),
  },
  {
    header: "Description",
    cell: (achievement) => (
      <span className="line-clamp-1 text-muted-foreground">
        {achievement.description}
      </span>
    ),
  },
];

export default async function AdminAchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Achievements
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the achievements shown in your portfolio.
          </p>
        </div>
        <Button render={<Link href="/admin/achievements/new" />}>
          New achievement
        </Button>
      </div>
      <EntityTable
        columns={columns}
        rows={achievements}
        editHref={(achievement) => `/admin/achievements/${achievement.id}`}
        onDelete={deleteAchievementAction}
        describeRow={(achievement) => achievement.title}
        emptyMessage="No achievements yet. Create your first one to get started."
      />
    </div>
  );
}
