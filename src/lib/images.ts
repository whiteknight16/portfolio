/**
 * Which image URLs `next/image` may optimise. Framework-free so both
 * next.config.ts and the components can share it.
 */

const STORAGE_PATH = "/storage/v1/object/public/";

/**
 * The `images.remotePatterns` entry for this project's public Supabase Storage
 * objects (uploaded avatars and covers), or `null` without a valid URL.
 */
export function supabaseStoragePattern(supabaseUrl: string | undefined) {
  try {
    const { hostname } = new URL(supabaseUrl ?? "");
    return { protocol: "https", hostname, port: "", pathname: `${STORAGE_PATH}**` } as const;
  } catch {
    return null;
  }
}

/**
 * True for a root-relative path (`/profile.png`) or a public object in this
 * project's Supabase Storage: the sources `supabaseStoragePattern` lets the
 * optimiser fetch. Anything else (a cover pasted from another host) must be
 * rendered `unoptimized`, or `/_next/image` would refuse it.
 */
export function isOptimizableImage(src: string, supabaseUrl: string | undefined): boolean {
  if (src.startsWith("/")) return !src.startsWith("//");
  const pattern = supabaseStoragePattern(supabaseUrl);
  if (!pattern) return false;
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      url.hostname === pattern.hostname &&
      url.port === "" &&
      url.pathname.startsWith(STORAGE_PATH)
    );
  } catch {
    return false;
  }
}
