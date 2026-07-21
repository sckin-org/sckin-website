/**
 * Shared submission route-handler factory. The SickleCellPedia Pro, newsletter,
 * and Contact forms all use this one pattern — do not fork a second approach.
 *
 * Server-only (imports the Sheets bridge + reads request headers). The pipeline:
 *   rate limit → parse JSON → honeypot → server-side validation → map to the
 *   contacts row schema → append to the Google Sheet via the service account.
 *
 * ALWAYS returns JSON (never an HTML error page). When the Sheets env vars are
 * not configured yet, the route logs a clear error and still acknowledges the
 * submission (ok:true, persisted:false) so the form shows its success state —
 * graceful in dev/preview, and the miss is visible in server logs.
 */
import { NextResponse } from "next/server";
import { HONEYPOT_FIELD, validateSubmission, type FieldSpec } from "@/lib/forms";
import {
  appendContactRow,
  SheetsConfigError,
  type ContactRow,
} from "@/lib/sheets";
import { checkRateLimit } from "@/lib/rate-limit";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export function createSubmissionHandler(opts: {
  formType: string;
  fields: FieldSpec[];
  /** Map validated, whitelisted values onto the contacts row schema. */
  toRow: (clean: Record<string, string>) => ContactRow;
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

      // Site is English-only today; when a locale switcher ships, thread the
      // page locale through the form payload instead of assuming the default.
      const row = { ...opts.toRow(clean), locale: DEFAULT_LOCALE };

      try {
        const { duplicate } = await appendContactRow(row);
        return NextResponse.json({ ok: true, duplicate });
      } catch (error) {
        if (error instanceof SheetsConfigError) {
          console.error(
            `[${opts.formType}] Sheets backend not configured — submission NOT persisted: ${error.message}`
          );
          return NextResponse.json({
            ok: true,
            persisted: false,
            error: "not_configured",
          });
        }
        throw error;
      }
    } catch (error) {
      // Never leak a stack trace or HTML page — the client shows the fallback
      // email. Log the cause so failures are diagnosable in Vercel logs.
      console.error(`[${opts.formType}] submission failed`, error);
      return NextResponse.json(
        { error: "We couldn't send your message right now." },
        { status: 500 }
      );
    }
  };
}
