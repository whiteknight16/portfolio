"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { subscribeAction, type SubscribeFormState } from "@/app/(site)/subscribe/actions";
import { cn } from "@/lib/utils";

const initialState: SubscribeFormState = {};

type Variant = "ink" | "card";

const styles: Record<Variant, { input: string; button: string; note: string; status: string }> = {
  // Dark ink panel (mockup `.sub`): dark input, highlighter-yellow button.
  // Yellow focus rings: ~13:1 against the #1d1a16 panel (WCAG 1.4.11 needs 3:1).
  ink: {
    input:
      "border-[#4a443c] bg-[#2a2620] text-[#f6f1e7] placeholder:text-[#a39a8c] focus-visible:outline-[#fde68a]",
    button: "bg-[#fde68a] text-[#1d1a16] focus-visible:outline-[#fde68a]",
    note: "text-[#a39a8c]",
    status: "text-[#b9b0a2]",
  },
  // Card on paper (mockup `.endsub`): paper input, solid ink button.
  card: {
    input: "border-rule bg-background text-foreground placeholder:text-faint",
    button: "bg-foreground text-background",
    note: "text-faint",
    status: "text-muted-foreground",
  },
};

function SubscribeButton({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "rounded-[3px] px-4 font-mono text-[12.5px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60",
        className,
      )}
    >
      {pending ? "Subscribing…" : "Subscribe"}
    </button>
  );
}

/**
 * Email subscribe form bound to `subscribeAction`. Works without JS (plain
 * form POST via the server action). Includes the same off-screen honeypot as
 * the contact form.
 */
export function SubscribeForm({ variant, source }: { variant: Variant; source: string }) {
  const [state, formAction] = useActionState(subscribeAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const s = styles[variant];

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="relative">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          aria-label="Email address"
          className={cn(
            "min-w-0 flex-1 rounded-[3px] border px-3 py-2.5 font-sans text-sm focus-visible:outline-2 focus-visible:outline-offset-2",
            s.input,
          )}
        />
        <SubscribeButton className={s.button} />
      </div>

      <input type="hidden" name="source" value={source} />

      {/* Honeypot spam trap — mirrors subscribeSchema's `honeypot` field; see ContactForm. */}
      <div
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-px overflow-hidden opacity-0"
      >
        <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {state.error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className={cn("mt-2 text-sm", s.status)}>
          You&apos;re in. You&apos;ll get the next note by email.
        </p>
      ) : null}

      <small className={cn("mt-2 block font-mono text-[11px]", s.note)}>
        No spam. Unsubscribe any time.
      </small>
    </form>
  );
}
