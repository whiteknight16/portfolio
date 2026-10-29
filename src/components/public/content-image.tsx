import type { Ref } from "react";
import Image, { type ImageProps } from "next/image";
import { isOptimizableImage } from "@/lib/images";

type ContentImageProps = Omit<ImageProps, "src" | "unoptimized"> & {
  src: string;
  ref?: Ref<HTMLImageElement>;
};

/**
 * `next/image` for URLs that come from content (the avatar, note and project
 * covers): resized and re-encoded when the file is local or in this project's
 * Supabase Storage, passed through untouched from any other host (which
 * `/_next/image` would refuse). Usable from server and client components.
 */
export function ContentImage({ src, alt, ...props }: ContentImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={!isOptimizableImage(src, process.env.NEXT_PUBLIC_SUPABASE_URL)}
      {...props}
    />
  );
}
