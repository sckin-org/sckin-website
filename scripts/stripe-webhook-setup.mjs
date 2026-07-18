/**
 * Create (or recreate) the Stripe webhook endpoint for SCKIN donations.
 *
 * Prints ONLY the endpoint's signing secret to stdout so it can be piped
 * directly into `vercel env add` without the secret ever being displayed:
 *
 *   node --env-file=.env.local scripts/stripe-webhook-setup.mjs \
 *     | vercel env add STRIPE_WEBHOOK_SECRET production preview --force
 *
 * All progress logging goes to stderr. The signing secret is only returned
 * by Stripe at creation time, so if an endpoint with the target URL already
 * exists it is deleted and recreated (safe: re-run the pipe above so the
 * stored secret always matches). Override the target with WEBHOOK_URL, e.g.
 * WEBHOOK_URL=https://www.sckin.org/api/webhooks/stripe after the domain
 * cutover, and re-run with the live key at go-live.
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set.");
  process.exit(1);
}

const url =
  process.env.WEBHOOK_URL ?? "https://sckin-website.vercel.app/api/webhooks/stripe";

const EVENTS = ["checkout.session.completed", "invoice.paid", "invoice.payment_failed"];

const stripe = new Stripe(key);

const mode = key.startsWith("sk_test") ? "TEST" : "LIVE";
console.error(`Running against ${mode} mode; endpoint URL: ${url}`);

const existing = await stripe.webhookEndpoints.list({ limit: 100 });
for (const ep of existing.data) {
  if (ep.url === url) {
    console.error(`Endpoint already exists (${ep.id}); deleting to mint a fresh secret.`);
    await stripe.webhookEndpoints.del(ep.id);
  }
}

const endpoint = await stripe.webhookEndpoints.create({
  url,
  enabled_events: EVENTS,
  description: "SCKIN donations (created by scripts/stripe-webhook-setup.mjs)",
});

console.error(`Endpoint created: ${endpoint.id}`);
console.error("Signing secret written to stdout.");
process.stdout.write(endpoint.secret);
