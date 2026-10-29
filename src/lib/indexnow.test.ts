import { test } from "node:test";
import assert from "node:assert/strict";
import { INDEXNOW_ENDPOINT, indexNowPing, submitIndexNow } from "./indexnow.ts";

const S = "https://www.k.dev";
const KEY = "0123456789abcdef0123456789abcdef";
const base = { siteUrl: S, key: KEY, status: "published" as const };

test("a published note in production pings the note, the notes index and home", () => {
  assert.deepEqual(indexNowPing({ ...base, vercelEnv: "production", section: "notes", slug: "hello" }), {
    host: "www.k.dev",
    key: KEY,
    keyLocation: `${S}/${KEY}.txt`,
    urlList: [`${S}/notes/hello`, `${S}/notes`, `${S}/`],
  });
});

test("a published project pings the project and /projects", () => {
  assert.deepEqual(
    indexNowPing({ ...base, vercelEnv: "production", section: "projects", slug: "ivf" })?.urlList,
    [`${S}/projects/ivf`, `${S}/projects`, `${S}/`],
  );
});

test("no ping outside production or for drafts", () => {
  for (const vercelEnv of [undefined, "preview", "development"]) {
    assert.equal(indexNowPing({ ...base, vercelEnv, section: "notes", slug: "hello" }), null);
  }
  assert.equal(
    indexNowPing({ ...base, status: "draft", vercelEnv: "production", section: "notes", slug: "hello" }),
    null,
  );
});

test("submitIndexNow posts JSON to the IndexNow endpoint", async () => {
  const payload = indexNowPing({ ...base, vercelEnv: "production", section: "notes", slug: "hello" })!;
  const calls: { url: string; init: RequestInit }[] = [];
  const fakeFetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(null, { status: 202 });
  }) as typeof fetch;
  await submitIndexNow(payload, fakeFetch);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, INDEXNOW_ENDPOINT);
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), payload);
  assert.ok(calls[0].init.signal instanceof AbortSignal);
});

test("submitIndexNow never throws: failures and rejections are only logged", async (t) => {
  const payload = indexNowPing({ ...base, vercelEnv: "production", section: "notes", slug: "hello" })!;
  const logged = t.mock.method(console, "error", () => {});
  await submitIndexNow(payload, (async () => new Response("bad key", { status: 403 })) as typeof fetch);
  await submitIndexNow(payload, (async () => {
    throw new Error("network down");
  }) as typeof fetch);
  assert.equal(logged.mock.callCount(), 2);
});
