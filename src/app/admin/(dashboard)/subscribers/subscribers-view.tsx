import { format, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EntityTable } from "@/components/admin/entity-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Subscriber } from "@/lib/types";
import {
  deleteSubscriberAction,
} from "@/app/admin/(dashboard)/subscribers/actions";
import { SubscriberStatusButton } from "@/app/admin/(dashboard)/subscribers/status-button";

/** Presentational Subscribers screen (header, export, table). */
export function SubscribersView({ subscribers }: { subscribers: Subscriber[] }) {
  const active = subscribers.filter((s) => s.status === "active").length;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        kicker="Audience"
        title="Subscribers"
        description={`${active} active`}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href="/admin/subscribers/export" download />}
          >
            <Download />
            Export CSV
          </Button>
        }
      />
      <EntityTable
        rows={subscribers}
        onDelete={deleteSubscriberAction}
        emptyMessage="No subscribers yet. The subscribe box is live on the homepage and every note."
        describeRow={(s) => s.email}
        extraActions={(s) => <SubscriberStatusButton id={s.id} status={s.status} />}
        columns={[
          { header: "Email", cell: (s) => <span className="font-medium">{s.email}</span> },
          {
            header: "Status",
            cell: (s) => (
              <Badge variant={s.status === "active" ? "default" : "outline"}>
                {s.status === "active" ? "Active" : "Unsubscribed"}
              </Badge>
            ),
          },
          {
            header: "Source",
            cell: (s) => <span className="text-muted-foreground">{s.source ?? "—"}</span>,
          },
          {
            header: "Subscribed",
            cell: (s) => format(parseISO(s.created_at), "MMM d, yyyy"),
          },
        ]}
      />
    </div>
  );
}
