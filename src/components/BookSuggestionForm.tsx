"use client";

import { useEffect, useRef, useState } from "react";
import { HONEYPOT_FIELD, isValidIsbn, normalizeIsbn } from "@/lib/forms";
import { BOOK_SUGGESTION_MIN_YEAR } from "@/lib/form-specs";
import TurnstileWidget, {
  turnstileEnabled,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import type { BookSuggestionCopy } from "@/lib/content";

/**
 * "Suggest a book" on /resources/books: a link-styled toggle that opens the
 * form inline (the site has no modals). Same styling, honeypot and Turnstile
 * as EvaluationsForm; posts JSON to /api/book-suggestions, where validation
 * is authoritative. Here the browser's own validation gives the messages:
 * required, maxLength, the year's min/max, and the ISBN checksum through
 * setCustomValidity.
 *
 * Email is optional. The newsletter box (unticked) appears only once an
 * email is typed, and unmounts with its value if the email is cleared — the
 * server also ignores it without an email.
 *
 * The form (and so Turnstile) mounts only once opened, which also means the
 * year's max is the visitor's current year, not the prerender's. Focus moves
 * to Title on open and to the confirmation on success, so it is never lost
 * when the form unmounts.
 */

type Status = "idle" | "submitting" | "success" | "error";

const FALLBACK_EMAIL = "contact@sckin.org";

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-page px-4 py-3 text-[16px] text-heading outline-none transition-colors focus:border-hairline-strong focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2";

const LABEL_CLASS = "mb-1.5 block text-[14px] font-semibold text-heading";

function RequiredMark() {
  return <span className="text-heading-accent"> *</span>;
}

export default function BookSuggestionForm({
  copy,
}: {
  copy: BookSuggestionCopy;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");
  const hasEmail = email.trim() !== "";
  const titleRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // No site key (bare `next dev`) means no token is required.
  const verified = !turnstileEnabled || turnstileToken !== null;

  useEffect(() => {
    if (open && status === "idle") titleRef.current?.focus();
  }, [open, status]);

  useEffect(() => {
    if (status === "success") confirmationRef.current?.focus();
  }, [status]);

  function checkIsbn(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value.trim();
    event.currentTarget.setCustomValidity(
      value && !isValidIsbn(normalizeIsbn(value)) ? copy.isbn_error : ""
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const res = await fetch("/api/book-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      // Non-2xx and network errors both land here; entered values are kept.
      // The token was spent (or rejected) — fetch a fresh one for a retry.
      turnstileRef.current?.reset();
      setStatus("error");
    }
  }

  return (
    <section data-role="suggest-book">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="suggest-book-panel"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-link transition-colors hover:text-link-hover focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
      >
        <span
          aria-hidden="true"
          className={`text-[18px] leading-none transition-transform ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
        {copy.link}
      </button>

      <div
        id="suggest-book-panel"
        hidden={!open}
        className="mt-3 rounded-lg border border-hairline-strong bg-page p-6 md:p-7"
      >
        {!open ? null : status === "success" ? (
          <div
            ref={confirmationRef}
            tabIndex={-1}
            data-role="form-confirmation"
            role="status"
            className="scroll-mt-24 text-[15px] leading-(--line-height-body) text-heading outline-none"
          >
            {hasEmail ? copy.success_with_email : copy.success}
          </div>
        ) : (
          <>
            <p className="text-[15px] leading-(--line-height-body) text-body text-pretty">
              {copy.intro}
            </p>
            <form
              onSubmit={handleSubmit}
              data-role="book-suggestion-form"
              className="mt-5 flex flex-col gap-4"
            >
              {/* Honeypot: hidden from people, bots that fill everything trip it. */}
              <div hidden aria-hidden="true">
                <label htmlFor={`suggest-${HONEYPOT_FIELD}`}>
                  Leave this field empty
                </label>
                <input
                  id={`suggest-${HONEYPOT_FIELD}`}
                  name={HONEYPOT_FIELD}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="suggest-title" className={LABEL_CLASS}>
                  {copy.title_label}
                  <RequiredMark />
                </label>
                <input
                  ref={titleRef}
                  id="suggest-title"
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  autoComplete="off"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="suggest-author" className={LABEL_CLASS}>
                  {copy.author_label}
                  <RequiredMark />
                </label>
                <input
                  id="suggest-author"
                  name="author"
                  type="text"
                  required
                  maxLength={200}
                  autoComplete="off"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="suggest-year" className={LABEL_CLASS}>
                    {copy.year_label}
                    <RequiredMark />
                  </label>
                  <input
                    id="suggest-year"
                    name="publication_year"
                    type="number"
                    required
                    min={BOOK_SUGGESTION_MIN_YEAR}
                    max={new Date().getFullYear()}
                    step={1}
                    inputMode="numeric"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="suggest-isbn" className={LABEL_CLASS}>
                    {copy.isbn_label}
                  </label>
                  <input
                    id="suggest-isbn"
                    name="isbn"
                    type="text"
                    maxLength={30}
                    inputMode="numeric"
                    autoComplete="off"
                    aria-describedby="suggest-isbn-hint"
                    onChange={checkIsbn}
                    className={INPUT_CLASS}
                  />
                  <p
                    id="suggest-isbn-hint"
                    className="mt-1.5 text-[13px] leading-[1.5] text-body"
                  >
                    {copy.isbn_hint}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="suggest-email" className={LABEL_CLASS}>
                  {copy.email_label}
                </label>
                <input
                  id="suggest-email"
                  name="email"
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  aria-describedby="suggest-email-hint"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
                <p
                  id="suggest-email-hint"
                  className="mt-1.5 text-[13px] leading-[1.5] text-body"
                >
                  {copy.email_hint}
                </p>
              </div>

              {hasEmail ? (
                <label
                  htmlFor="suggest-newsletter"
                  className="flex cursor-pointer items-start gap-3 py-1"
                >
                  <input
                    id="suggest-newsletter"
                    name="newsletter"
                    type="checkbox"
                    className="mt-[3px] h-5 w-5 shrink-0 accent-(--color-cta) focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
                  />
                  <span className="text-[14px] leading-[1.5] font-semibold text-heading">
                    {copy.newsletter_label}
                  </span>
                </label>
              ) : null}

              <TurnstileWidget
                ref={turnstileRef}
                onTokenChange={setTurnstileToken}
              />

              <button
                type="submit"
                disabled={status === "submitting" || !verified}
                aria-describedby={
                  status === "error" ? "suggest-form-error" : undefined
                }
                className="mt-1 min-h-[44px] rounded-pill bg-cta py-3.5 text-center text-[17px] font-semibold text-on-band transition-colors hover:bg-cta-hover focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {status === "submitting" ? copy.sending : copy.submit}
              </button>

              {status === "error" ? (
                <p
                  id="suggest-form-error"
                  data-role="form-error"
                  role="alert"
                  className="text-center text-[14px] font-semibold text-error"
                >
                  {copy.error}{" "}
                  <a href={`mailto:${FALLBACK_EMAIL}`} className="underline">
                    {FALLBACK_EMAIL}
                  </a>
                  .
                </p>
              ) : null}
            </form>
          </>
        )}
      </div>
    </section>
  );
}
