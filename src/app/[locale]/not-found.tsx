import Link from "next/link";

/**
 * In-locale 404. Because the whole app tree lives under `[locale]`, this
 * not-found boundary is what renders unmatched paths *within* the locale
 * layout — so a 404 still gets the site header and footer instead of a
 * chrome-less dead end.
 */
export default function NotFound() {
  return (
    <article data-page="not-found">
      <h1>Page not found</h1>
      <p>Sorry, we couldn&rsquo;t find that page.</p>
      <p>
        <Link href="/">Return home</Link>
      </p>
    </article>
  );
}
