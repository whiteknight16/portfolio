import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types";
import { SkillForm } from "@/components/admin/skill-form";

// Reads the live skill row on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches a single `skills` row by id, returning `null` on any failure
 * (missing row, or e.g. no live DB in this environment) rather than
 * crashing the page — the caller renders a 404 either way. */
async function getSkill(id: string): Promise<Skill | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = await getSkill(id);
  if (!skill) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Edit skill
        </h1>
        <p className="text-sm text-muted-foreground">
          Update details for &quot;{skill.name}&quot;.
        </p>
      </div>
      <SkillForm skill={skill} />
    </div>
  );
}
