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

/**
 * Strip the spaces and hyphens people type into ISBNs ("978-0-19-…") and
 * upper-case a trailing check digit "x". Returns the bare digits, valid or not.
 */
export function normalizeIsbn(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

/**
 * Checksum-validate an ISBN-10 (weights 10…1, mod 11, "X" = 10 in the last
 * place only) or ISBN-13 (weights 1,3,1,3…, mod 10). Pass it through
 * normalizeIsbn first.
 */
export function isValidIsbn(isbn: string): boolean {
  if (/^\d{9}[\dX]$/.test(isbn)) {
    const sum = [...isbn].reduce(
      (acc, ch, i) => acc + (ch === "X" ? 10 : Number(ch)) * (10 - i),
      0
    );
    return sum % 11 === 0;
  }
  if (/^\d{13}$/.test(isbn)) {
    const sum = [...isbn].reduce(
      (acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3),
      0
    );
    return sum % 10 === 0;
  }
  return false;
}

/** Server-side validation spec for a single field. */
export interface FieldSpec {
  name: string;
  required?: boolean;
  /** "email", "integer" (whole number in min–max) and "isbn" (ISBN-10 or
   * -13, checksum-validated after normalizeIsbn) are checked; other types
   * only get the required / options / maxLength checks. */
  type?: string;
  /** Allowed values for a select — submissions outside this set are rejected. */
  options?: string[];
  /** Upper bound on string length — oversized submissions are rejected. */
  maxLength?: number;
  /** Bounds for an "integer" field. `max: "currentYear"` is resolved at
   * validation time, so a long-lived instance stays right across New Year. */
  min?: number;
  max?: number | "currentYear";
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
    if (spec.type === "integer") {
      const text = String(value);
      const max =
        spec.max === "currentYear" ? new Date().getUTCFullYear() : spec.max;
      const n = Number(text);
      if (
        !/^\d+$/.test(text) ||
        (spec.min !== undefined && n < spec.min) ||
        (max !== undefined && n > max)
      ) {
        errors.push(`${spec.name} is out of range`);
      }
    }
    if (
      spec.type === "isbn" &&
      typeof value === "string" &&
      !isValidIsbn(normalizeIsbn(value))
    ) {
      errors.push(`${spec.name} must be a valid ISBN-10 or ISBN-13`);
    }
    if (spec.options && typeof value === "string" && !spec.options.includes(value)) {
      errors.push(`${spec.name} is not a valid option`);
    }
    if (
      spec.maxLength !== undefined &&
      typeof value === "string" &&
      value.length > spec.maxLength
    ) {
      errors.push(`${spec.name} is too long`);
    }
  }
  return errors;
}
