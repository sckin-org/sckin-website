"use client";

import { useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/forms";
import type { FormField } from "@/lib/content";

/**
 * Reusable, unstyled submission form. Renders fields declared in frontmatter,
 * posts them as JSON to `endpoint`, and manages submit state:
 *  - success  → shows the confirmation message
 *  - error    → shows an inline error with a fallback email (never a dead end)
 *
 * Server-side validation is authoritative (see the route handler); the HTML5
 * `required` attributes here are only a UX convenience. Built to be shared by
 * both Contact and the future SickleCellPedia Pro lead-capture form.
 */
interface Props {
  endpoint: string;
  fields: FormField[];
  submitLabel?: string;
  confirmation?: string;
  fallbackEmail: string;
}

type Status = "idle" | "submitting" | "success" | "error";

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
      <div data-role="form-confirmation" role="status">
        <p>{confirmation ?? "Thanks — your message has been sent."}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-role="submission-form">
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
          <p key={field.name}>
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              required={field.required}
            />{" "}
            <label htmlFor={field.name}>
              {field.label}
              {field.required ? " *" : ""}
            </label>
            {field.link ? (
              <>
                {" "}
                <a href={field.link.href}>{field.link.label}</a>
              </>
            ) : null}
          </p>
        ) : (
        <p key={field.name}>
          <label htmlFor={field.name}>
            {field.label}
            {field.required ? " *" : ""}
          </label>
          <br />
          {field.type === "textarea" ? (
            <textarea id={field.name} name={field.name} required={field.required} />
          ) : field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              defaultValue=""
            >
              {/* Empty leading option so `required` is meaningful — nothing is
                  pre-selected. */}
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
            />
          )}
        </p>
        )
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-describedby={status === "error" ? "submission-error" : undefined}
      >
        {status === "submitting" ? "Sending…" : submitLabel ?? "Send"}
      </button>

      {status === "error" ? (
        <p id="submission-error" data-role="form-error" role="alert">
          Something went wrong sending your message. Please email us directly at{" "}
          <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>.
        </p>
      ) : null}
    </form>
  );
}
