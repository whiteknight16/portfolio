import type { NowCard } from "./types.ts";

const KEYS = ["building", "writing", "learning"] as const;

/** Reads `highlights.{i}.value/label` rows (3 slots) from form data. */
export function readHighlights(formData: FormData) {
  return [0, 1, 2].map((i) => ({
    value: formData.get(`highlights.${i}.value`) ?? "",
    label: formData.get(`highlights.${i}.label`) ?? "",
  }));
}

/** True when any trimmed Now value differs from the stored one (missing = ""). */
export function nowChanged(prev: Partial<NowCard> | null | undefined, next: Partial<NowCard> | null | undefined): boolean {
  return KEYS.some((k) => (prev?.[k] ?? "").trim() !== (next?.[k] ?? "").trim());
}
