import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Newspaper } from "lucide-react";
import type { Post } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Cover image + title + excerpt + published date + reading time + tags for
 * one post, linking through to `/blog/[slug]`. Mirrors `ProjectCard`: plain
 * `<img>` (not `next/image`) since `cover_image_url` is a remote Supabase
 * URL, avoiding a `remotePatterns` registration for a project-controlled
 * hostname.
 */
export function PostCard({ post }: { post: Post }) {
  return (
    <Card className="h-full justify-between gap-4 transition-shadow hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL; see comment above.
          <img
            src={post.cover_image_url}
            alt={post.title}
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground">
            <Newspaper className="size-8" />
          </div>
        )}
      </Link>

      <CardHeader>
        <CardTitle className="text-lg">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-muted-foreground"
          >
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="mt-1.5 line-clamp-3 text-sm">
          {post.excerpt}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {post.published_at ? <span>{format(parseISO(post.published_at), "MMM d, yyyy")}</span> : null}
          {post.published_at ? <span aria-hidden>·</span> : null}
          <span>{post.reading_minutes} min read</span>
        </div>
      </CardContent>
    </Card>
  );
}
