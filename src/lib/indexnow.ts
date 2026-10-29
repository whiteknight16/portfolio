/**
 * IndexNow: tell Bing, Yandex and the other IndexNow engines the moment a note
 * or project is published or edited, instead of waiting for a recrawl. The key
 * is `indexNowKey` in config.ts, served as `public/<key>.txt`.
 */

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const TIMEOUT_MS = 5000;

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

/**
 * The ping for a saved note/project, or `null` when there should be none:
 * only published items, and only on the production deployment (so previews
 * and local dev never submit URLs). Lists the item, its index page and home.
 */
export function indexNowPing(args: {
  vercelEnv: string | undefined;
  status: "draft" | "published";
  siteUrl: string;
  key: string;
  section: "notes" | "projects";
  slug: string;
}): IndexNowPayload | null {
  const { vercelEnv, status, siteUrl, key, section, slug } = args;
  if (vercelEnv !== "production" || status !== "published") return null;
  return {
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList: [`${siteUrl}/${section}/${slug}`, `${siteUrl}/${section}`, `${siteUrl}/`],
  };
}

/** POST the ping with a 5 s timeout. Never throws: a failure is only logged. */
export async function submitIndexNow(payload: IndexNowPayload, fetchImpl: typeof fetch = fetch): Promise<void> {
  try {
    const res = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) console.error(`IndexNow ping failed: HTTP ${res.status}`, payload.urlList);
  } catch (error) {
    console.error("IndexNow ping failed:", error, payload.urlList);
  }
}
