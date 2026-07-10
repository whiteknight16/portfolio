import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Experience } from "@/lib/types";
import { ExperienceForm } from "@/components/admin/experience-form";

// Reads the live experience row on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches a single `experiences` row by id, returning `null` on any failure
 * (missing row, or e.g. no live DB in this environment) rather than
 * crashing the page — the caller renders a 404 either way. */
async function getExperience(id: string): Promise<Experience | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experience = await getExperience(id);
  if (!experience) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Edit experience
        </h1>
        <p className="text-sm text-muted-foreground">
          Update details for &quot;{experience.role}&quot; at {experience.company}.
        </p>
      </div>
      <ExperienceForm experience={experience} />
    </div>
  );
}
