"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HONEYPOT_FIELD } from "@/lib/forms";
import { ASCAT_ROLES, ASCAT_LANGUAGES } from "@/lib/form-specs";
import type { Cta } from "@/lib/content";

/**
 * ASCAT 2026 sign-up form (/ascat). Bespoke rather than SubmissionForm:
 * the "I am a…" pill group, role-dependent placeholders, conditionally
 * revealed fields and per-choice success copy don't fit the declarative
 * frontmatter field list. Posts JSON to /api/ascat (server validation is
 * authoritative, as everywhere).
 *
 * Mobile-first: visitors arrive from a QR code on a phone — 16px inputs
 * (no iOS zoom), ≥44px touch targets, visible focus rings.
 *
 * The "Two ways to work with us" cards link to #form-evaluator /
 * #form-organisation — real anchors at the top of the form card, so the
 * browser scrolls there natively; this component listens for the same
 * hashes and pre-selects the matching options.
 */

type Role = (typeof ASCAT_ROLES)[number];

type Status = "idle" | "submitting" | "success" | "error";

const FALLBACK_EMAIL = "contact@sckin.org";

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-page px-4 py-3 text-[16px] text-heading outline-none transition-colors focus:border-hairline-strong focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2";

const PROFESSION_PLACEHOLDERS: Partial<Record<Role, string>> = {
  "Clinician or researcher": "e.g. Haematologist, nurse, pharmacist",
  "Patient organisation": "e.g. Programme director",
};

function RequiredMark() {
  return <span className="text-heading-accent"> *</span>;
}

