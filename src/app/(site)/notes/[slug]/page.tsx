import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { NoteArticle, type NoteLink } from "@/components/public/note-article";
import { JsonLd } from "@/components/seo/json-ld";
import { getAdjacentPosts, getPostBySlug, getProfile } from "@/lib/content";
import { brand, siteUrl } from "@/lib/config";
import { noteAuthor, noteImageUrl, noteMetadata } from "@/lib/note-view";
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import type { Post } from "@/lib/types";

// Reads the live note row on every request — never prerender it.
export const dynamic = "force-dynamic";

type NotePageProps = { params: Promise<{ slug: string }> };

/** Published note by slug, deduped between `generateMetadata` and the page. */
const getNote = cache((slug: string) => getPostBySlug(slug));

const toLink = (post: Post | null): NoteLink | null =>
  post ? { slug: post.slug, title: post.title } : null;

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, profile] = await Promise.all([getNote(slug), getProfile()]);
  if (!post) notFound();
  return noteMetadata(post, { siteUrl, name: profile?.full_name || brand.name });
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const post = await getNote(slug);
  if (!post) notFound();

  const [{ previous, next }, profile] = await Promise.all([getAdjacentPosts(post), getProfile()]);

  return (
    <>
      <JsonLd data={buildBlogPostingJsonLd({ siteUrl, post, imageUrl: noteImageUrl(siteUrl, post) })} />
      <JsonLd
        data={buildBreadcrumbJsonLd(siteUrl, [
          { name: "Notes", path: "/notes" },
          { name: post.title, path: `/notes/${post.slug}` },
        ])}
      />
      <NoteArticle
        post={post}
        author={noteAuthor(profile)}
        previous={toLink(previous)}
        next={toLink(next)}
      />
    </>
  );
}
