import type { Metadata } from "next";
import Link from "next/link";
import { SCKIN_EIN } from "@/lib/donations";

export const metadata: Metadata = {
  title: "Thank you",
};

/** Post-checkout landing page; Stripe redirects here after a completed donation. */
export default function DonateSuccessPage() {
  return (
    <div
      data-page="donate-success"
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Thank you for your gift.</h1>
        <p style={{ fontSize: 16, marginBottom: 20 }}>
          Your donation keeps reliable sickle cell disease information free and universally
          accessible. A receipt has been sent to your email address — please retain it for your tax
          records.
        </p>
        <p style={{ fontSize: 13, color: "#6e6862", marginBottom: 28, lineHeight: 1.6 }}>
          The Sickle Cell Knowledge and Information Network (SCKIN) is a tax-exempt public charity
          under Section 501(c)(3) of the Internal Revenue Code. EIN {SCKIN_EIN}. No goods or
          services were provided in exchange for this contribution.
        </p>
        <Link href="/" style={{ fontWeight: 600 }}>
          Return to sckin.org →
        </Link>
      </div>
    </div>
  );
}
