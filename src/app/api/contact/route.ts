import { createSubmissionHandler } from "@/lib/submission-handler";
import { CONTACT_FIELDS } from "@/lib/form-specs";

/**
 * Contact form → Google Sheet (tab: "contact") via the Apps Script webhook.
 * The Apps Script handler also emails contact@sckin.org with the reason in the
 * subject line (see docs/apps-script-endpoint.js). Kept out of the [locale]
 * segment — API routes are never localized.
 */
export const POST = createSubmissionHandler({
  formType: "contact",
  fields: CONTACT_FIELDS,
});
