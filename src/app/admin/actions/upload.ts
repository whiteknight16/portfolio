"use server";

import { getSessionUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export type UploadImageResult = { url: string } | { error: string };

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// Buckets the upload action is allowed to write to. Guards against a crafted
// request targeting an arbitrary bucket. `media` is the default for most
// admin content; `blog-images` holds blog cover + inline images.
const ALLOWED_BUCKETS = ["media", "blog-images"] as const;
type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Uploads an image to a storage bucket at `${folder}/<uuid>.<ext>` and returns
 * its public URL. `bucket` defaults to `media`; blog uploads pass `blog-images`.
 * Requires an authed admin session — storage RLS (`<bucket>_admin_write`)
 * enforces the same check server-side.
 */
export async function uploadImageAction(
  formData: FormData,
): Promise<UploadImageResult> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "You must be signed in as an admin to upload files." };
  }

  const file = formData.get("file");
  const folder = formData.get("folder");
  const bucketField = formData.get("bucket");
  const bucket: AllowedBucket =
    typeof bucketField === "string" && bucketField ? (bucketField as AllowedBucket) : "media";

  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }
  if (typeof folder !== "string" || !folder.trim()) {
    return { error: "Missing upload folder." };
  }
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return { error: "Unsupported storage bucket." };
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return {
      error: "Unsupported file type. Use PNG, JPEG, WebP, or GIF.",
    };
  }
  if (file.size > MAX_BYTES) {
    return { error: "File is too large (max 5MB)." };
  }

  const safeFolder = folder.trim().replace(/^\/+|\/+$/g, "");
  const path = `${safeFolder}/${crypto.randomUUID()}.${ext}`;

  const supabase = await createServerSupabase();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}
