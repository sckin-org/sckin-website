"use client";

import { useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/forms";
import type { FormField } from "@/lib/content";

/**
 * Reusable submission form, styled to the lead-form comp (Homepage.dc.html
 * §4c): labeled fields, red asterisks, rounded-md inputs, red pill submit,
 * and the centered success card. Renders fields declared in frontmatter,
 * posts them as JSON to `endpoint`, and manages submit state:
 *  - success  → shows the confirmation card
 *  - error    → shows an inline error with a fallback email (never a dead end)
 *
 * Server-side validation is authoritative (see the route handler); the HTML5
 * `required` attributes here are only a UX convenience. Shared by Contact and
 * the SickleCellPedia Pro lead-capture form.
 */
interface Props {
  endpoint: string;
  fields: FormField[];
  submitLabel?: string;
  confirmation?: string;
  fallbackEmail: string;
}

type Status = "idle" | "submitting" | "success" | "error";

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-page px-4 py-3 text-[16px] text-heading outline-none transition-colors focus:border-hairline-strong";

function RequiredMark() {
  return <span className="text-heading-accent"> *</span>;
}

export default function SubmissionForm({
  endpoint,
  fields,
  submitLabel,
  confirmation,
  fallbackEmail,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      // Both a non-2xx response and a network/thrown error land here.
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        data-role="form-confirmation"
        role="status"
        className="rounded-lg bg-subtle px-8 py-10 text-center"
      >
        <div
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-pill bg-input-error-bg text-[26px] font-semibold text-heading-accent"
        >
          ✓
        </div>
        <p className="mt-5 text-[15px] leading-(--line-height-body) text-body text-pretty">
          {confirmation ?? "Thanks — your message has been sent."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-role="submission-form"
      className="flex flex-col gap-3.5"
    >
      {/* Honeypot: hidden from people, bots that fill everything trip it. */}
      <div hidden aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {fields.map((field) =>
        field.type === "checkbox" ? (
          // Checkbox: control first, label inline after it (e.g. consent).
          <label
            key={field.name}
            htmlFor={field.name}
            className="flex cursor-pointer items-start gap-2.5 text-[14px] leading-[1.5] text-body"
          >
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              required={field.required}
              className="mt-[3px] accent-(--color-cta)"
            />
            <span>
              {field.label}
              {field.link ? (
                <>
                  {" "}
                  <a
                    href={field.link.href}
                    className="font-semibold text-link transition-colors hover:text-link-hover"
                  >
                    {field.link.label}
                  </a>
                </>
              ) : null}
              {field.required ? <RequiredMark /> : null}
            </span>
          </label>
        ) : (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-[14px] font-semibold text-heading"
            >
              {field.label}
              {field.required ? <RequiredMark /> : null}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                rows={4}
                className={`${INPUT_CLASS} resize-y`}
              />
            ) : field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                required={field.required}
                defaultValue=""
                className={INPUT_CLASS}
              >
                {/* Empty leading option so `required` is meaningful — nothing
                    is pre-selected. */}
                <option value="" disabled>
                  Select…
                </option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                className={INPUT_CLASS}
              />
            )}
          </div>
        )
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-describedby={status === "error" ? "submission-error" : undefined}
        className="mt-1.5 rounded-pill bg-cta py-3.5 text-center text-[17px] font-semibold text-on-band transition-colors hover:bg-cta-hover disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : (submitLabel ?? "Send")}
      </button>

      {status === "error" ? (
        <p
          id="submission-error"
          data-role="form-error"
          role="alert"
          className="text-center text-[14px] font-semibold text-error"
        >
          Something went wrong sending your message. Please email us directly
          at{" "}
          <a href={`mailto:${fallbackEmail}`} className="underline">
            {fallbackEmail}
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}
