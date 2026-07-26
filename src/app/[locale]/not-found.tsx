import Link from "next/link";

/**
 * In-locale 404. Because the whole app tree lives under `[locale]`, this
 * not-found boundary is what renders unmatched paths *within* the locale
 * layout — so a 404 still gets the site header and footer instead of a
 * chrome-less dead end.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-14">
      <article data-page="not-found" className="text-center">
        <p className="overline-label text-muted">404</p>
        <h1 className="mt-4 text-(length:--font-size-h1) font-semibold leading-(--line-height-tight) tracking-(--tracking-tight) text-heading">
          Page not found
        </h1>
        <p className="mt-3 text-[17px] leading-(--line-height-body) text-body">
          Sorry, we couldn&rsquo;t find that page.
        </p>
        <p className="mt-6">
          <Link
            href="/"
            className="text-[17px] font-semibold text-link transition-colors hover:text-link-hover"
          >
            Return home →
          </Link>
        </p>
      </article>
    </div>
  );
}
