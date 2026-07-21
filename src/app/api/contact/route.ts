import { createSubmissionHandler } from "@/lib/submission-handler";
import { CONTACT_FIELDS, contactToRow } from "@/lib/form-specs";

/**
 * Contact form → contacts Google Sheet (source: contact) via the service
 * account; reason/organization/message fold into the row's `notes`. Kept out
 * of the [locale] segment — API routes are never localized.
 *
 * TODO: the retired Apps Script webhook also emailed contact@sckin.org on each
 * contact message; that notification needs a new home (e.g. a Sheets-driven
 * Apps Script trigger or an email API) — tracked in the requirements checklist.
 */
export const POST = createSubmissionHandler({
  formType: "contact",
  fields: CONTACT_FIELDS,
  toRow: contactToRow,
});
