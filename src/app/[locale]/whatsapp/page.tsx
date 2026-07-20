import type { Metadata } from "next";
import Link from "next/link";

const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/1a5Yf7KbHJvhUVlSU4VJaqBFkXX6xmUA_7yjEOe_5hOI/viewform";

export const metadata: Metadata = {
  title: "SickleCellPedia on WhatsApp",
  description:
    "Key documents and links for people using SickleCellPedia on WhatsApp.",
  robots: { index: false, follow: false },
};

/**
 * Unlisted landing page for WhatsApp users — the bot's welcome message links
 * here for its terms. Unlisted means: noindex, absent from site navigation,
 * and never listed in a sitemap; anyone with the URL can still view it, and
 * the normal site chrome (header/footer) renders via the locale layout.
 */
export default function WhatsappPage() {
  return (
    <article data-page="whatsapp">
      <h1>SickleCellPedia on WhatsApp</h1>
      <p>
        Key documents and links for people using SickleCellPedia on WhatsApp.
      </p>
      <ul data-role="ctas">
        <li>
          <Link href="/privacy" data-role="cta">
            Privacy Policy
          </Link>
        </li>
        <li>
          <Link href="/terms" data-role="cta">
            User Agreement
          </Link>
        </li>
        <li>
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-role="cta"
          >
            Give us feedback
          </a>
        </li>
      </ul>
    </article>
  );
}
