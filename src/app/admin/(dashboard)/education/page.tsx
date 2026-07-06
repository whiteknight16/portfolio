import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Education } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EntityTable, type EntityTableColumn } from "@/components/admin/entity-table";
import { deleteEducationAction } from "@/app/admin/(dashboard)/education/actions";

// Reads the live education list on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches all `education` rows ordered by `sort_order`, degrading to `[]`
 * on any failure (e.g. no live DB in this environment) rather than
 * crashing the page. */
async function getEducation(): Promise<Education[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: EntityTableColumn<Education>[] = [
  {
    header: "Degree",
    cell: (education) => (
      <span className="font-medium text-foreground">{education.degree}</span>
    ),
  },
  {
    header: "Institution",
    cell: (education) => education.institution,
  },
  {
    header: "Dates",
    cell: (education) =>
      [education.start_date, education.end_date].filter(Boolean).join(" – "),
  },
];

export default async function AdminEducationPage() {
  const education = await getEducation();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Education
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the education history shown in your portfolio.
          </p>
        </div>
        <Button render={<Link href="/admin/education/new" />}>
          New education
        </Button>
      </div>
      <EntityTable
        columns={columns}
        rows={education}
        editHref={(item) => `/admin/education/${item.id}`}
        onDelete={deleteEducationAction}
        describeRow={(item) => `${item.degree} at ${item.institution}`}
        emptyMessage="No education entries yet. Create your first one to get started."
      />
    </div>
  );
}
