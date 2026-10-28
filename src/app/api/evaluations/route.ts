import { createSubmissionHandler } from "@/lib/submission-handler";
import { EVALUATION_FIELDS } from "@/lib/form-specs";
import { appendEvaluationRow } from "@/lib/sheets";

/**
 * /evaluations rater sign-up → the "evaluations" tab of the contacts
 * spreadsheet, via the same shared pipeline and WIF credentials as
 * /api/ascat. The site sends no email: the sheet's Apps Script notifier
 * emails the study lead about each new row, and the rater gets their form
 * link on the confirmation screen and in a personal follow-up.
 */
export const POST = createSubmissionHandler({
  formType: "evaluations",
  fields: EVALUATION_FIELDS,
  persist: appendEvaluationRow,
});
