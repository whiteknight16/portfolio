import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { toSubscribersCsv } from "@/lib/csv";

/** Admin-only CSV download of every subscriber, newest first. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return new Response("Could not load subscribers.", { status: 500 });

  const date = new Date().toISOString().slice(0, 10);
  return new Response(toSubscribersCsv(data ?? []), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
