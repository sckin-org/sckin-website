/**
 * Seed the Stripe catalog for SCKIN donations.
 *
 * Creates one product ("Donation to SCKIN") and six prices identified by
 * lookup keys. Idempotent: safe to run repeatedly; existing lookup keys
 * are left untouched. Run against test mode first, then once against live
 * mode after account activation (swap the key in the environment).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-seed.mjs
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set.");
  process.exit(1);
}

const stripe = new Stripe(key);

const PRODUCT_NAME = "Donation to SCKIN";

const PRICES = [
  { lookup_key: "monthly_10", unit_amount: 1000, recurring: { interval: "month" } },
  { lookup_key: "monthly_20", unit_amount: 2000, recurring: { interval: "month" } },
  { lookup_key: "monthly_50", unit_amount: 5000, recurring: { interval: "month" } },
  { lookup_key: "once_25", unit_amount: 2500 },
  { lookup_key: "once_50", unit_amount: 5000 },
  { lookup_key: "once_100", unit_amount: 10000 },
];

async function main() {
  const mode = key.startsWith("sk_test") ? "TEST" : "LIVE";
  console.log(`Running against ${mode} mode.`);

  // Find or create the product
  let product = (
    await stripe.products.search({ query: `name:"${PRODUCT_NAME}" AND active:"true"` })
  ).data[0];

  if (product) {
    console.log(`Product exists: ${product.id}`);
  } else {
    product = await stripe.products.create({
      name: PRODUCT_NAME,
      description:
        "Tax-deductible charitable donation to the Sickle Cell Knowledge and Information Network (SCKIN), a 501(c)(3) nonprofit.",
      statement_descriptor: "SCKIN DONATION",
    });
    console.log(`Product created: ${product.id}`);
  }

  // Find existing prices by lookup key
  const existing = await stripe.prices.list({
    lookup_keys: PRICES.map((p) => p.lookup_key),
    limit: 100,
  });
  const existingKeys = new Set(existing.data.map((p) => p.lookup_key));

  for (const spec of PRICES) {
    if (existingKeys.has(spec.lookup_key)) {
      console.log(`Price exists, skipping: ${spec.lookup_key}`);
      continue;
    }
    const price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: spec.unit_amount,
      lookup_key: spec.lookup_key,
      ...(spec.recurring ? { recurring: spec.recurring } : {}),
    });
    console.log(`Price created: ${spec.lookup_key} -> ${price.id}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
