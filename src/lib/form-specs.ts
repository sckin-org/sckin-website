/**
 * Server-authoritative field specs for the two submission forms. These are the
 * source of truth for validation in the route handlers — never trust the field
 * list the client rendered. Field `name`s must match the frontmatter field
 * names in the corresponding content/*.md file (and the emitted sheet columns).
 *
 * Pure data (no server-only imports) so it stays cheap to import anywhere.
 */
import type { FieldSpec } from "@/lib/forms";

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

export const PRO_FIELDS: FieldSpec[] = [
  { name: "name", required: true, type: "text" },
  { name: "email", required: true, type: "email" },
  { name: "role", required: true, type: "text" },
  { name: "institution", required: false, type: "text" },
  { name: "country", required: true, type: "text" },
  { name: "interest", required: false, type: "textarea" },
];
