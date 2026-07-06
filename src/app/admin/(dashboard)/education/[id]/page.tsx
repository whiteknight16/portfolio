import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Education } from "@/lib/types";
import { EducationForm } from "@/components/admin/education-form";

// Reads the live education row on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches a single `education` row by id, returning `null` on any failure
 * (missing row, or e.g. no live DB in this environment) rather than
 * crashing the page — the caller renders a 404 either way. */
async function getEducationRow(id: string): Promise<Education | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function EditEducationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const education = await getEducationRow(id);
  if (!education) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Edit education
        </h1>
        <p className="text-sm text-muted-foreground">
          Update details for &quot;{education.degree}&quot; at {education.institution}.
        </p>
      </div>
      <EducationForm education={education} />
    </div>
  );
}
