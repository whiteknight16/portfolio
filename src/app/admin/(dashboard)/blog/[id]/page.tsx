import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { PostForm } from "@/components/admin/post-form";

// Reads the live post row on every request — never prerender it.
export const dynamic = "force-dynamic";

/** Fetches a single `posts` row by id, returning `null` on any failure
 * (missing row, or e.g. no live DB in this environment) rather than
 * crashing the page — the caller renders a 404 either way. */
async function getPost(id: string): Promise<Post | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Edit post
        </h1>
        <p className="text-sm text-muted-foreground">
          Update details for &quot;{post.title}&quot;.
        </p>
      </div>
      <PostForm post={post} />
    </div>
  );
}
