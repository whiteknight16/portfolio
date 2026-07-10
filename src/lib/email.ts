import "server-only";
import { Resend } from "resend";
import { emailEnv } from "@/lib/env";

type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

/**
 * Best-effort notification email for a new contact message.
 *
 * Email is a convenience, not the source of truth (the row already landed
 * in `contact_messages`), so this never throws for any reason: reading env
 * config uses the non-throwing `emailEnv` (not `serverEnv`, which throws on
 * an unrelated missing secret) and the whole body is wrapped in a try/catch,
 * so a missing API key/recipient or a failed Resend call is logged rather
 * than surfaced to the caller.
 */
export async function sendContactEmail({ name, email, message }: ContactMessage): Promise<void> {
  try {
    const { resendApiKey, contactEmail, contactFrom } = emailEnv();

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
  } catch (err) {
    console.error("sendContactEmail: unexpected error, skipping email send", err);
  }
}
