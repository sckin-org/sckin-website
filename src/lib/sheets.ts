/**
 * Server-only bridge to the Google Apps Script Web App that appends form
 * submissions to a Google Sheet (and, for the contact form, emails the team).
 *
 * DO NOT import this from a client component. It reads process.env and the
 * webhook URL is a secret — anyone holding it can append rows, so it must never
 * reach client JS. Forms post to our own `/api/*` route; the route calls this.
 *
 * When GOOGLE_SHEETS_WEBHOOK_URL is unset, this throws SheetsConfigError; the
 * route maps that to a 500 and the form shows its graceful error state with the
 * fallback email — never a blank page.
 */

/** Thrown when the Sheets webhook URL is not configured. */
export class SheetsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SheetsConfigError";
  }
}

export interface SheetSubmission {
  /** Routes the row to the right sheet tab in the Apps Script handler. */
  formType: string;
  /** Cleaned, validated field values (honeypot already stripped). */
  fields: Record<string, string>;
}

export async function submitToSheet(submission: SheetSubmission): Promise<void> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) {
    throw new SheetsConfigError("GOOGLE_SHEETS_WEBHOOK_URL is not set");
  }

  // Apps Script Web Apps commonly answer with a 302 to a googleusercontent.com
  // URL; fetch follows redirects by default, so we read the final response.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formType: submission.formType, ...submission.fields }),
  });

  if (!res.ok) {
    throw new Error(`Sheets webhook responded ${res.status}`);
  }
}
