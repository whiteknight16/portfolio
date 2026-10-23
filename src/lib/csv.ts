import type { Subscriber } from "./types.ts";

/** One CSV cell: neutralise spreadsheet formulas, then RFC 4180 quote if needed. */
function cell(value: string | null): string {
  let text = value ?? "";
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Serialises subscribers for download. CRLF line endings, header always present. */
export function toSubscribersCsv(rows: Subscriber[]): string {
  const lines = [
    "email,status,source,subscribed_at",
    ...rows.map((r) => [r.email, r.status, r.source, r.created_at].map(cell).join(",")),
  ];
  return lines.join("\r\n") + "\r\n";
}
