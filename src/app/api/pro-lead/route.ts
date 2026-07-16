import { createSubmissionHandler } from "@/lib/submission-handler";
import { PRO_FIELDS } from "@/lib/form-specs";

/**
 * SickleCellPedia Pro "register your interest" form → Google Sheet
 * (tab: "pro-lead") via the Apps Script webhook. Same shared pattern as
 * /api/contact. Kept out of the [locale] segment — API routes are never
 * localized.
 */
export const POST = createSubmissionHandler({
  formType: "pro-lead",
  fields: PRO_FIELDS,
});
