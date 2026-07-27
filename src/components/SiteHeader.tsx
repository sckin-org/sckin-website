"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_ITEMS, DONATE_CTA } from "@/lib/nav";
import { DEFAULT_LOCALE, localizedHref, type Locale } from "@/lib/i18n";

/**
 * Site header — the locked design's slim single-row sticky nav: translucent
 * white with backdrop blur, monochrome links, the red Donate pill as the only
 * red element, and a reserved slot for the future language toggle.
 *
 * Desktop dropdowns open on hover and keyboard focus (focus-within), so every
 * child link stays tab-reachable without JS state. Mobile collapses behind the
 * hamburger; the Donate pill stays visible in the bar at all widths so the
 * primary CTA never hides (annex: hero CTA dominates it visually instead).
 */
export default function SiteHeader({
  locale = DEFAULT_LOCALE,
}: {
  locale?: Locale;
}) {
  const [open, setOpen] = useState(false);
  const href = (path: string) => localizedHref(path, locale);

  return (
    <header
      data-component="site-header"
      className="sticky top-0 z-50 border-b border-(--gray-100) bg-white/88 backdrop-blur-xl"
    >
      <nav
        aria-label="Primary"
        className="flex h-[52px] items-center justify-between px-4 md:h-14 md:px-12"
      >
        <Link
          href={href("/")}
          data-role="logo"
          onClick={() => setOpen(false)}
          className="text-[19px] font-semibold tracking-(--tracking-tight) text-heading-accent"
        >
          SCKIN
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-[26px] md:flex">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={href(item.href)}
                className="text-[15px] text-heading transition-colors hover:text-link"
              >
                {item.label}
                {item.children ? (
                  <span aria-hidden="true" className="ml-1 text-[11px] text-muted">
                    ⌄
                  </span>
                ) : null}
              </Link>
              {item.children ? (
                <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-3 group-focus-within:block group-hover:block">
                  <div className="min-w-48 rounded-md border border-(--gray-100) bg-page py-2 shadow-card">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={href(child.href)}
                        className="block whitespace-nowrap px-4 py-2 text-[15px] text-body transition-colors hover:bg-subtle hover:text-heading"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}

          {/* Reserved: language toggle (annex, Navigation) */}
          <div className="w-6" data-role="language-slot" aria-hidden="true" />

          <Link
            href={href(DONATE_CTA.href)}
            data-role="cta"
            className="rounded-pill bg-cta px-[18px] py-2 text-[15px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:no-underline focus-visible:no-underline"
          >
            {DONATE_CTA.label}
          </Link>
        </div>

        {/* Mobile: Donate stays visible, nav collapses behind the hamburger */}
        <div className="flex items-center gap-3.5 md:hidden">
          <Link
            href={href(DONATE_CTA.href)}
            data-role="cta"
            onClick={() => setOpen(false)}
            className="rounded-pill bg-cta px-[15px] py-[7px] text-[14px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:no-underline focus-visible:no-underline"
          >
            {DONATE_CTA.label}
          </Link>
          <button
            type="button"
            data-role="menu-toggle"
            aria-expanded={open}
            aria-controls="primary-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="flex flex-col gap-[5px] py-2"
          >
            <span
              className={`h-[1.5px] w-5 bg-heading transition-transform ${open ? "translate-y-[3.25px] rotate-45" : ""}`}
            />
            <span
              className={`h-[1.5px] w-5 bg-heading transition-transform ${open ? "-translate-y-[3.25px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div
        id="primary-nav"
        className={open ? "border-t border-(--gray-100) bg-page px-6 pb-8 pt-2 md:hidden" : "hidden"}
        onClick={() => setOpen(false)}
      >
        {NAV_ITEMS.map((item) => (
          <div key={item.href}>
            <Link
              href={href(item.href)}
              className="block py-3 text-[17px] font-semibold text-heading"
            >
              {item.label}
            </Link>
            {item.children ? (
              <div className="pb-2">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={href(child.href)}
                    className="block py-2 pl-4 text-[15px] text-body"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </header>
  );
}
