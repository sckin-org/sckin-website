import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";

/**
 * Locale routing middleware.
 *
 * The app tree lives under `app/[locale]/…`, but the default locale (English)
 * must stay UNPREFIXED in the URL for SEO — `/mission`, not `/en/mission`.
 * This middleware reconciles the two:
 *
 *  1. `/fr/…` (a non-default supported locale) → pass through untouched; it
 *     matches `[locale]=fr` directly.
 *  2. `/en` or `/en/…` (default locale, explicitly prefixed) → permanent
 *     redirect to the canonical unprefixed URL, so the prefixed form never
 *     competes for the same content.
 *  3. Anything else (unprefixed, e.g. `/mission`, `/`) → internally REWRITTEN
 *     to `/en/…` so it resolves against the `[locale]` tree. The browser URL is
 *     unchanged.
 *
 * When "fr" is added to LOCALES, rule 1 starts matching `/fr/*` automatically;
 * no code change here is required.
 *
 * The matcher deliberately excludes `/api`, Next internals, and any path with a
 * file extension — API routes must never be localized, and static assets must
 * not pay for a rewrite.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Non-default locale prefix → pass through.
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return NextResponse.next();
    }
  }

  // 2. Explicit default-locale prefix → redirect to the unprefixed canonical.
  if (
    pathname === `/${DEFAULT_LOCALE}` ||
    pathname.startsWith(`/${DEFAULT_LOCALE}/`)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  // 3. Unprefixed default locale → rewrite to /en/… (URL stays as-is).
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
