"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An email address shown as plain, selectable text with a small Copy button.
 * Used on /scdaa, where visitors are on a phone at a conference: tapping Copy
 * beats typing 33 characters, and the address stays selectable for anyone who
 * would rather long-press it.
 *
 * Not ObfuscatedEmail: that component renders a mailto link with the address
 * entity-encoded, which cannot be selected as text or fed to the clipboard.
 * This address is published deliberately (it is already printed on the poster
 * and in the mailto CTAs beside it), so the anti-scraper trade-off doesn't
 * apply here.
 *
 * Degrades honestly: without the async Clipboard API (http origins, older
 * browsers) the button is not rendered at all, leaving the selectable address
 * — rather than a button that silently does nothing.
 */
export default function CopyEmail({
  email,
  label = "Email",
}: {
  email: string;
  /** Accessible context for the button, e.g. "Email" → "Copy email address". */
  label?: string;
}) {
  const [canCopy, setCanCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Feature-detected after mount: navigator.clipboard is absent during SSR,
  // and this keeps the server and first client render identical.
  useEffect(() => {
    setCanCopy(typeof navigator !== "undefined" && !!navigator.clipboard);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // A denied clipboard permission is not worth an error state: the
      // address is right there to select.
      setCopied(false);
    }
  }

  return (
    <span
      data-role="copy-email"
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
    >
      {/* overflow-wrap keeps the 33-character address inside a 390px column. */}
      <span className="text-[15px] font-semibold text-heading [overflow-wrap:anywhere]">
        {email}
      </span>
      {canCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-[28px] shrink-0 items-center rounded-pill border border-hairline-strong px-3 py-1 text-[13px] font-semibold text-body transition-colors hover:border-heading hover:text-heading focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
        >
          {copied ? "Copied" : "Copy"}
          <span className="sr-only"> {label} address</span>
        </button>
      ) : null}
      {/* Announced on copy without moving focus or relying on the label swap. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${label} address copied` : ""}
      </span>
    </span>
  );
}
