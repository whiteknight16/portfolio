import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

// Per-request session check (redirects already-authed admins), so this page
// is dynamic and must not be prerendered at build time. See the note in
// `(dashboard)/layout.tsx` for the full rationale.
export const dynamic = "force-dynamic";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm shadow-ink-lg">
        <CardHeader>
          <CardTitle className="font-display text-[28px] font-semibold tracking-tight">
            Admin
          </CardTitle>
          <CardDescription className="font-mono text-xs uppercase tracking-[0.12em]">
            Harsh Pandey · Knight Developer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
