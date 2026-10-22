"use server";

import { subscribeSchema } from "@/lib/validation";
import { isUniqueViolation } from "@/lib/supabase-errors";
import { createServerSupabase } from "@/lib/supabase/server";

export type SubscribeFormState = { ok?: boolean; error?: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * Handles a subscribe form submission.
 *
 * Honeypot-filled submissions are told "success" but nothing is stored. The
 * insert deliberately has no `.select()`/upsert: anon may only INSERT, so a
 * duplicate email surfaces as Postgres 23505, which we report as success too
 * (no way to probe who is already subscribed).
 */
export async function subscribeAction(
  _prevState: SubscribeFormState,
  formData: FormData,
): Promise<SubscribeFormState> {
  const parsed = subscribeSchema.safeParse({
    email: (formData.get("email") ?? "").toString(),
    honeypot: (formData.get("honeypot") ?? "").toString(),
    source: (formData.get("source") ?? "").toString(),
  });

  if (!parsed.success) {
    const honeypotFilled = parsed.error.issues.some((issue) => issue.path[0] === "honeypot");
    if (honeypotFilled) return { ok: true };
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email, source } = parsed.data;

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("subscribers").insert({ email, source });
    if (error && !isUniqueViolation(error)) {
      console.error("subscribeAction: failed to insert subscriber", error);
      return { error: GENERIC_ERROR };
    }
  } catch (err) {
    console.error("subscribeAction: failed to reach the database", err);
    return { error: GENERIC_ERROR };
  }

  return { ok: true };
}
