import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";

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
  return <AdminShell>{children}</AdminShell>;
}
