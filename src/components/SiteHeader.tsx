import Link from "next/link";
import { NAV_ITEMS, DONATE_CTA } from "@/lib/nav";

/**
 * Placeholder site header. Structure only — no visual design yet.
 * Dropdowns are rendered as plain nested lists; the design handoff will turn
 * `About ▾` / `Responsible AI ▾` into real menus.
 */
export default function SiteHeader() {
  return (
    <header data-component="site-header">
      <nav aria-label="Primary">
        <Link href="/" data-role="logo">
          SCKIN
        </Link>

        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                {item.label}
                {item.children ? " ▾" : ""}
              </Link>
              {item.children ? (
                <ul>
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href}>{child.label}</Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>

        <Link href={DONATE_CTA.href} data-role="cta">
          {DONATE_CTA.label}
        </Link>
      </nav>
    </header>
  );
}
