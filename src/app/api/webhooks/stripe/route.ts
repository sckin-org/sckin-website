import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Instantiated lazily so `next build` doesn't require the secret key.
let stripeClient: Stripe | undefined;
function getStripe(): Stripe {
  return (stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY!));
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
      const recurring = session.mode === "subscription";
      const dateStr = new Date(event.created * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // TODO: send acknowledgment email via Kit (or transactional provider).
      // Body: acknowledgmentText(amount, dateStr, recurring) from "@/lib/donations"
      console.log(
        `[donation] checkout completed: ${email} $${amount} ${recurring ? "monthly" : "one-time"}`,
      );
      break;
    }

    case "invoice.paid": {
      // Recurring renewal (months 2+). First payment is covered by
      // checkout.session.completed above; skip the first invoice to
      // avoid double acknowledgment.
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason === "subscription_cycle") {
        const email = invoice.customer_email;
        const amount = ((invoice.amount_paid ?? 0) / 100).toFixed(2);
        const dateStr = new Date(event.created * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        // TODO: send renewal acknowledgment via Kit.
        // Body: acknowledgmentText(amount, dateStr, true) from "@/lib/donations"
        console.log(`[donation] renewal: ${email} $${amount}`);
      }
      break;
    }

    case "invoice.payment_failed": {
      // Stripe Smart Retries + built-in dunning emails handle recovery.
      // Log for visibility.
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`[donation] payment failed for ${invoice.customer_email}`);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
