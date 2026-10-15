import { createSubmissionHandler } from "@/lib/submission-handler";
import { SCDAA_FIELDS } from "@/lib/form-specs";
import { appendScdaaRow } from "@/lib/sheets";

/**
 * SCDAA 2026 stay-in-touch form → the "scdaa" tab of the contacts
 * spreadsheet, via the same shared pipeline and WIF credentials as
 * /api/contact, /api/pro-lead, /api/newsletter and /api/ascat — never a
 * parallel storage path. Only the destination differs: a dedicated tab (one
 * column per field) instead of the combined contacts tab. Kept out of the
 * [locale] segment — API routes are never localized.
 *
 * appendScdaaRow verifies the tab's 13-column header row before its first
 * write and throws if it has drifted, so a reshuffled sheet fails loudly
 * instead of scattering contacts across the wrong columns.
 */
export const POST = createSubmissionHandler({
  formType: "scdaa",
  fields: SCDAA_FIELDS,
  persist: appendScdaaRow,
});
