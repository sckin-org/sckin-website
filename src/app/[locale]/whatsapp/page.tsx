import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/1a5Yf7KbHJvhUVlSU4VJaqBFkXX6xmUA_7yjEOe_5hOI/viewform";

export const metadata: Metadata = {
  title: "SickleCellPedia on WhatsApp",
  description:
    "Key documents and links for people using SickleCellPedia on WhatsApp.",
  robots: { index: false, follow: false },
};

const LINK_CLASS =
  "inline-block rounded-pill border border-hairline-strong px-5 py-2.5 text-[15px] font-semibold text-heading transition-colors hover:border-heading";

/**
 * Unlisted landing page for WhatsApp users — the bot's welcome message links
 * here for its terms. Unlisted means: noindex, absent from site navigation,
 * and never listed in a sitemap; anyone with the URL can still view it, and
 * the normal site chrome (header/footer) renders via the locale layout.
 */
export default function WhatsappPage() {
  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="whatsapp" className="mx-auto max-w-[720px]">
        <PageHeader
          title="SickleCellPedia on WhatsApp"
          subhead="Key documents and links for people using SickleCellPedia on WhatsApp."
        />
        <ul data-role="ctas" className="mt-8 flex flex-wrap gap-3">
          <li>
            <Link href="/privacy" data-role="cta" className={LINK_CLASS}>
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" data-role="cta" className={LINK_CLASS}>
              User Agreement
            </Link>
          </li>
          <li>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-role="cta"
              className={LINK_CLASS}
            >
              Give us feedback ↗
            </a>
          </li>
        </ul>
      </article>
    </div>
  );
}
