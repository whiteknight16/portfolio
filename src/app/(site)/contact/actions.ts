"use server";

import { contactSchema } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase/server";

export type ContactFormState = { ok?: boolean; error?: string };

/**
 * Handles a contact form submission.
 *
 * Bots that fill in the honeypot field are told "success" (so they don't
 * retry) but nothing is stored. Real submissions are inserted into
 * `contact_messages` — the single source of truth, read from the admin
 * Messages inbox. No email is sent (email notifications are disabled).
 */
export async function sendContactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: (formData.get("name") ?? "").toString(),
    email: (formData.get("email") ?? "").toString(),
    message: (formData.get("message") ?? "").toString(),
    honeypot: (formData.get("honeypot") ?? "").toString(),
  });

  if (!parsed.success) {
    const honeypotFilled = parsed.error.issues.some((issue) => issue.path[0] === "honeypot");
    if (honeypotFilled) return { ok: true };
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, message } = parsed.data;

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("contact_messages").insert({ name, email, message });
    if (error) {
      console.error("sendContactAction: failed to insert contact message", error);
      return { error: "Something went wrong. Please try again." };
    }
  } catch (err) {
    console.error("sendContactAction: failed to reach the database", err);
    return { error: "Something went wrong. Please try again." };
  }

  return { ok: true };
}
