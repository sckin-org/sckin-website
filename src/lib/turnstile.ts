/**
 * Cloudflare Turnstile — server-side token verification.
 *
 * Every form route runs this inside `createSubmissionHandler`, after the
 * honeypot and before validation. The client widget (src/components/
 * TurnstileWidget.tsx) injects its token into the form as the hidden
 * `cf-turnstile-response` input, so it rides along in the JSON payload with
 * no per-form plumbing; the handler's field whitelist drops it before the row
 * is written.
 *
 * Why server-side matters: the bot traffic that prompted this (Aug–Oct 2026,
 * ~18 runs, 36 junk rows in the contacts tab) posted straight to /api/contact
 * and /api/pro-lead without rendering the page, so the honeypot never existed
 * for it. Only a check the route itself enforces can stop that.
 *
 * Env:
 *  - TURNSTILE_SECRET_KEY — server only. Production: the "SCKIN website
 *    forms" widget's secret. Preview + Development: Cloudflare's always-pass
 *    test secret `1x0000000000000000000000000000000AA`.
 *  - NEXT_PUBLIC_TURNSTILE_SITE_KEY — the matching public site key, read by
 *    the client widget.
 *
 * Missing secret: in production that is a misconfiguration and the request is
 * rejected (fail closed — the form shows its fallback email). Outside
 * production (`next dev` with no env) verification is skipped with a warning
 * so local work is not blocked.
 */

export const TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; reason: string };

export async function verifyTurnstile(
  token: unknown,
  ip: string | null
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.VERCEL_ENV === "production") {
      console.error(
        "[turnstile] TURNSTILE_SECRET_KEY is not set in production — rejecting submission"
      );
      return { ok: false, reason: "not_configured" };
    }
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (non-production)"
    );
    return { ok: true, skipped: true };
  }

  if (typeof token !== "string" || token.trim() === "") {
    return { ok: false, reason: "missing_token" };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5_000),
    });
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (data.success === true) return { ok: true };
    return {
      ok: false,
      reason: (data["error-codes"] ?? []).join(",") || "rejected",
    };
  } catch (error) {
    console.error("[turnstile] siteverify request failed", error);
    return { ok: false, reason: "siteverify_unreachable" };
  }
}
