import Link from "next/link";
import { DEFAULT_LOCALE, localizedHref, type Locale } from "@/lib/i18n";
import NewsletterSignup from "@/components/NewsletterSignup";

/**
 * Site footer — the locked design: brand + newsletter signup, Explore and
 * Support link groups, legal bar (© · 501(c)(3) · EIN · Privacy · Terms).
 * The real social URLs carry over into the legal bar (the comp omits them;
 * the checklist requires them).
 *
 * /whatsapp is deliberately NOT linked — unlisted page (requirements tracker,
 * 2026-07-19). Publications is listed here while the nav's Impact ▾ item is
 * gated, so the route stays discoverable.
 */

const EXPLORE_LINKS = [
  { label: "About us", href: "/about" },
  { label: "SickleCellPedia", href: "/sicklecellpedia" },
  { label: "For clinicians", href: "/sicklecellpedia-pro" },
  { label: "Responsible AI", href: "/responsible-ai" },
  { label: "Impact", href: "/impact" },
  { label: "Publications", href: "/publications" },
  { label: "News and blog", href: "/news" },
];

const SUPPORT_LINKS = [
  { label: "Donate", href: "/donate" },
  { label: "Contact", href: "/contact" },
];

export default function SiteFooter({
  locale = DEFAULT_LOCALE,
}: {
  locale?: Locale;
}) {
  const href = (path: string) => localizedHref(path, locale);

  return (
    <footer
      data-component="site-footer"
      className="bg-footer px-6 pb-8 pt-14 md:px-12 md:pb-10 md:pt-20"
    >
      <div className="container-page">
        <div className="md:grid md:grid-cols-[1fr_180px_180px] md:gap-16">
          <div>
            <div className="text-[20px] font-semibold tracking-(--tracking-tight) text-on-footer-strong">
              SCKIN
            </div>
            <div className="mt-1.5 text-[14px] leading-normal text-on-footer-muted">
              Sickle Cell Knowledge and Information Network
            </div>
            <div className="mt-7 md:mt-8">
              <div className="text-[15px] font-semibold text-on-footer-strong">
                Get sickle cell news in your inbox
              </div>
              <NewsletterSignup />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 md:contents">
            <nav aria-label="Explore" className="flex flex-col gap-3 md:mt-0">
              <div className="overline-label text-on-footer-muted">Explore</div>
              {EXPLORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={href(link.href)}
                  className="text-[15px] text-on-footer transition-colors hover:text-on-footer-strong"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <nav aria-label="Support" className="flex flex-col gap-3 md:mt-0">
              <div className="overline-label text-on-footer-muted">Support</div>
              {SUPPORT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={href(link.href)}
                  className="text-[15px] text-on-footer transition-colors hover:text-on-footer-strong"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="mailto:contact@sckin.org"
                className="text-[15px] text-on-footer transition-colors hover:text-on-footer-strong"
              >
                Partner with us
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-white/12 pt-5 text-[13px] text-on-footer-muted md:mt-16 md:pt-6">
          <div>
            © {new Date().getFullYear()} SCKIN · 501(c)(3) · EIN 33-1763512
          </div>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=61561436170933"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-on-footer-strong"
            >
              Facebook
            </a>
            {/* TODO: confirm the company slug spelling — "knowlege" is as
                written in the master doc; keep if that is the actual URL. */}
            <a
              href="https://www.linkedin.com/company/sickle-cell-knowlege-and-information-network/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-on-footer-strong"
            >
              LinkedIn
            </a>
            <Link
              href={href("/privacy")}
              className="transition-colors hover:text-on-footer-strong"
            >
              Privacy
            </Link>
            <Link
              href={href("/terms")}
              className="transition-colors hover:text-on-footer-strong"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
