import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env";

type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

/**
 * Best-effort notification email for a new contact message.
 *
 * Email is a convenience, not the source of truth (the row already landed
 * in `contact_messages`), so this never throws: a missing API key/recipient
 * just logs a warning and returns, and a failed Resend call is caught and
 * logged rather than surfaced to the caller.
 */
export async function sendContactEmail({ name, email, message }: ContactMessage): Promise<void> {
  const { resendApiKey, contactEmail, contactFrom } = serverEnv();

  if (!resendApiKey || !contactEmail) {
    console.warn("sendContactEmail: RESEND_API_KEY or CONTACT_NOTIFICATION_EMAIL not set, skipping email send.");
    return;
  }

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: contactFrom,
      to: contactEmail,
      replyTo: email,
      subject: `New contact message from ${name}`,
      text: `You received a new message from the contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
  } catch (err) {
    console.error("sendContactEmail: failed to send notification email", err);
  }
}
