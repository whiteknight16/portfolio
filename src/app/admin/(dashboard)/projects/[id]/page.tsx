import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { ProjectForm } from "@/components/admin/project-form";

// Reads the live project row on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches a single `projects` row by id, returning `null` on any failure
 * (missing row, or e.g. no live DB in this environment) rather than
 * crashing the page — the caller renders a 404 either way. */
async function getProject(id: string): Promise<Project | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Edit project
        </h1>
        <p className="text-sm text-muted-foreground">
          Update details for &quot;{project.title}&quot;.
        </p>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
