"use server";

import { contactSchema } from "@/lib/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { sendContactEmail } from "@/lib/email";

export type ContactFormState = { ok?: boolean; error?: string };

/**
 * Handles a contact form submission.
 *
 * Bots that fill in the honeypot field are told "success" (so they don't
 * retry) but nothing is inserted or emailed. Real submissions are inserted
 * into `contact_messages` (the source of truth); the notification email is
 * best-effort and never fails the request.
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

  try {
    await sendContactEmail({ name, email, message });
  } catch (err) {
    // Belt-and-suspenders: sendContactEmail is documented to never throw,
    // but a future regression there must not fail a request whose DB
    // insert already succeeded.
    console.error("sendContactAction: unexpected error sending notification email", err);
  }

  return { ok: true };
}
