/**
 * Pure form utilities shared by the client form component and the server route
 * handlers. This module has NO server-only dependencies (no `fs`, no
 * nodemailer) so it is safe to import from client components.
 *
 * The Contact and (future) SickleCellPedia Pro lead-capture forms both post
 * JSON to a Next.js route handler, which validates with `validateSubmission`
 * and mails via src/lib/mailer.ts.
 */

/**
 * Hidden field name used for spam protection. Humans never see it; bots that
 * fill every input trip it. Both the client form (renders it hidden) and the
 * route handler (rejects when non-empty) reference this constant.
 */
export const HONEYPOT_FIELD = "company_website";

/** Minimal, permissive email check — server-side gate, not RFC validation. */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Server-side validation spec for a single field. */
export interface FieldSpec {
  name: string;
  required?: boolean;
  type?: string;
  /** Allowed values for a select — submissions outside this set are rejected. */
  options?: string[];
}

/**
 * Validate submitted values against a field spec. Returns a list of
 * human-readable error strings; an empty list means the submission is valid.
 * Authoritative: never trust the client to have validated.
 */
export function validateSubmission(
  specs: FieldSpec[],
  values: Record<string, unknown>
): string[] {
  const errors: string[] = [];
  for (const spec of specs) {
    const raw = values[spec.name];
    const value = typeof raw === "string" ? raw.trim() : raw;
    const empty = value === undefined || value === null || value === "";

    if (spec.required && empty) {
      errors.push(`${spec.name} is required`);
      continue;
    }
    if (empty) continue;

    if (spec.type === "email" && typeof value === "string" && !isEmail(value)) {
      errors.push(`${spec.name} must be a valid email address`);
    }
    if (spec.options && typeof value === "string" && !spec.options.includes(value)) {
      errors.push(`${spec.name} is not a valid option`);
    }
  }
  return errors;
}
