import { createSubmissionHandler } from "@/lib/submission-handler";
import { PRO_FIELDS, proLeadToRow } from "@/lib/form-specs";

/**
 * SickleCellPedia Pro "register your interest" form → contacts Google Sheet
 * (source: pro_interest) via the service account. Same shared pattern as
 * /api/contact and /api/newsletter. Kept out of the [locale] segment — API
 * routes are never localized.
 */
export const POST = createSubmissionHandler({
  formType: "pro-lead",
  fields: PRO_FIELDS,
  toRow: proLeadToRow,
});
