import { createSubmissionHandler } from "@/lib/submission-handler";
import { ASCAT_FIELDS } from "@/lib/form-specs";
import { appendAscatRow } from "@/lib/sheets";

/**
 * ASCAT 2026 sign-up form → the "ASCAT" tab of the contacts spreadsheet,
 * via the same shared pipeline and WIF credentials as /api/contact,
 * /api/pro-lead and /api/newsletter — never a parallel storage path. Only
 * the destination differs: a dedicated tab (one column per field) instead
 * of the combined contacts tab. Kept out of the [locale] segment — API
 * routes are never localized.
 */
export const POST = createSubmissionHandler({
  formType: "ascat",
  fields: ASCAT_FIELDS,
  persist: appendAscatRow,
});
