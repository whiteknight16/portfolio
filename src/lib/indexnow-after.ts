import "server-only";
import { after } from "next/server";
import { indexNowKey, siteUrl } from "@/lib/config";
import { indexNowPing, submitIndexNow } from "@/lib/indexnow";

/**
 * Call after a note/project was saved successfully: when it's published and
 * this is the production deployment, ping IndexNow once the response has been
 * sent (`after()`), so the ping can never delay or fail the admin action.
 */
export function pingIndexNowAfterSave(
  section: "notes" | "projects",
  status: "draft" | "published",
  slug: string,
) {
  const ping = indexNowPing({
    vercelEnv: process.env.VERCEL_ENV,
    status,
    siteUrl,
    key: indexNowKey,
    section,
    slug,
  });
  if (ping) after(() => submitIndexNow(ping));
}
