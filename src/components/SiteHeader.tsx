import Link from "next/link";
import { NAV_ITEMS, DONATE_CTA } from "@/lib/nav";
import { DEFAULT_LOCALE, localizedHref, type Locale } from "@/lib/i18n";

/**
 * Placeholder site header. Structure only — no visual design yet.
 * Dropdowns are rendered as plain nested lists; the design handoff will turn
 * `About ▾` / `Responsible AI ▾` into real menus.
 *
 * Links are built through `localizedHref`, so English stays unprefixed today
 * and a future locale (e.g. /fr) prefixes automatically. A locale switcher can
 * drop into this nav without structural changes.
 */
export default function SiteHeader({
  locale = DEFAULT_LOCALE,
}: {
  locale?: Locale;
}) {
  const href = (path: string) => localizedHref(path, locale);

  return (
    <header data-component="site-header">
      <nav aria-label="Primary">
        <Link href={href("/")} data-role="logo">
          SCKIN
        </Link>

        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={href(item.href)}>
                {item.label}
                {item.children ? " ▾" : ""}
              </Link>
              {item.children ? (
                <ul>
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={href(child.href)}>{child.label}</Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>

        <Link href={href(DONATE_CTA.href)} data-role="cta">
          {DONATE_CTA.label}
        </Link>
      </nav>
    </header>
  );
}
