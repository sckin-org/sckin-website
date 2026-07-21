import { createSubmissionHandler } from "@/lib/submission-handler";
import { NEWSLETTER_FIELDS, newsletterToRow } from "@/lib/form-specs";

/**
 * Home email signup → contacts Google Sheet (source: newsletter) via the
 * service account. Same shared pattern as /api/contact and /api/pro-lead.
 * Kept out of the [locale] segment — API routes are never localized.
 */
export const POST = createSubmissionHandler({
  formType: "newsletter",
  fields: NEWSLETTER_FIELDS,
  toRow: newsletterToRow,
});
