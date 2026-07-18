import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Instantiated lazily so `next build` doesn't require the secret key.
let stripeClient: Stripe | undefined;
function getStripe(): Stripe {
  return (stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY!));
}

const TIER_LOOKUP_KEYS = new Set([
  "monthly_10",
  "monthly_20",
  "monthly_50",
  "once_25",
  "once_50",
  "once_100",
]);

const MIN_CUSTOM_USD = 1;
const MAX_CUSTOM_USD = 25000;

type Body = {
  frequency: "monthly" | "once";
  /** Lookup key for a suggested tier, e.g. "monthly_20" */
  lookupKey?: string;
  /** Whole-dollar custom amount when no tier was chosen */
  customAmount?: number;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { frequency, lookupKey, customAmount } = body;
  if (frequency !== "monthly" && frequency !== "once") {
    return NextResponse.json({ error: "Invalid frequency." }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const mode: Stripe.Checkout.SessionCreateParams.Mode =
    frequency === "monthly" ? "subscription" : "payment";

  let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;

  if (lookupKey) {
    // Suggested tier: resolve the catalog price by lookup key
    if (!TIER_LOOKUP_KEYS.has(lookupKey) || !lookupKey.startsWith(frequency === "monthly" ? "monthly" : "once")) {
      return NextResponse.json({ error: "Unknown donation tier." }, { status: 400 });
    }
    const prices = await getStripe().prices.list({ lookup_keys: [lookupKey], limit: 1 });
    const price = prices.data[0];
    if (!price) {
      return NextResponse.json(
        { error: "Donation tier not configured." },
        { status: 500 },
      );
    }
    lineItem = { price: price.id, quantity: 1 };
  } else {
    // Custom amount: ad-hoc price_data, no catalog entry needed
    const amount = Number(customAmount);
    if (!Number.isInteger(amount) || amount < MIN_CUSTOM_USD || amount > MAX_CUSTOM_USD) {
      return NextResponse.json({ error: "Invalid donation amount." }, { status: 400 });
    }
    lineItem = {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: amount * 100,
        product_data: { name: "Donation to SCKIN" },
        ...(frequency === "monthly" ? { recurring: { interval: "month" } } : {}),
      },
    };
  }

  const session = await getStripe().checkout.sessions.create({
    mode,
    line_items: [lineItem],
    success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/donate`,
    // Collect email for the acknowledgment letter; Stripe requires it anyway
    ...(mode === "payment"
      ? {
          submit_type: "donate" as const,
          customer_creation: "always" as const,
          payment_intent_data: { statement_descriptor: "SCKIN DONATION" },
        }
      : {}),
    metadata: { source: "sckin_donate_page" },
  });

  return NextResponse.json({ url: session.url });
}
