import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Experience } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EntityTable, type EntityTableColumn } from "@/components/admin/entity-table";
import { deleteExperienceAction } from "@/app/admin/(dashboard)/experience/actions";

// Reads the live experience list on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches all `experiences` rows ordered by `sort_order`, degrading to `[]`
 * on any failure (e.g. no live DB in this environment) rather than
 * crashing the page. */
async function getExperiences(): Promise<Experience[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: EntityTableColumn<Experience>[] = [
  {
    header: "Role",
    cell: (experience) => (
      <span className="font-medium text-foreground">{experience.role}</span>
    ),
  },
  {
    header: "Company",
    cell: (experience) => experience.company,
  },
  {
    header: "Dates",
    cell: (experience) =>
      `${experience.start_date} – ${experience.is_current ? "Present" : (experience.end_date ?? "")}`,
  },
];

export default async function AdminExperiencePage() {
  const experiences = await getExperiences();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Experience
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the work history shown in your portfolio.
          </p>
        </div>
        <Button render={<Link href="/admin/experience/new" />}>
          New experience
        </Button>
      </div>
      <EntityTable
        columns={columns}
        rows={experiences}
        editHref={(experience) => `/admin/experience/${experience.id}`}
        onDelete={deleteExperienceAction}
        describeRow={(experience) => `${experience.role} at ${experience.company}`}
        emptyMessage="No experience entries yet. Create your first one to get started."
      />
    </div>
  );
}
