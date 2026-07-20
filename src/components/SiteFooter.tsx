import Link from "next/link";
import { DEFAULT_LOCALE, localizedHref, type Locale } from "@/lib/i18n";

/**
 * Placeholder site footer. Structure only — no visual design yet.
 *
 * Internal links go through `localizedHref` so English stays unprefixed and a
 * future locale prefixes automatically; mailto/social links pass through.
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
          <Link href={href("/contact")}>Contact</Link>
        </li>
        <li>
          <Link href={href("/mission")}>Mission</Link>
        </li>
        <li>
          <Link href={href("/about")}>About</Link>
        </li>
        <li>
          <Link href={href("/responsible-ai")}>Responsible AI</Link>
        </li>
        <li>
          <Link href={href("/impact/publications")}>Publications</Link>
        </li>
        <li>
          <Link href={href("/news")}>News</Link>
        </li>
        <li>
          <Link href={href("/donate")}>Donate</Link>
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
            href="https://www.linkedin.com/company/PLACEHOLDER"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </li>
        <li>
          <a
            href="https://www.facebook.com/PLACEHOLDER"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
        </li>
        <li>
          <a
            href="https://wa.me/PLACEHOLDER"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </li>
      </ul>
    </footer>
  );
}
