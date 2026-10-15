"use client";

import { useState } from "react";
import Link from "next/link";
import { HONEYPOT_FIELD } from "@/lib/forms";
import { SCDAA_ROLES } from "@/lib/form-specs";

/**
 * SCDAA 2026 stay-in-touch form (/scdaa). Follows AscatForm's structure —
 * "I am a…" pills, involvement checkboxes, honeypot, JSON POST, server
 * validation authoritative — but is a separate component rather than a
 * variant: the audience, field set and copy all differ, and a shared
 * component with two role lists and two checkbox sets would be harder to
 * read than two flat ones.
 *
 * Differences from ASCAT, all deliberate:
 *  - six roles, defaulting to "Patient or family member" (this audience is
 *    mostly patients, families and community-based organizations)
 *  - every field is always visible: no conditional organization fields, no
 *    evaluation-language select, no #form-* hash pre-selection (nothing on
 *    this page deep-links into a pre-filled state)
 *  - a `try_product` option, and `newsletter` ticked by default
 *  - one success message, not a per-choice variant
 *  - US spelling ("organization")
 *
 * Mobile-first: visitors arrive from the poster's QR code on a phone — 16px
 * inputs (no iOS zoom), ≥44px touch targets, visible focus rings.
 */

type Role = (typeof SCDAA_ROLES)[number];

type Status = "idle" | "submitting" | "success" | "error";

const FALLBACK_EMAIL = "zacharie.liman.tinguiri@sckin.org";

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-page px-4 py-3 text-[16px] text-heading outline-none transition-colors focus:border-hairline-strong focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2";

/** Checkbox options, in the order the brief fixes them. */
const INVOLVE_OPTIONS = [
  {
    name: "try_product",
    lead: "Try SickleCellPedia and share feedback.",
    body: "Tell us what worked and what did not. For patients, families and anyone curious.",
  },
  {
    name: "org_interest",
    lead: "Bring SickleCellPedia to my organization.",
    body: "Offered to all non-profits on a pay-what-you-can basis. For CBOs and patient organizations.",
  },
  {
    name: "evaluator",
    lead: "Volunteer as an evaluator.",
    body: "Rate AI answers to patient questions for our research. For clinicians and researchers.",
  },
  {
    name: "newsletter",
    lead: "Send me the SCKIN newsletter.",
    body: "Occasional updates on our research and tools. Unsubscribe at any time.",
  },
] as const;

function RequiredMark() {
  return <span className="text-heading-accent"> *</span>;
}

export default function ScdaaForm() {
  const [role, setRole] = useState<Role>("Patient or family member");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const res = await fetch("/api/scdaa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
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
          We will be in touch about the options you ticked.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-role="scdaa-form"
      className="flex flex-col gap-4"
    >
      {/* Honeypot: hidden from people, bots that fill everything trip it. */}
      <div hidden aria-hidden="true">
        <label htmlFor={`scdaa-${HONEYPOT_FIELD}`}>Leave this field empty</label>
        <input
          id={`scdaa-${HONEYPOT_FIELD}`}
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
          {SCDAA_ROLES.map((option) => (
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
          htmlFor="scdaa-name"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Name
          <RequiredMark />
        </label>
        <input
          id="scdaa-name"
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
          htmlFor="scdaa-email"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Email
          <RequiredMark />
        </label>
        <input
          id="scdaa-email"
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
          htmlFor="scdaa-organization"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Organization
        </label>
        <input
          id="scdaa-organization"
          name="organization"
          type="text"
          maxLength={300}
          autoComplete="organization"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="scdaa-profession"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Role or profession
        </label>
        <input
          id="scdaa-profession"
          name="profession"
          type="text"
          maxLength={200}
          autoComplete="organization-title"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="scdaa-city-state"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          City and state
        </label>
        <input
          id="scdaa-city-state"
          name="city_state"
          type="text"
          maxLength={200}
          placeholder="Charlotte, NC"
          autoComplete="address-level2"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="scdaa-website"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Website (organizations)
        </label>
        <input
          id="scdaa-website"
          name="website"
          type="text"
          maxLength={300}
          autoComplete="url"
          className={INPUT_CLASS}
        />
      </div>

      <fieldset>
        <legend className="mb-1 block text-[14px] font-semibold text-heading">
          How would you like to be involved?
        </legend>
        {INVOLVE_OPTIONS.map((option) => (
          <label
            key={option.name}
            htmlFor={`scdaa-${option.name}`}
            className="flex cursor-pointer items-start gap-3 py-2"
          >
            <input
              id={`scdaa-${option.name}`}
              name={option.name}
              type="checkbox"
              // The newsletter box is the one pre-ticked option (per the
              // brief); the rest are opt-in. Uncontrolled: nothing on this
              // page needs to read or set them after mount.
              defaultChecked={option.name === "newsletter"}
              className="mt-[3px] h-5 w-5 shrink-0 accent-(--color-cta) focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
            />
            <span className="text-[14px] leading-[1.5] text-body">
              <span className="font-semibold text-heading">{option.lead}</span>{" "}
              {option.body}
            </span>
          </label>
        ))}
      </fieldset>

      <div>
        <label
          htmlFor="scdaa-message"
          className="mb-1.5 block text-[14px] font-semibold text-heading"
        >
          Message
        </label>
        <textarea
          id="scdaa-message"
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
        aria-describedby={status === "error" ? "scdaa-form-error" : undefined}
        className="mt-1 min-h-[44px] rounded-pill bg-cta py-3.5 text-center text-[17px] font-semibold text-on-band transition-colors hover:bg-cta-hover focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send"}
      </button>

      {status === "error" ? (
        <p
          id="scdaa-form-error"
          data-role="form-error"
          role="alert"
          className="text-center text-[14px] font-semibold text-error"
        >
          Something went wrong. Please try again, or email us at{" "}
          <a
            href={`mailto:${FALLBACK_EMAIL}`}
            className="underline [overflow-wrap:anywhere]"
          >
            {FALLBACK_EMAIL}
          </a>
          .
        </p>
      ) : null}

      {/* text-body, not text-muted: #7D7D85 is ~4.1:1 on white, under the
          4.5:1 WCAG AA floor for 13px text. */}
      <p className="text-[13px] leading-[1.5] text-body">
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
