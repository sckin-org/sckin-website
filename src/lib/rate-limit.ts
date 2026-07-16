/**
 * Best-effort, in-memory rate limiter for form route handlers.
 *
 * IMPORTANT: this is per-instance. On serverless (Vercel Functions / Fluid
 * Compute) the Map lives only in one running instance's memory: it resets when
 * the instance recycles and is NOT shared across concurrent instances. That is
 * an intentional trade-off — it deters casual abuse and accidental double
 * submits without a shared store (Redis/KV), which we avoid to keep the stack
 * vanilla and portable. It is not a hard guarantee against a determined
 * attacker; the honeypot and server-side validation are the other layers.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

/**
 * Returns true if the request is allowed, false if the caller has exceeded
 * `limit` requests within `windowMs`. `key` is typically `formType:ip`.
 */
export function checkRateLimit(
  key: string,
  limit = MAX_REQUESTS,
  windowMs = WINDOW_MS
): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);
  return true;
}
