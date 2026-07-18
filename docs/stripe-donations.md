# SCKIN Donations — Stripe Integration

Stripe-powered donations for `sckin-website` (Next.js App Router). All
vanilla Next.js; no Vercel-proprietary features.

## Files

| File | Purpose |
|---|---|
| `scripts/stripe-seed.mjs` | Creates the Stripe catalog: product "Donation to SCKIN" + 6 prices with lookup keys (`monthly_10/20/50`, `once_25/50/100`). Idempotent. |
| `scripts/stripe-webhook-setup.mjs` | Creates the webhook endpoint and pipes its signing secret straight into `vercel env add` (never displayed). Deletes + recreates if the endpoint exists. |
| `src/app/[locale]/donate/page.tsx` | Donate page (server wrapper carrying metadata). |
| `src/app/[locale]/donate/DonateForm.tsx` | Interactive donate form (client component). Monthly default with $20 pre-selected, one-time tiers, custom amount, monthly-upsell nudge. |
| `src/app/[locale]/donate/donate.module.css` | Styles. All visual decisions are CSS variables at the top of `.wrap` — swap values during the design-token pass. |
| `src/app/api/checkout/route.ts` | Creates Checkout Sessions. Tiers resolve by lookup key; custom amounts use ad-hoc `price_data`. `subscription` mode for monthly, `payment` for one-time. |
| `src/app/api/webhooks/stripe/route.ts` | Signature-verified webhook. Handles `checkout.session.completed`, `invoice.paid` (renewals only, no double receipts), `invoice.payment_failed`. Acknowledgment email is stubbed (`TODO: Kit`). |
| `src/lib/donations.ts` | Shared EIN constant (33-1763512) and IRS-compliant `acknowledgmentText` receipt language, ready for the Kit email wiring. |
| `src/app/[locale]/donate/success/page.tsx` | Post-checkout thank-you with tax receipt language. |

## Setup sequence

1. `npm install stripe`
2. Env vars (already in Vercel; mirror in `.env.local`):
   - `STRIPE_SECRET_KEY` (test key for now)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET` (added in step 4)
3. Seed the catalog: `STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-seed.mjs`
4. Webhook endpoint:
   - Local dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
     (prints a `whsec_...` — that's your local `STRIPE_WEBHOOK_SECRET`)
   - Deployed (scripted; done 2026-07-17 for test mode):
     ```
     node --env-file=.env.local scripts/stripe-webhook-setup.mjs \
       | vercel env add STRIPE_WEBHOOK_SECRET production --force
     ```
     Defaults to `https://sckin-website.vercel.app/api/webhooks/stripe`;
     override with `WEBHOOK_URL=https://www.sckin.org/api/webhooks/stripe`
     after the domain cutover. Events: `checkout.session.completed`,
     `invoice.paid`, `invoice.payment_failed`. (Dashboard alternative:
     Developers → Webhooks → Add endpoint, then copy the signing secret
     into Vercel as `STRIPE_WEBHOOK_SECRET`.)
5. Test mode end-to-end: card `4242 4242 4242 4242`, any future expiry, any
   CVC. Run one one-time and one monthly donation; confirm webhook logs.
6. Customer portal (recurring donors self-serve): dashboard → Settings →
   Billing → Customer portal → enable cancel/update payment method.
   (A portal link route can be added later; Stripe's emailed receipts
   include portal access if enabled.)

## Go-live (after Stripe account review clears)

1. Re-run the seed script with the live key.
2. Swap `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` values
   in Vercel to the live pair. Names unchanged; no code changes.
3. Create the live-mode webhook endpoint (step 4 above); update
   `STRIPE_WEBHOOK_SECRET`.
4. Real $1 donation as final verification, then refund it from the dashboard.

## Deliberately deferred

- Kit acknowledgment-email wiring (webhook TODOs mark the spots; the IRS
  language is written and exported as `acknowledgmentText` in
  `src/lib/donations.ts`)
- Design-token restyle (CSS variables isolate it)
- Customer-portal link on the site
- Apple Pay / Google Pay (automatic in Checkout once domain is verified in
  Stripe dashboard → Settings → Payment methods)
