import {
  doiUrl,
  hostedPdfUrl,
  isGuideline,
  pubmedUrl,
  type Article,
} from "@/lib/articles";

/**
 * One paper on /resources/articles: the year in the left column (where
 * BookCard puts the cover), then the short title, the full citation, what it
 * established, an optional "Why it matters" note, badges and links.
 *
 * Badges are text, each with a visually hidden facet name, so none relies on
 * colour. Links: "Download PDF" (SCKIN's hosted copy, same tab) and "Free
 * full text" lead as filled pills; DOI and PubMed follow as outlined ones.
 * Each is hidden when its field is null. External links open in a new tab.
 *
 * A Superseded record is muted, labelled, and points to its replacement's
 * card (`#{supersededBy}`); `replacement` is that record when it exists.
 */
export default function ArticleCard({
  article,
  replacement,
}: {
  article: Article;
  replacement?: Article;
}) {
  const superseded = article.currency === "Superseded";

  const badges: Array<{ facet: string; label: string }> = [
    { facet: "Theme", label: article.theme },
    ...(isGuideline(article) ? [{ facet: "Tag", label: "Guidelines" }] : []),
    { facet: "Impact", label: article.impact },
    { facet: "Study type", label: article.studyType },
    {
      facet: "Population",
      label: article.population === "All" ? "All ages" : article.population,
    },
    ...article.regions.map((region) => ({ facet: "Region", label: region })),
  ];

  const links: Array<{ label: string; href: string; primary: boolean }> = [];
  if (article.freeFullTextUrl)
    links.push({ label: "Free full text", href: article.freeFullTextUrl, primary: true });
  if (article.doi) links.push({ label: "DOI", href: doiUrl(article.doi), primary: false });
  if (article.pmid)
    links.push({ label: "PubMed", href: pubmedUrl(article.pmid), primary: false });

  return (
    <article
      id={article.id}
      data-role="article"
      data-currency={article.currency}
      className={`flex scroll-mt-24 flex-col gap-2 rounded-lg border border-hairline p-4 md:flex-row md:gap-5 md:p-5 ${
        superseded ? "bg-subtle" : ""
      }`}
    >
      <p
        className={`shrink-0 text-[28px] font-semibold leading-none tracking-(--tracking-tight) md:w-[88px] md:text-[32px] ${
          superseded ? "text-muted" : "text-heading-accent"
        }`}
      >
        {article.year}
      </p>

      <div className="flex min-w-0 flex-1 flex-col">
        {superseded ? (
          <p className="mb-2">
            <span className="rounded-pill border border-hairline-strong px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.04em] text-body">
              Superseded
            </span>
          </p>
        ) : null}
        <h2
          className={`text-[19px] font-semibold leading-[1.3] text-pretty first-letter:uppercase ${
            superseded ? "text-body" : "text-heading"
          }`}
        >
          {article.shortTitle}
        </h2>
        <p className="mt-1.5 text-[13px] leading-[1.5] text-body text-pretty">
          {article.citation}
        </p>

        <p className="mt-3 text-[15px] leading-(--line-height-body) text-body text-pretty">
          <span className="font-semibold text-heading">What it established:</span>{" "}
          {article.established}
        </p>

        {article.plainLanguageNote ? (
          <div data-role="plain-language" className="mt-3">
            <p className="overline-label text-body">Why it matters</p>
            <p className="mt-1 text-[15px] leading-(--line-height-body) text-body text-pretty">
              {article.plainLanguageNote}
            </p>
          </div>
        ) : null}

        {superseded && article.supersededBy ? (
          <p data-role="superseded-by" className="mt-3 text-[15px] text-body">
            Superseded by{" "}
            <a
              href={`#${article.supersededBy}`}
              className="font-semibold text-link transition-colors hover:text-link-hover"
            >
              {replacement
                ? `${replacement.firstAuthor} ${replacement.year}, ${replacement.shortTitle}`
                : "a newer article"}
            </a>
          </p>
        ) : null}

        <ul data-role="badges" className="mt-3.5 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <li
              key={`${badge.facet}-${badge.label}`}
              className="rounded-pill bg-chip px-2.5 py-[3px] text-[12px] font-semibold text-chip-fg"
            >
              <span className="sr-only">{badge.facet}: </span>
              {badge.label}
            </li>
          ))}
        </ul>

        {article.hostedPdf || links.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {article.hostedPdf ? (
              <a
                href={hostedPdfUrl(article.hostedPdf)}
                download
                className="rounded-pill bg-selected px-4 py-2 text-[14px] font-semibold text-on-selected transition-colors hover:bg-heading hover:no-underline focus-visible:no-underline"
              >
                Download PDF
                <span className="sr-only">{`: ${article.title}`}</span>
              </a>
            ) : null}
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  link.primary
                    ? "rounded-pill bg-cta px-4 py-2 text-[14px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:no-underline focus-visible:no-underline"
                    : "rounded-pill border border-hairline-strong px-4 py-2 text-[14px] font-semibold text-heading transition-colors hover:border-heading hover:no-underline focus-visible:no-underline"
                }
              >
                {link.label}
                <span className="sr-only">
                  {`: ${article.title} (opens in a new tab)`}
                </span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
