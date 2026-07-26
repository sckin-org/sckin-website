import type { Metadata } from "next";
import DonateWidget from "@/components/DonateWidget";
import { SCKIN_EIN } from "@/lib/donations";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support SCKIN, a 501(c)(3) nonprofit making sickle cell disease information universally accessible.",
};

/**
 * Donations — the same DonateWidget as the homepage band (annex: one shared
 * component), hosted in a red card so the white-on-red look is identical.
 * One-time $25 is the default per the 2026-07-22 decision.
 */
export default function DonatePage() {
  return (
    <div data-page="donate" className="px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-[720px]">
        <p className="overline-label text-muted">Support Our Work</p>
        <h1 className="mt-4 text-(length:--font-size-h1) font-semibold leading-(--line-height-tight) tracking-(--tracking-tight) text-heading text-pretty">
          Keep reliable sickle cell information free for everyone.
        </h1>
        <p className="mt-4 text-[17px] leading-(--line-height-body) text-body text-pretty md:mt-6 md:text-[19px]">
          Your gift sustains SickleCellPedia and everything it takes to build,
          improve, and share it worldwide.
        </p>

        <div className="mt-10 rounded-lg bg-band p-6 md:p-10">
          <DonateWidget />
        </div>

        <p className="mt-6 text-[13px] leading-[1.6] text-muted">
          {/* Verbatim tax note from the master doc — keep the wording exact. */}
          The Sickle Cell Knowledge and Information Network is a 501(c)(3)
          not-for-profit organization (EIN {SCKIN_EIN}). Donations are
          tax-deductible to the extent permitted by law.
          <br />
          Payments securely processed by Stripe. Monthly gifts can be changed
          or canceled anytime.
        </p>
      </div>
    </div>
  );
}
