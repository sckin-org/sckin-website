import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support SCKIN, a 501(c)(3) nonprofit making sickle cell disease information universally accessible.",
};

/**
 * Donations. A custom Stripe checkout is wired here during the payments
 * integration handoff. Placeholder only.
 */
export default function DonatePage() {
  return (
    <article data-page="donate">
      <h1>Support SCKIN</h1>
      <p>
        SCKIN is a 501(c)(3) nonprofit. Your donation helps make useful,
        reliable information about sickle cell disease universally accessible.
      </p>
      <div data-embed="stripe-checkout">
        {/* Custom Stripe checkout mounts here. */}
        <p>Secure checkout coming soon.</p>
      </div>
    </article>
  );
}
