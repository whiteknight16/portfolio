# Blog images → dedicated `blog-images` bucket

**Date:** 2026-07-10
**Status:** Draft — awaiting review

## Problem

All admin image uploads currently go into a single Supabase Storage bucket
named `media` (created by `supabase/migrations/0003_storage.sql`), via the
shared `uploadImageAction` server action:

- Blog **cover** images upload with folder `blog`.
- Blog **inline** images (TipTap editor toolbar) upload with folder `posts`.
- Non-blog images (projects, achievements, experience, profile, …) also use
  `media`.

The owner never created a `media` bucket in the live project — they created a
bucket named **`blog-images`** by hand. Nothing has gone live yet, so there is
no existing uploaded data to migrate. We want blog images (cover **and**
inline) to be stored in and served from the `blog-images` bucket, and blog
pages to render those images correctly for visitors.

## Goal

Blog cover images and inline blog-content images upload to, and are served
from, a public `blog-images` bucket. Public blog pages display them correctly.
Non-blog uploads are left exactly as they are (still `media`).

## Non-goals

- Migrating any existing uploaded images (there are none — site not live).
- Changing the bucket used by projects/achievements/experience/profile.
- Rewriting URLs already embedded in stored post content (none exist).

## Approach

Parameterize the existing single upload path by bucket, rather than adding a
separate blog-only action (which would duplicate ~40 lines of validation that
would drift). Default the bucket to `media` so every non-blog call site is
unchanged; only the blog `PostForm` opts into `blog-images`.

### 1. Server action — `src/app/admin/actions/upload.ts`

- Read an optional `bucket` field from `FormData`; default to `"media"`.
- Validate it against an allowlist constant
  `ALLOWED_BUCKETS = ["media", "blog-images"]`; reject anything else with a
  clear error (prevents an arbitrary-bucket write via a crafted request).
- Everything else is unchanged: auth (`getSessionUser`), 5MB cap, MIME
  allowlist (png/jpeg/webp/gif), UUID filename, `getPublicUrl` return.
- The `.from("media")` calls become `.from(bucket)`.

### 2. Components

- **`src/components/admin/image-upload.tsx`** — add optional
  `bucket?: string` prop (default `"media"`); include it in the `FormData`
  sent to `uploadImageAction`. Update the doc comment (currently says "the
  `media` bucket").
- **`src/components/editor/rich-text-editor.tsx`** — add optional
  `bucket?: string` prop (default `"media"`); forward it to `EditorToolbar`.
- **`src/components/editor/toolbar.tsx`** — accept `bucket` and include it in
  the inline-image `FormData` (currently hardcoded to folder `posts` in the
  `media` bucket).
- **`src/components/admin/post-form.tsx`** — pass `bucket="blog-images"` to
  both `<ImageUpload>` (cover) and `<RichTextEditor>` (inline). Folder names
  stay as-is (`blog` for cover, `posts` for inline) — they are now folders
  *within* `blog-images`.
- **`src/components/admin/project-form.tsx`** — no change; omitting the prop
  keeps projects on `media`.

### 3. Migration — `supabase/migrations/0005_blog_images_storage.sql`

Mirror `0003_storage.sql` for the new bucket, idempotent so it is safe whether
or not the hand-created dashboard bucket already exists:

```sql
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy blog_images_public_read on storage.objects
  for select using (bucket_id = 'blog-images');
create policy blog_images_admin_write on storage.objects
  for insert with check (bucket_id = 'blog-images' and public.is_admin());
create policy blog_images_admin_update on storage.objects
  for update using (bucket_id = 'blog-images' and public.is_admin());
create policy blog_images_admin_delete on storage.objects
  for delete using (bucket_id = 'blog-images' and public.is_admin());
```

Note: if the owner already created the bucket as **private** in the dashboard,
the `on conflict do nothing` will not flip it to public. The plan will call
out verifying the bucket is public (public read is required for `<img src>` to
load). If it exists and is private, run
`update storage.buckets set public = true where id = 'blog-images';`.

### 4. Viewing — no code change

`blog-images` is public, so `getPublicUrl` yields a directly loadable URL. The
public blog page (`src/app/(site)/blog/[slug]/page.tsx`) already renders the
cover image and sanitized inline `<img>` tags. Once uploads land in the public
`blog-images` bucket, blogs display correctly.

## Data flow

Admin uploads a blog cover / inline image
→ `ImageUpload` / `EditorToolbar` posts `FormData{file, folder, bucket:"blog-images"}`
→ `uploadImageAction` validates bucket + file, uploads to
  `blog-images/<folder>/<uuid>.<ext>`, returns public URL
→ URL stored in the post row (`cover_image_url`) or embedded in sanitized
  content HTML
→ public blog page renders `<img src>` from the public `blog-images` URL.

## Error handling

- Unknown/disallowed bucket → action returns
  `{ error: "Unsupported storage bucket." }`; existing UI error rendering shows
  it. (Not user-reachable through the current UI — defense in depth.)
- Unauthed, oversized, or bad-MIME uploads → unchanged existing errors.
- Storage RLS (`blog_images_admin_write`) enforces admin-only writes
  server-side, matching the `media` policies.

## Testing / verification

- `npm run build` / typecheck passes with the new props.
- Manual: in `/admin`, create a post, upload a cover image and insert an inline
  image; confirm both resolve to `…/storage/v1/object/public/blog-images/…`
  URLs and render on the public `/blog/<slug>` page.
- Confirm a project image upload still targets `media` (regression check).
- Confirm the `blog-images` bucket is public in the dashboard.
