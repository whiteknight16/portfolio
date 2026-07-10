"use server";

import { getSessionUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export type UploadImageResult = { url: string } | { error: string };

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Uploads an image to the `media` storage bucket at `${folder}/<uuid>.<ext>`
 * and returns its public URL. Requires an authed admin session — storage RLS
 * (`media_admin_write`) enforces the same check server-side.
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

  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }
  if (typeof folder !== "string" || !folder.trim()) {
    return { error: "Missing upload folder." };
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
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl };
}
