"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImageAction } from "@/app/admin/actions/upload";

type ImageUploadProps = {
  /** Name of the hidden input the resulting URL is submitted under. */
  name: string;
  /** Storage sub-folder within the bucket, e.g. "projects". */
  folder: string;
  /** Storage bucket to upload into. Defaults to "media"; blog uses "blog-images". */
  bucket?: string;
  /** Existing image URL to preview, if editing. */
  defaultValue?: string | null;
  onUploaded?: (url: string) => void;
};

/** File input with preview that uploads to the given `bucket` (default
 * `media`) and stores the resulting public URL in a hidden input so it submits
 * with the parent form.
 *
 * The hidden input only ever holds a resolved, uploaded URL (or the empty
 * string) — never the local `blob:` preview — so a form submitted while an
 * upload is still in flight can't persist a meaningless object URL. */
export function ImageUpload({
  name,
  folder,
  bucket = "media",
  defaultValue = null,
  onUploaded,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // The value that actually submits with the form. Only ever a resolved
  // upload URL (or null), never a blob: object URL.
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(defaultValue);
  // Local object URL used purely for the visual preview while an upload is
  // in flight. Cleared (and revoked) once the upload settles.
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localPreviewRef = useRef<string | null>(null);

  // Revoke any outstanding object URL on unmount.
  useEffect(() => {
    return () => {
      if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    };
  }, []);

  function setLocalPreviewUrl(url: string | null) {
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    localPreviewRef.current = url;
    setLocalPreview(url);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setLocalPreviewUrl(URL.createObjectURL(file));
    setPending(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);
      formData.set("bucket", bucket);

      const result = await uploadImageAction(formData);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setUploadedUrl(result.url);
      onUploaded?.(result.url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLocalPreviewUrl(null);
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    setLocalPreviewUrl(null);
    setUploadedUrl(null);
    setError(null);
    onUploaded?.("");
  }

  // While an upload is in flight, prefer the local blob preview visually;
  // otherwise show the last resolved URL. The hidden input below always
  // reflects `uploadedUrl` only, regardless of `pending`.
  const displayPreview = localPreview ?? uploadedUrl;

  return (
    <div className="flex flex-col gap-2" data-uploading={pending || undefined}>
      <input type="hidden" name={name} value={uploadedUrl ?? ""} readOnly />
      <div className="flex items-center gap-3">
        {displayPreview ? (
          // Preview source is either a blob: URL or a Supabase storage URL,
          // neither of which benefits from next/image's remote optimization.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayPreview}
            alt=""
            className="size-20 shrink-0 rounded-lg object-cover ring-1 ring-border"
          />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
            <ImagePlus className="size-5" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            disabled={pending}
            onChange={handleFileChange}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {pending
                ? "Uploading…"
                : displayPreview
                  ? "Replace image"
                  : "Upload image"}
            </Button>
            {displayPreview ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={handleRemove}
              >
                <X className="size-4" />
                Remove
              </Button>
            ) : null}
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
