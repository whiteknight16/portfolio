import { requireAdmin } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/shell";

/** Unread contact message count for the nav badge. Degrades to `0` on any
 * failure rather than breaking every admin page over a single stat. */
async function getUnreadMessageCount(): Promise<number> {
  try {
    const supabase = await createServerSupabase();
    const { count, error } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);
    return error ? 0 : (count ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Layout for the authed admin area. Lives in the `(dashboard)` route group
 * so it does not wrap `src/app/admin/login`, which must stay a public page.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const unreadMessageCount = await getUnreadMessageCount();
  return <AdminShell unreadMessageCount={unreadMessageCount}>{children}</AdminShell>;
}
