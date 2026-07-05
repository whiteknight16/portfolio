"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImageAction } from "@/app/admin/actions/upload";

type ImageUploadProps = {
  /** Name of the hidden input the resulting URL is submitted under. */
  name: string;
  /** Storage sub-folder within the `media` bucket, e.g. "projects". */
  folder: string;
  /** Existing image URL to preview, if editing. */
  defaultValue?: string | null;
  onUploaded?: (url: string) => void;
};

/** File input with preview that uploads to the `media` bucket and stores the
 * resulting public URL in a hidden input so it submits with the parent form. */
export function ImageUpload({
  name,
  folder,
  defaultValue = null,
  onUploaded,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(defaultValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setPending(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);

      const result = await uploadImageAction(formData);

      if ("error" in result) {
        setError(result.error);
        setPreview(defaultValue);
        return;
      }

      setPreview(result.url);
      onUploaded?.(result.url);
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(defaultValue);
    } finally {
      URL.revokeObjectURL(localPreview);
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    setPreview(null);
    setError(null);
    onUploaded?.("");
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={preview ?? ""} readOnly />
      <div className="flex items-center gap-3">
        {preview ? (
          // Preview source is either a blob: URL or a Supabase storage URL,
          // neither of which benefits from next/image's remote optimization.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
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
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
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
              {preview ? "Replace image" : "Upload image"}
            </Button>
            {preview ? (
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