export default function AscatForm({ linkedin }: { linkedin: Cta }) {
  const [role, setRole] = useState<Role>("Clinician or researcher");
  const [evaluator, setEvaluator] = useState(false);
  const [orgInterest, setOrgInterest] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  // Snapshot of the organisation box at the moment the submit succeeded —
  // drives the success copy after the form itself is gone. (An evaluator
  // variant linking the EN/FR rating forms belongs here once those URLs
  // exist.)
  const [sentOrgInterest, setSentOrgInterest] = useState(false);

  useEffect(() => {
    // Scrolling is not handled here: the hashes are real anchors at the top
    // of the form card, reached natively on a deep link and by next/link on
    // a card click. This effect only pre-selects the matching options. The
    // click listener is needed because Link navigates via pushState, which
    // fires neither hashchange nor popstate.
    function applyIntent(hash: string) {
      if (hash === "#form-evaluator") {
        setRole("Clinician or researcher");
        setEvaluator(true);
      } else if (hash === "#form-organisation") {
        setRole("Patient organisation");
        setOrgInterest(true);
      }
    }
    function onHashChange() {
      applyIntent(window.location.hash);
    }
    function onClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest?.(
        'a[href*="#form-"]'
      );
      if (anchor instanceof HTMLAnchorElement) applyIntent(anchor.hash);
    }
    applyIntent(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const res = await fetch("/api/ascat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setSentOrgInterest(orgInterest);
      setStatus("success");
    } catch {
      // Non-2xx and network errors both land here; entered values are kept.
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div data-role="form-confirmation" role="status">
        <h3 className="text-[19px] font-semibold text-heading">
          Thank you. We have your details.
        </h3>
        <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
          One of us will reply by email after the conference.
        </p>
        {sentOrgInterest ? (
          <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
            We will be in touch to learn about your community and how
            SickleCellPedia could fit on your website.
          </p>
        ) : null}
        <a
          href={linkedin.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-[44px] items-center rounded-pill border border-cta px-5 py-2.5 text-[15px] font-semibold text-heading-accent transition-colors hover:bg-cta hover:text-on-band hover:no-underline focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
        >
          {linkedin.label}
        </a>
      </div>
    );
  }

  const showOrgFields = role === "Patient organisation" || orgInterest;
  const professionPlaceholder = PROFESSION_PLACEHOLDERS[role];

  return (
    <form
      onSubmit={handleSubmit}
      data-role="ascat-form"
      className="flex flex-col gap-4"
    >
      {/* Honeypot: hidden from people, bots that fill everything trip it. */}
      <div hidden aria-hidden="true">
        <label htmlFor={`ascat-${HONEYPOT_FIELD}`}>Leave this field empty</label>
        <input
          id={`ascat-${HONEYPOT_FIELD}`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <fieldset>
        <legend className="mb-2 block text-[14px] font-semibold text-heading">
          I am a…
        </legend>
        <div className="flex flex-wrap gap-2">
          {ASCAT_ROLES.map((option) => (
            <label
              key={option}
              className={`inline-flex min-h-[44px] cursor-pointer items-center rounded-pill border px-4 py-2 text-[15px] font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-(--color-cta) has-[:focus-visible]:ring-offset-2 ${
                role === option
                  ? "border-cta bg-cta text-on-band"
                  : "border-input bg-page text-body hover:border-hairline-strong"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option}
                checked={role === option}
                onChange={() => setRole(option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="ascat-name"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Name
          <RequiredMark />
        </label>
        <input
          id="ascat-name"
          name="name"
          type="text"
          required
          maxLength={200}
          autoComplete="name"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="ascat-email"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Email
          <RequiredMark />
        </label>
        <input
          id="ascat-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="ascat-profession"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Profession or role
        </label>
        <input
          id="ascat-profession"
          name="profession"
          type="text"
          maxLength={200}
          placeholder={professionPlaceholder}
          autoComplete="organization-title"
          className={INPUT_CLASS}
        />
      </div>

      {showOrgFields ? (
        <>
          <div>
            <label
              htmlFor="ascat-organisation"
              className="mb-1.5 block text-[14px] font-semibold text-heading"
            >
              Organisation
            </label>
            <input
              id="ascat-organisation"
              name="organisation"
              type="text"
              maxLength={300}
              autoComplete="organization"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label
              htmlFor="ascat-website"
              className="mb-1.5 block text-[14px] font-semibold text-heading"
            >
              Website
            </label>
            <input
              id="ascat-website"
              name="website"
              type="text"
              maxLength={300}
              autoComplete="url"
              className={INPUT_CLASS}
            />
          </div>
        </>
      ) : null}

      <fieldset>
        <legend className="mb-1 block text-[14px] font-semibold text-heading">
          How would you like to be involved?
        </legend>

        <label
          htmlFor="ascat-evaluator"
          className="flex cursor-pointer items-start gap-3 py-2"
        >
          <input
            id="ascat-evaluator"
            name="evaluator"
            type="checkbox"
            checked={evaluator}
            onChange={(e) => setEvaluator(e.target.checked)}
            className="mt-[3px] h-5 w-5 shrink-0 accent-(--color-cta) focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
          />
          <span className="text-[14px] leading-[1.5] text-body">
            <span className="font-semibold text-heading">
              Volunteer as an evaluator.
            </span>{" "}
            Rate AI answers to patient questions for our research. For
            clinicians and researchers.
          </span>
        </label>

        {evaluator ? (
          <div className="mb-1 ml-8">
            <label
              htmlFor="ascat-evaluation-language"
              className="mb-1.5 block text-[14px] font-semibold text-heading"
            >
              I can evaluate answers in
              <RequiredMark />
            </label>
            <select
              id="ascat-evaluation-language"
              name="evaluation_language"
              required
              defaultValue=""
              className={INPUT_CLASS}
            >
              <option value="" disabled>
                Select…
              </option>
              {ASCAT_LANGUAGES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <label
          htmlFor="ascat-organisation-interest"
          className="flex cursor-pointer items-start gap-3 py-2"
        >
          <input
            id="ascat-organisation-interest"
            name="organisation_interest"
            type="checkbox"
            checked={orgInterest}
            onChange={(e) => setOrgInterest(e.target.checked)}
            className="mt-[3px] h-5 w-5 shrink-0 accent-(--color-cta) focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
          />
          <span className="text-[14px] leading-[1.5] text-body">
            <span className="font-semibold text-heading">
              Offer SickleCellPedia through our organisation.
            </span>{" "}
            Talk to us about adding it to your website. For patient
            organisations.
          </span>
        </label>

        <label
          htmlFor="ascat-newsletter"
          className="flex cursor-pointer items-start gap-3 py-2"
        >
          <input
            id="ascat-newsletter"
            name="newsletter"
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-[3px] h-5 w-5 shrink-0 accent-(--color-cta) focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
          />
          <span className="text-[14px] leading-[1.5] text-body">
            <span className="font-semibold text-heading">
              Send me the SCKIN newsletter.
            </span>{" "}
            Occasional updates on our research and tools. Unsubscribe at any
            time.
          </span>
        </label>
      </fieldset>

      <div>
        <label
          htmlFor="ascat-message"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Message
        </label>
        <textarea
          id="ascat-message"
          name="message"
          rows={4}
          maxLength={5000}
          placeholder="A question, an idea, or how you would like to work with us"
          className={`${INPUT_CLASS} resize-y`}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-describedby={status === "error" ? "ascat-form-error" : undefined}
        className="mt-1 min-h-[44px] rounded-pill bg-cta py-3.5 text-center text-[17px] font-semibold text-on-band transition-colors hover:bg-cta-hover focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send"}
      </button>

      {status === "error" ? (
        <p
          id="ascat-form-error"
          data-role="form-error"
          role="alert"
          className="text-center text-[14px] font-semibold text-error"
        >
          Something went wrong. Please try again, or email us at{" "}
          <a href={`mailto:${FALLBACK_EMAIL}`} className="underline">
            {FALLBACK_EMAIL}
          </a>
          .
        </p>
      ) : null}

      <p className="text-[13px] leading-[1.5] text-muted">
        We use your details only to reply to you and for the options you tick.
        We never share them.{" "}
        <Link
          href="/privacy"
          className="font-semibold text-link transition-colors hover:text-link-hover"
        >
          Privacy policy
        </Link>
      </p>
    </form>
  );
}
