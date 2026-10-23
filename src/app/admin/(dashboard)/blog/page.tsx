import Link from "next/link";
import { format, parseISO } from "date-fns";
import { AdminPageHeader } from "@/components/admin/page-header";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityTable, type EntityTableColumn } from "@/components/admin/entity-table";
import { deletePostAction } from "@/app/admin/(dashboard)/blog/actions";

// Reads the live post list on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches all `posts` rows ordered by `published_at` (drafts last), then
 * `created_at`, degrading to `[]` on any failure (e.g. no live DB in this
 * environment) rather than crashing the page. */
async function getPosts(): Promise<Post[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: EntityTableColumn<Post>[] = [
  {
    header: "Title",
    cell: (post) => <span className="font-medium text-foreground">{post.title}</span>,
  },
  {
    header: "Status",
    cell: (post) => (
      <Badge variant={post.status === "published" ? "default" : "outline"}>
        {post.status === "published" ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    header: "Published",
    cell: (post) =>
      post.published_at ? format(parseISO(post.published_at), "MMM d, yyyy") : "—",
  },
];

export default async function AdminNotesPage() {
  const posts = await getPosts();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        kicker="Writing"
        title="Notes"
        description="Manage the notes published on your site."
        actions={
          <Button nativeButton={false} render={<Link href="/admin/blog/new" />}>
            New note
          </Button>
        }
      />
      <EntityTable
        columns={columns}
        rows={posts}
        editHref={(post) => `/admin/blog/${post.id}`}
        onDelete={deletePostAction}
        describeRow={(post) => post.title}
        emptyMessage="No notes yet. Write your first one to get started."
      />
    </div>
  );
}
