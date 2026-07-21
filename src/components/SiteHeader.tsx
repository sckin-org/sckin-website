"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_ITEMS, DONATE_CTA } from "@/lib/nav";
import { DEFAULT_LOCALE, localizedHref, type Locale } from "@/lib/i18n";

/**
 * Site header — structure only, visual design arrives with the Claude Design
 * handoff. Dropdowns render as plain nested lists for now.
 *
 * Mobile: the nav list collapses behind a hamburger toggle below the `md`
 * breakpoint (disclosure button with aria-expanded/aria-controls); any click
 * inside the list closes it again. Desktop always shows the full nav.
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
  const [open, setOpen] = useState(false);
  const href = (path: string) => localizedHref(path, locale);

  return (
    <header data-component="site-header">
      <nav aria-label="Primary">
        <Link href={href("/")} data-role="logo" onClick={() => setOpen(false)}>
          SCKIN
        </Link>

        <button
          type="button"
          className="md:hidden"
          data-role="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>

        <ul
          id="primary-nav"
          className={open ? undefined : "hidden md:block"}
          onClick={() => setOpen(false)}
        >
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
