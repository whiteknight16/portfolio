"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContactAction, type ContactFormState } from "@/app/(site)/contact/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/admin/submit-button";

const initialState: ContactFormState = {};

/**
 * Client-side contact form bound to `sendContactAction` via `useActionState`.
 * Includes a honeypot field that's invisible and unreachable for real
 * visitors (aria-hidden, unfocusable, off-screen) but present in the DOM for
 * bots that blindly fill every input — the action silently no-ops (while
 * still reporting success) when it comes back non-empty.
 */
export function ContactForm() {
  const [state, formAction] = useActionState(sendContactAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // The action never redirects (unlike the admin create/edit forms), so a
  // successful submission has to clear the fields itself.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="relative flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-name">Name</Label>
        <Input id="contact-name" name="name" type="text" autoComplete="name" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" name="message" rows={5} required />
      </div>

      {/* Honeypot spam trap — mirrors contactSchema's `honeypot` field. Kept
       * as a real (non-`type=hidden`) input so naive bots that skip hidden
       * fields still fill it in, but it's unreachable for people: hidden
       * from assistive tech, excluded from tab order, and positioned
       * off-screen rather than `display:none` (which some scrapers detect
       * and skip). */}
      <div
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-px overflow-hidden opacity-0"
      >
        <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-muted-foreground">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
      ) : null}

      <SubmitButton pendingText="Sending…" className="self-start">
        Send message
      </SubmitButton>
    </form>
  );
}
