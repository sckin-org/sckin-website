"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HONEYPOT_FIELD } from "@/lib/forms";
import TurnstileWidget, {
  turnstileEnabled,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import {
  EVALUATION_FORM_LINKS,
  EVALUATION_LANGUAGES,
  EVALUATION_REFERRERS,
  EVALUATION_STAGES,
  type EvaluationLanguage,
} from "@/lib/form-specs";

/**
 * SickleCellPedia evaluation sign-up form (/evaluations). Bespoke like
 * AscatForm (same styling, honeypot and Turnstile) because its success state
 * hands the rater their rating-form link straight away. Posts JSON to
 * /api/evaluations; server validation is authoritative.
 *
 * "Referred by" is prefilled from ?ref= (see EVALUATION_REFERRERS). It is
 * read from window.location in an effect, as AscatForm reads its hash —
 * useSearchParams would need a Suspense boundary on this static page.
 */

type Status = "idle" | "submitting" | "success" | "error";

const STUDY_EMAIL = "zacharie.liman.tinguiri@sckin.org";

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-page px-4 py-3 text-[16px] text-heading outline-none transition-colors focus:border-hairline-strong focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2";

const LABEL_CLASS = "mb-1.5 block text-[14px] font-semibold text-heading";

function RequiredMark() {
  return <span className="text-heading-accent"> *</span>;
}

export default function EvaluationsForm() {
  const [language, setLanguage] = useState<EvaluationLanguage>("English");
  const [referredBy, setReferredBy] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [emailed, setEmailed] = useState(false);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // No site key (bare `next dev`) means no token is required.
  const verified = !turnstileEnabled || turnstileToken !== null;

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref")?.trim();
    if (ref) {
      setReferredBy(EVALUATION_REFERRERS[ref.toLowerCase()] ?? ref.slice(0, 300));
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      const body = (await res.json()) as { emailed?: boolean };
      setEmailed(body.emailed === true);
      setStatus("success");
    } catch {
      // Non-2xx and network errors both land here; entered values are kept.
      // The token was spent (or rejected) — fetch a fresh one for a retry.
      turnstileRef.current?.reset();
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div data-role="form-confirmation" role="status">
        <h3 className="text-[19px] font-semibold text-heading">
          Thank you for signing up.
        </h3>
        <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
          Here is your evaluation form ({language}). It takes about 2 hours,
          and you can work through it at your own pace.
          {emailed ? " We’ve also emailed it to you." : null}
        </p>
        <a
          href={EVALUATION_FORM_LINKS[language]}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-[44px] items-center rounded-pill bg-cta px-5 py-2.5 text-[15px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:text-on-band hover:no-underline focus-visible:no-underline focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
        >
          Open the evaluation form
        </a>
        <p className="mt-5 text-[14px] leading-[1.5] text-body text-pretty">
          Questions? Write to{" "}
          <a href={`mailto:${STUDY_EMAIL}`} className="underline">
            {STUDY_EMAIL}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-role="evaluations-form"
      className="flex flex-col gap-4"
    >
      {/* Honeypot: hidden from people, bots that fill everything trip it. */}
      <div hidden aria-hidden="true">
        <label htmlFor={`evaluations-${HONEYPOT_FIELD}`}>
          Leave this field empty
        </label>
        <input
          id={`evaluations-${HONEYPOT_FIELD}`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="evaluations-name" className={LABEL_CLASS}>
          Name
          <RequiredMark />
        </label>
        <input
          id="evaluations-name"
          name="name"
          type="text"
          required
          maxLength={200}
          autoComplete="name"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="evaluations-email" className={LABEL_CLASS}>
          Email
          <RequiredMark />
        </label>
        <input
          id="evaluations-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="evaluations-stage" className={LABEL_CLASS}>
          Stage
          <RequiredMark />
        </label>
        <select
          id="evaluations-stage"
          name="stage"
          required
          defaultValue=""
          className={INPUT_CLASS}
        >
          <option value="" disabled>
            Select…
          </option>
          {EVALUATION_STAGES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="evaluations-qualification" className={LABEL_CLASS}>
          Medical qualification
        </label>
        <input
          id="evaluations-qualification"
          name="qualification"
          type="text"
          maxLength={200}
          placeholder="e.g. MBBS, MD"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="evaluations-institution" className={LABEL_CLASS}>
          Institution
        </label>
        <input
          id="evaluations-institution"
          name="institution"
          type="text"
          maxLength={300}
          autoComplete="organization"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="evaluations-language" className={LABEL_CLASS}>
          Evaluation language
          <RequiredMark />
        </label>
        <select
          id="evaluations-language"
          name="evaluation_language"
          required
          value={language}
          onChange={(e) => setLanguage(e.target.value as EvaluationLanguage)}
          className={INPUT_CLASS}
        >
          {EVALUATION_LANGUAGES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="evaluations-referred-by" className={LABEL_CLASS}>
          Referred by
        </label>
        <input
          id="evaluations-referred-by"
          name="referred_by"
          type="text"
          maxLength={300}
          value={referredBy}
          onChange={(e) => setReferredBy(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <label
        htmlFor="evaluations-newsletter"
        className="flex cursor-pointer items-start gap-3 py-2"
      >
        <input
          id="evaluations-newsletter"
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

      <div>
        <label htmlFor="evaluations-message" className={LABEL_CLASS}>
          Message
        </label>
        <textarea
          id="evaluations-message"
          name="message"
          rows={4}
          maxLength={5000}
          className={`${INPUT_CLASS} resize-y`}
        />
      </div>

      <TurnstileWidget ref={turnstileRef} onTokenChange={setTurnstileToken} />

      <button
        type="submit"
        disabled={status === "submitting" || !verified}
        aria-describedby={
          status === "error" ? "evaluations-form-error" : undefined
        }
        className="mt-1 min-h-[44px] rounded-pill bg-cta py-3.5 text-center text-[17px] font-semibold text-on-band transition-colors hover:bg-cta-hover focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Sign up"}
      </button>

      {status === "error" ? (
        <p
          id="evaluations-form-error"
          data-role="form-error"
          role="alert"
          className="text-center text-[14px] font-semibold text-error"
        >
          Something went wrong. Please try again, or email us at{" "}
          <a href={`mailto:${STUDY_EMAIL}`} className="underline">
            {STUDY_EMAIL}
          </a>
          .
        </p>
      ) : null}

      <p className="text-[13px] leading-[1.5] text-body">
        We use your details only to run this study and for the options you
        tick. We never share them.{" "}
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
