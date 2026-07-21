import Link from "next/link";
import { DEFAULT_LOCALE, localizedHref, type Locale } from "@/lib/i18n";

/**
 * Site footer — structure only, visual design arrives with the Claude Design
 * handoff. Per master doc v3.1: contact email, footer links (About · News ·
 * Feedback, plus the legal pages required by the Meta app review), and the
 * Facebook + LinkedIn socials.
 *
 * /whatsapp is deliberately NOT linked here — it is an unlisted landing page
 * (see the requirements tracker, 2026-07-19). Internal links go through
 * `localizedHref` so English stays unprefixed and a future locale prefixes
 * automatically; mailto/social links pass through.
 */
export default function SiteFooter({
  locale = DEFAULT_LOCALE,
}: {
  locale?: Locale;
}) {
  const href = (path: string) => localizedHref(path, locale);

  return (
    <footer data-component="site-footer">
      <p>
        SCKIN — Sickle Cell Knowledge and Information Network. A 501(c)(3)
        nonprofit.
      </p>
      <p>
        <a href="mailto:contact@sckin.org">contact@sckin.org</a>
      </p>
      <ul>
        <li>
          <Link href={href("/about")}>About</Link>
        </li>
        <li>
          <Link href={href("/news")}>News</Link>
        </li>
        <li>
          <Link href={href("/feedback")}>Feedback</Link>
        </li>
        <li>
          <Link href={href("/privacy")}>Privacy</Link>
        </li>
        <li>
          <Link href={href("/terms")}>Terms</Link>
        </li>
      </ul>
      <ul data-role="social">
        <li>
          <a
            href="https://www.facebook.com/profile.php?id=61561436170933"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
        </li>
        <li>
          {/* TODO: confirm the company slug spelling — "knowlege" is as
              written in the master doc; keep if that is the actual URL. */}
          <a
            href="https://www.linkedin.com/company/sickle-cell-knowlege-and-information-network/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </li>
      </ul>
    </footer>
  );
}
