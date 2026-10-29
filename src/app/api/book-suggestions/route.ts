import { createSubmissionHandler } from "@/lib/submission-handler";
import { BOOK_SUGGESTION_FIELDS } from "@/lib/form-specs";
import { appendBookSuggestionRow } from "@/lib/sheets";

/**
 * "Suggest a book" (/resources/books) → the "book_suggestions" tab of the
 * contacts spreadsheet, via the shared pipeline (rate limit, honeypot,
 * Turnstile, validation) and the same WIF credentials as the other tabs.
 * Nothing is emailed and no reply is promised; suggestions are reviewed in
 * the sheet.
 */
export const POST = createSubmissionHandler({
  formType: "book-suggestions",
  fields: BOOK_SUGGESTION_FIELDS,
  persist: appendBookSuggestionRow,
});
