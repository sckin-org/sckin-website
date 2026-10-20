"use client";

import { useRef, useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/forms";
import TurnstileWidget, {
  turnstileEnabled,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Footer newsletter signup — the inline pill input + button from the locked
 * footer design. Posts to /api/newsletter (same contract as the old page-level
 * signup: { email } + honeypot). Styled for the dark footer surface only.
 */
export default function NewsletterSignup() {
  const [status, setStatus] = useState<Status>("idle");
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // No site key (bare `next dev`) means no token is required.
  const verified = !turnstileEnabled || turnstileToken !== null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      turnstileRef.current?.reset();
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="mt-3 text-[15px] text-on-footer">
        You&rsquo;re signed up — watch your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-role="newsletter-signup" className="mt-3">
      <div hidden aria-hidden="true">
        <label htmlFor={`footer-${HONEYPOT_FIELD}`}>Leave this field empty</label>
        <input
          id={`footer-${HONEYPOT_FIELD}`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex max-w-[420px] gap-2">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Email address"
          autoComplete="email"
          className="min-w-0 flex-1 rounded-pill border border-white/20 bg-white/8 px-[18px] py-[11px] text-[15px] text-on-footer-strong outline-none placeholder:text-on-footer-muted focus:border-white/45"
        />
        <button
          type="submit"
          disabled={status === "submitting" || !verified}
          className="rounded-pill bg-white px-5 py-[11px] text-[15px] font-semibold text-heading transition-colors hover:bg-(--gray-200) disabled:opacity-60"
        >
          {status === "submitting" ? "Signing up…" : "Sign up"}
        </button>
      </div>

      <div className="mt-2">
        <TurnstileWidget
          ref={turnstileRef}
          theme="dark"
          onTokenChange={setTurnstileToken}
        />
      </div>

      {status === "error" ? (
        <p role="alert" className="mt-2 text-[13px] text-on-footer-muted">
          Something went wrong — please try again, or email{" "}
          <a href="mailto:contact@sckin.org" className="underline">
            contact@sckin.org
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}
