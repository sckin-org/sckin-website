/**
 * Shared donation constants and copy.
 *
 * Lives outside the route files because App Router route handlers may only
 * export HTTP methods and route config — and the EIN / receipt language is
 * needed by the donate page, the success page, and (once wired) the
 * acknowledgment email sent from the Stripe webhook.
 */

export const SCKIN_EIN = "33-1763512";

/**
 * IRS-compliant donation acknowledgment language.
 * Used by the (to be wired) Kit email send in the Stripe webhook handler.
 */
export function acknowledgmentText(
  amountUsd: string,
  dateStr: string,
  recurring: boolean,
) {
  return [
    `Thank you for your ${recurring ? "monthly " : ""}donation of $${amountUsd} to the Sickle Cell Knowledge and Information Network (SCKIN) on ${dateStr}.`,
    ``,
    `SCKIN is a tax-exempt public charity under Section 501(c)(3) of the Internal Revenue Code (EIN ${SCKIN_EIN}). No goods or services were provided in exchange for this contribution. Your donation is tax-deductible to the extent permitted by law. Please retain this acknowledgment for your tax records.`,
    ``,
    `Your support keeps reliable sickle cell disease information free and universally accessible.`,
  ].join("\n");
}
