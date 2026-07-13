import Link from "next/link";

/**
 * Placeholder site footer. Structure only — no visual design yet.
 */
export default function SiteFooter() {
  return (
    <footer data-component="site-footer">
      <p>
        SCKIN — Sickle Cell Knowledge and Information Network. A 501(c)(3)
        nonprofit.
      </p>
      <ul>
        <li>
          <Link href="/mission">Mission</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/responsible-ai">Responsible AI</Link>
        </li>
        <li>
          <Link href="/publications">Publications</Link>
        </li>
        <li>
          <Link href="/news">News</Link>
        </li>
        <li>
          <Link href="/donate">Donate</Link>
        </li>
        <li>
          <Link href="/whatsapp">WhatsApp</Link>
        </li>
        <li>
          <Link href="/feedback">Feedback</Link>
        </li>
      </ul>
    </footer>
  );
}
