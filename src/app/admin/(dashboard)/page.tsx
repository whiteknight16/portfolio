import { FolderKanban, Newspaper, MailWarning } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ContactMessage } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// This page reads live counts/messages on every request — never prerender it.
export const dynamic = "force-dynamic";

type CountResult = { count: number | null; error: unknown };

/** Any Supabase error (or thrown rejection) degrades to 0 rather than crashing the page. */
async function safeCount(query: PromiseLike<CountResult>): Promise<number> {
  try {
    const { count, error } = await query;
    return error ? 0 : (count ?? 0);
  } catch {
    return 0;
  }
}

async function safeLatestMessages(
  query: PromiseLike<{ data: ContactMessage[] | null; error: unknown }>,
): Promise<ContactMessage[]> {
  try {
    const { data, error } = await query;
    return error ? [] : (data ?? []);
  } catch {
    return [];
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();

  const [projectsCount, postsCount, unreadCount, latestMessages] =
    await Promise.all([
      safeCount(
        supabase.from("projects").select("*", { count: "exact", head: true }),
      ),
      safeCount(
        supabase.from("posts").select("*", { count: "exact", head: true }),
      ),
      safeCount(
        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false),
      ),
      safeLatestMessages(
        supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ),
    ]);

  const stats = [
    { label: "Projects", value: projectsCount, icon: FolderKanban },
    { label: "Blog posts", value: postsCount, icon: Newspaper },
    { label: "Unread messages", value: unreadCount, icon: MailWarning },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          A quick look at your content and inbox.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Icon className="size-4" />
                {label}
              </CardDescription>
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest messages</CardTitle>
          <CardDescription>The 5 most recent contact submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {latestMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {latestMessages.map((message) => (
                <li key={message.id} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{message.name}</span>
                    {!message.is_read ? <Badge>Unread</Badge> : null}
                  </div>
                  <span className="text-sm text-muted-foreground">{message.email}</span>
                  <p className="line-clamp-2 text-sm">{message.message}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
