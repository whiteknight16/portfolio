import { createServerSupabase } from "@/lib/supabase/server";
import type { Subscriber } from "@/lib/types";
import { SubscribersView } from "@/app/admin/(dashboard)/subscribers/subscribers-view";

export const dynamic = "force-dynamic";

async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    return error ? [] : (data ?? []);
  } catch {
    return [];
  }
}

export default async function AdminSubscribersPage() {
  return <SubscribersView subscribers={await getSubscribers()} />;
}
