/**
 * Shared submission route-handler factory. Both the Contact and SickleCellPedia
 * Pro forms use this one pattern — do not fork a second approach.
 *
 * Server-only (imports the Sheets bridge + reads request headers). The pipeline:
 *   rate limit → parse JSON → honeypot → server-side validation → append to
 *   the Google Sheet via the Apps Script webhook.
 *
 * ALWAYS returns JSON (never an HTML error page) so the client can render its
 * inline error state with a fallback email instead of a blank page.
 */
import { NextResponse } from "next/server";
import { HONEYPOT_FIELD, validateSubmission, type FieldSpec } from "@/lib/forms";
import { submitToSheet } from "@/lib/sheets";
import { checkRateLimit } from "@/lib/rate-limit";

export function createSubmissionHandler(opts: {
  formType: string;
  fields: FieldSpec[];
}) {
  return async function POST(request: Request) {
    try {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown";
      if (!checkRateLimit(`${opts.formType}:${ip}`)) {
        return NextResponse.json(
          { error: "Too many submissions. Please try again in a minute." },
          { status: 429 }
        );
      }

      let values: Record<string, unknown>;
      try {
        values = await request.json();
      } catch {
        return NextResponse.json(
          { error: "Invalid request body." },
          { status: 400 }
        );
      }

      // Honeypot: a filled hidden field means a bot. Acknowledge success and
      // silently drop, so bots get no signal they were caught.
      const trap = values[HONEYPOT_FIELD];
      if (typeof trap === "string" && trap.trim() !== "") {
        return NextResponse.json({ ok: true });
      }

      const errors = validateSubmission(opts.fields, values);
      if (errors.length > 0) {
        return NextResponse.json(
          { error: "Please check the form and try again.", details: errors },
          { status: 400 }
        );
      }

      // Whitelist to spec'd fields (drops honeypot and anything unexpected).
      const clean: Record<string, string> = {};
      for (const field of opts.fields) {
        clean[field.name] = String(values[field.name] ?? "").trim();
      }

      await submitToSheet({ formType: opts.formType, fields: clean });

      return NextResponse.json({ ok: true });
    } catch {
      // Includes SheetsConfigError (webhook not configured). Never leak a stack
      // trace or HTML page — the client shows the fallback email.
      return NextResponse.json(
        { error: "We couldn't send your message right now." },
        { status: 500 }
      );
    }
  };
}
