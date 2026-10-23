/**
 * Pure view helpers for the homepage's section layout.
 */

import type { SiteSection } from "./types.ts";

export type SubscribePlacement = {
  /**
   * Which block carries the page's one `id="subscribe"` (the nav's
   * "Subscribe" target): the Newsletter panel, a card form inside the Notes
   * block, or a small card block at the end of the page.
   */
  target: "newsletter" | "notes" | "end";
  /**
   * What the Notes block offers: its own card form, a link down or up to the
   * Newsletter panel, or `null` when Notes isn't shown.
   */
  notes: "form" | "below" | "above" | null;
};

/**
 * Where the homepage's subscribe form lives, from the enabled section keys in
 * display order. The Newsletter panel wins when it's shown; otherwise the
 * Notes block carries a card form; with neither, a block closes the page.
 */
export function subscribePlacement(keys: readonly SiteSection["key"][]): SubscribePlacement {
  const notes = keys.indexOf("blog");
  const newsletter = keys.indexOf("newsletter");
  if (newsletter >= 0) {
    return { target: "newsletter", notes: notes < 0 ? null : newsletter > notes ? "below" : "above" };
  }
  return notes >= 0 ? { target: "notes", notes: "form" } : { target: "end", notes: null };
}
