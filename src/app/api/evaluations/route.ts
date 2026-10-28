import { createSubmissionHandler } from "@/lib/submission-handler";
import { EVALUATION_FIELDS } from "@/lib/form-specs";
import { appendEvaluationRow } from "@/lib/sheets";
import { sendEvaluationEmails } from "@/lib/email";

/**
 * /evaluations rater sign-up → the "evaluations" tab of the contacts
 * spreadsheet (same shared pipeline and WIF credentials as /api/ascat), then
 * two Resend emails: the rating-form link to the rater and a notification to
 * the study lead. The row is saved first; an email failure is logged and
 * reported as `emailed: false` but never fails the submission — the
 * confirmation state shows the form link either way.
 */
export const POST = createSubmissionHandler({
  formType: "evaluations",
  fields: EVALUATION_FIELDS,
  persist: async (clean) => {
    await appendEvaluationRow(clean);
    return { emailed: await sendEvaluationEmails(clean) };
  },
});
