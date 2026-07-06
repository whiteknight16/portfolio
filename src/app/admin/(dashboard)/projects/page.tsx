import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityTable, type EntityTableColumn } from "@/components/admin/entity-table";
import { deleteProjectAction } from "@/app/admin/(dashboard)/projects/actions";

// Reads the live project list on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches all `projects` rows ordered by `sort_order`, degrading to `[]`
 * on any failure (e.g. no live DB in this environment) rather than
 * crashing the page. */
async function getProjects(): Promise<Project[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: EntityTableColumn<Project>[] = [
  {
    header: "Title",
    cell: (project) => (
      <span className="font-medium text-foreground">{project.title}</span>
    ),
  },
  {
    header: "Status",
    cell: (project) => (
      <Badge variant={project.status === "published" ? "default" : "outline"}>
        {project.status === "published" ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    header: "Featured",
    className: "text-center",
    cell: (project) => (project.featured ? "✓" : null),
  },
];

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the projects shown in your portfolio.
          </p>
        </div>
        <Button render={<Link href="/admin/projects/new" />}>
          New project
        </Button>
      </div>
      <EntityTable
        columns={columns}
        rows={projects}
        editHref={(project) => `/admin/projects/${project.id}`}
        onDelete={deleteProjectAction}
        describeRow={(project) => project.title}
        emptyMessage="No projects yet. Create your first one to get started."
      />
    </div>
  );
}
