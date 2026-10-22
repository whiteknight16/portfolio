import { renderNoteOgCard } from "@/components/og/note-og-card";
import { getPostBySlug, getProfile } from "@/lib/content";
import { brand, siteUrl } from "@/lib/config";
import { formatNoteDate, handleSlug } from "@/lib/format";
import { urlHost } from "@/lib/note-view";

// Rendered per request from the live note row; unknown or draft slugs 404.
export const dynamic = "force-dynamic";

/** The note's generated Open Graph card (what LinkedIn shows when it's shared). */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return new Response("Not found", { status: 404 });

  const profile = await getProfile();
  return renderNoteOgCard({
    title: post.title,
    date: formatNoteDate(post.published_at),
    name: profile?.full_name || brand.name,
    handle: handleSlug(profile?.handle || brand.handle),
    host: urlHost(siteUrl) ?? siteUrl,
  });
}
