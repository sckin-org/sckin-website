/**
 * Server-authoritative field specs for the submission forms, plus the mapping
 * from each form's fields onto the contacts-sheet row schema (src/lib/sheets.ts).
 * These are the source of truth for validation in the route handlers — never
 * trust the field list the client rendered. Field `name`s must match the
 * frontmatter field names in the corresponding content/*.md file.
 *
 * Pure data + pure functions (no server-only imports — the ContactRow import
 * is type-only) so it stays cheap to import anywhere.
 */
import type { FieldSpec } from "@/lib/forms";
import type { ContactRow } from "@/lib/sheets";

/** Reason options for the Contact form — kept in sync with content/contact.md. */
export const CONTACT_REASONS = [
  "Press or media",
  "Partnership or collaboration",
  "Volunteering",
  "Research or clinical evaluation",
  "Something else",
] as const;

export const CONTACT_FIELDS: FieldSpec[] = [
  { name: "name", required: true, type: "text" },
  { name: "email", required: true, type: "email" },
  { name: "organization", required: false, type: "text" },
  { name: "country", required: false, type: "text" },
  { name: "reason", required: true, type: "select", options: [...CONTACT_REASONS] },
  { name: "message", required: true, type: "textarea" },
];

/**
 * Contact messages land in the same combined tab. Reason/organization/message
 * fold into `notes` (the schema is a contacts superset, not an inbox — keep
 * every field, don't shoehorn organization into `role`).
 */
export function contactToRow(clean: Record<string, string>): ContactRow {
  const notes =
    `[${clean.reason}] ${clean.message}` +
    (clean.organization ? `\n\nOrganization: ${clean.organization}` : "");
  return {
    source: "contact",
    full_name: clean.name,
    email: clean.email,
    country: clean.country || undefined,
    notes,
    // Writing to us and asking for a reply IS the consent to be contacted.
    consent: true,
  };
}

/** SickleCellPedia Pro "register your interest" — master doc v3.1 field set. */
export const PRO_FIELDS: FieldSpec[] = [
  { name: "full_name", required: true, type: "text" },
  { name: "email", required: true, type: "email" },
  {
    name: "is_healthcare_professional",
    required: true,
    type: "select",
    options: ["Yes", "No"],
  },
  { name: "role", required: false, type: "text" },
  { name: "country", required: true, type: "text" },
  { name: "city_region", required: false, type: "text" },
  { name: "notes", required: false, type: "textarea" },
  // Checkbox: unchecked never reaches the server (absent → required error),
  // so a stored row always has consent = true.
  { name: "consent", required: true, type: "checkbox" },
];

export function proLeadToRow(clean: Record<string, string>): ContactRow {
  return {
    source: "pro_interest",
    full_name: clean.full_name,
    email: clean.email,
    is_healthcare_professional: clean.is_healthcare_professional === "Yes",
    role: clean.role || undefined,
    country: clean.country,
    city_region: clean.city_region || undefined,
    notes: clean.notes || undefined,
    consent: clean.consent !== "",
  };
}

/** "I am a…" options on the /ascat form — kept in sync with AscatForm. */
export const ASCAT_ROLES = [
  "Clinician or researcher",
  "Patient organisation",
  "Patient or family member",
  "Other",
] as const;

/** Evaluation-language options on the /ascat form. */
export const ASCAT_LANGUAGES = [
  "English",
  "French",
  "English and French",
] as const;

/**
 * ASCAT 2026 contact & sign-up form (/ascat). Checkboxes arrive as "on" when
 * ticked and are absent otherwise (FormData semantics, same as PRO consent).
 * evaluation_language is optional on the server even though the client
 * requires it when the evaluator box is ticked — a missing language is a
 * follow-up question, not a reason to lose a contact at a conference booth.
 */
export const ASCAT_FIELDS: FieldSpec[] = [
  { name: "role", required: true, type: "select", options: [...ASCAT_ROLES] },
  { name: "name", required: true, type: "text", maxLength: 200 },
  { name: "email", required: true, type: "email", maxLength: 254 },
  { name: "profession", required: false, type: "text", maxLength: 200 },
  { name: "organisation", required: false, type: "text", maxLength: 300 },
  { name: "website", required: false, type: "text", maxLength: 300 },
  { name: "evaluator", required: false, type: "checkbox" },
  {
    name: "evaluation_language",
    required: false,
    type: "select",
    options: [...ASCAT_LANGUAGES],
  },
  { name: "organisation_interest", required: false, type: "checkbox" },
  { name: "newsletter", required: false, type: "checkbox" },
  { name: "message", required: false, type: "textarea", maxLength: 5000 },
];

/** Home email signup — email only; name/HCP/country are optional per source. */
export const NEWSLETTER_FIELDS: FieldSpec[] = [
  { name: "email", required: true, type: "email" },
];

export function newsletterToRow(clean: Record<string, string>): ContactRow {
  return {
    source: "newsletter",
    email: clean.email,
    // Submitting the signup form IS the consent to receive the newsletter.
    consent: true,
  };
}
