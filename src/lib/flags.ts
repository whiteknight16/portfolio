/**
 * Server-only launch switch.
 *
 * `LAUNCHED=true`  -> serve the real portfolio site.
 * unset / anything else -> keep the coming-soon countdown live.
 *
 * This is deliberately NOT a `NEXT_PUBLIC_` var: it's read on the server in a
 * Server Component, so the value never ships to the browser and both pages
 * aren't forced into the client bundle. Import this ONLY from server code.
 *
 * Primary workflow is branch-based (build the real site on a branch, merge to
 * deploy). This flag is the rollback kill-switch: flip it to false in your host
 * to fall back to the coming-soon page without reverting git.
 */
export const isLaunched = process.env.LAUNCHED === "true";
