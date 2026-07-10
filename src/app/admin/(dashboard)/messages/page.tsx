import { format, parseISO } from "date-fns";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ContactMessage } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkReadButton } from "@/app/admin/(dashboard)/messages/mark-read-button";

// Reads the live message list on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches all `contact_messages` rows newest first, degrading to `[]` on
 * any failure (e.g. no live DB in this environment) rather than crashing
 * the page. `requireAdmin()` already runs in the `(dashboard)` layout, but
 * this route touches user-submitted data, so it's worth keeping the fetch
 * itself defensive too. */
async function getMessages(): Promise<ContactMessage[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();
  const unreadCount = messages.filter((message) => !message.is_read).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0
            ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"} out of ${messages.length}.`
            : "Submissions from your contact form."}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No messages yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{message.name}</span>
                      {!message.is_read ? <Badge>Unread</Badge> : <Badge variant="outline">Read</Badge>}
                    </div>
                    <a
                      href={`mailto:${message.email}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {message.email}
                    </a>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <MarkReadButton id={message.id} isRead={message.is_read} />
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground">{message.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
