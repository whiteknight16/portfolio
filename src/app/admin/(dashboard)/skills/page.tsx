import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EntityTable, type EntityTableColumn } from "@/components/admin/entity-table";
import { deleteSkillAction } from "@/app/admin/(dashboard)/skills/actions";

// Reads the live skills list on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches all `skills` rows ordered by `sort_order`, degrading to `[]`
 * on any failure (e.g. no live DB in this environment) rather than
 * crashing the page. */
async function getSkills(): Promise<Skill[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: EntityTableColumn<Skill>[] = [
  {
    header: "Name",
    cell: (skill) => (
      <span className="font-medium text-foreground">{skill.name}</span>
    ),
  },
  {
    header: "Category",
    cell: (skill) => skill.category,
  },
  {
    header: "Sort order",
    className: "text-center",
    cell: (skill) => skill.sort_order,
  },
];

export default async function AdminSkillsPage() {
  const skills = await getSkills();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Skills
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the skills shown in your portfolio.
          </p>
        </div>
        <Button render={<Link href="/admin/skills/new" />}>New skill</Button>
      </div>
      <EntityTable
        columns={columns}
        rows={skills}
        editHref={(skill) => `/admin/skills/${skill.id}`}
        onDelete={deleteSkillAction}
        describeRow={(skill) => skill.name}
        emptyMessage="No skills yet. Create your first one to get started."
      />
    </div>
  );
}
