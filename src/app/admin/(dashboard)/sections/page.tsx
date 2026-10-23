import { AdminPageHeader } from "@/components/admin/page-header";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SiteSection } from "@/lib/types";
import { SectionsManager } from "@/components/admin/sections-manager";

// Reads the live section list on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches all `site_sections` rows ordered by `sort_order`, degrading to
 * `[]` on any failure (e.g. no live DB in this environment) rather than
 * crashing the page. */
async function getSections(): Promise<SiteSection[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("site_sections")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminSectionsPage() {
  const sections = await getSections();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        kicker="Homepage"
        title="Sections"
        description="Choose which sections appear on your home page, and in what order."
      />
      <SectionsManager sections={sections} />
    </div>
  );
}
