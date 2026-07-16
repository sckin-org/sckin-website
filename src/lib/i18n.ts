/**
 * Locale configuration for the site.
 *
 * We launch English-only, but the whole app is structured around a `[locale]`
 * route segment so adding a language later is config + content, not a
 * restructure. Rules that must always hold:
 *
 *  - The DEFAULT_LOCALE is NEVER prefixed in the URL. English stays at
 *    `/mission`, not `/en/mission` — see src/middleware.ts, which rewrites
 *    unprefixed paths to the default locale internally and redirects any
 *    `/en/*` back to the canonical unprefixed form.
 *  - Non-default locales ARE prefixed: adding "fr" yields `/fr/mission` while
 *    every English URL is untouched (no redirects, no broken links — SEO).
 *
 * To add French: add "fr" to LOCALES, add `content/<page>.fr.md` files (the
 * content loader is already shaped to resolve them, see src/lib/content.ts),
 * and drop a locale switcher into the nav. No routes move.
 */

export const LOCALES = ["en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Type guard: is this string one of the supported locales? */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Build an href for a given path in a given locale.
 *  - Default locale → unprefixed (`/mission`).
 *  - Other locales   → prefixed (`/fr/mission`).
 * Non-internal hrefs (external URLs, mailto:, #anchors) pass through untouched.
 */
export function localizedHref(path: string, locale: Locale): string {
  if (!path.startsWith("/")) return path;
  if (locale === DEFAULT_LOCALE) return path;
  return `/${locale}${path}`;
}
