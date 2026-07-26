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
      className="flex min-h-[70vh] items-center justify-center px-4 py-10"
    >
      <div className="max-w-[520px] text-center">
        <div
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-pill bg-input-error-bg text-[26px] font-semibold text-heading-accent"
        >
          ✓
        </div>
        <h1 className="mt-6 text-[28px] font-semibold tracking-(--tracking-tight) text-heading">
          Thank you for your gift.
        </h1>
        <p className="mt-3 text-[17px] leading-(--line-height-body) text-body text-pretty">
          Your donation keeps reliable sickle cell disease information free and
          universally accessible. A receipt has been sent to your email address
          — please retain it for your tax records.
        </p>
        <p className="mt-5 text-[13px] leading-[1.6] text-muted text-pretty">
          The Sickle Cell Knowledge and Information Network (SCKIN) is a
          tax-exempt public charity under Section 501(c)(3) of the Internal
          Revenue Code. EIN {SCKIN_EIN}. No goods or services were provided in
          exchange for this contribution.
        </p>
        <Link
          href="/"
          className="mt-7 inline-block text-[17px] font-semibold text-link transition-colors hover:text-link-hover"
        >
          Return to sckin.org →
        </Link>
      </div>
    </div>
  );
}
