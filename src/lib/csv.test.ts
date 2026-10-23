import { test } from "node:test";
import assert from "node:assert/strict";
import { toSubscribersCsv } from "./csv.ts";

test("toSubscribersCsv writes a header and quotes risky cells", () => {
  const csv = toSubscribersCsv([{ id: "1", email: "a@b.co", status: "active", source: "/notes/x,y", created_at: "2026-10-22T10:00:00Z" }]);
  assert.equal(csv, 'email,status,source,subscribed_at\r\na@b.co,active,"/notes/x,y",2026-10-22T10:00:00Z\r\n');
});
test("toSubscribersCsv neutralises spreadsheet formulas", () => {
  const csv = toSubscribersCsv([{ id: "1", email: "=cmd@x.co", status: "active", source: null, created_at: "t" }]);
  assert.ok(csv.includes("'=cmd@x.co"));
});
test("toSubscribersCsv escapes quotes and newlines", () => {
  const csv = toSubscribersCsv([{ id: "1", email: "a@b.co", status: "active", source: 'say "hi"\nnow', created_at: "t" }]);
  assert.ok(csv.includes('"say ""hi""\nnow"'));
});
test("toSubscribersCsv neutralises cells starting with a tab or carriage return", () => {
  const csv = toSubscribersCsv([
    { id: "1", email: "a@b.co", status: "active", source: "\t=1+1", created_at: "t" },
    { id: "2", email: "c@d.co", status: "active", source: "\r=1+1", created_at: "t" },
  ]);
  assert.ok(csv.includes("a@b.co,active,'\t=1+1,t"));
  assert.ok(csv.includes(`c@d.co,active,"'\r=1+1",t`));
});
