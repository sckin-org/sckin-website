import type { Metadata } from "next";
import Link from "next/link";
import { getScdaa, publicFileExists, type ScdaaFrontmatter } from "@/lib/content";
import ScdaaForm from "@/components/ScdaaForm";
import CopyEmail from "@/components/CopyEmail";

/**
 * /scdaa — conference landing page for the SCDAA 54th Annual National
 * Convention (15–17 October 2026, Concord, North Carolina). Sibling of
 * /ascat: same patterns, components and styling, different audience and
 * copy. Deliberately not in the main navigation, and not in a sitemap (the
 * site has none), but indexable with Open Graph tags — no noindex.
 *
 * The printed poster's QR code points at https://www.sckin.org/scdaa, so
 * this route name is FIXED: it must never be renamed or redirected. (The
 * site-wide www → apex 308 still applies, as it does for /ascat.)
 *
 * Mobile first: the QR audience is on phones. Section order on a phone is
 * hero copy → poster tile → try → form → work with us → feedback.
 *
 * Small text on this page uses text-body rather than the design's text-muted:
 * #7D7D85 is ~4.1:1 on white, below the 4.5:1 WCAG AA floor at 13px, and
 * this page is held to Lighthouse accessibility ≥ 95.
 */

const PAGE_URL = "https://sckin.org/scdaa";

const OUTLINE_PILL =
  "inline-flex min-h-[44px] items-center rounded-pill border border-cta px-5 py-2.5 text-[15px] font-semibold text-heading-accent transition-colors hover:bg-cta hover:text-on-band hover:no-underline focus-visible:no-underline focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2";

const SOLID_PILL =
  "inline-flex min-h-[44px] items-center rounded-pill bg-cta px-5 py-2.5 text-[15px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:text-on-band hover:no-underline focus-visible:no-underline focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2";

export function generateMetadata(): Metadata {
  const { frontmatter } = getScdaa();
  return {
    // The locale layout appends " — SCKIN" via its title template.
    title: frontmatter.title,
    description: frontmatter.meta_description,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.meta_description,
      url: PAGE_URL,
      siteName: "SCKIN",
      type: "website",
    },
  };
}

/**
 * The poster card. `href` null means the PDF has not landed yet: the same
 * card renders as a plain div without the "open" affordance, rather than
 * linking to a 404.
 *
 * TODO (remove once settled): the PDF lives at
 * public/documents/sckin-scdaa-2026-poster.pdf — drop a replacement there
 * under that name and the tile picks it up with no code change.
 */
function PosterTile({
  poster,
  href,
}: {
  poster: ScdaaFrontmatter["hero"]["poster"];
  href: string | null;
}) {
  const inner = (
    <>
      <p className="overline-label text-body">{poster.eyebrow}</p>
      {/* A <p>, not a heading: each section below owns an h2, and a card
          title here would land an h2/h3 inside the hero and break the
          document's heading order. */}
      <p className="mt-2.5 text-[17px] font-semibold leading-[1.4] text-heading text-pretty">
        {poster.title}
      </p>
      <p className="mt-2.5 text-[14px] leading-[1.5] text-body text-pretty">
        {poster.authors}
      </p>
      <p className="mt-2 text-[13px] leading-[1.5] text-body text-pretty">
        {poster.convention}
      </p>
      {href ? (
        <p className="mt-4 text-[14px] font-semibold text-heading-accent">
          {poster.open_label} ↗
        </p>
      ) : null}
    </>
  );

  if (!href) {
    return <div className="rounded-lg bg-subtle p-6 md:p-7">{inner}</div>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="block rounded-lg bg-subtle p-6 transition-colors hover:bg-(--gray-100) hover:no-underline focus-visible:no-underline focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2 md:p-7"
    >
      {inner}
    </a>
  );
}

export default function ScdaaPage() {
  const { frontmatter } = getScdaa();
  const { hero, try: tryIt, form, involve, feedback } = frontmatter;

  // The poster is the page's premise, but the route has to exist whether or
  // not the PDF has landed (same guard as /ascat): with the file missing the
  // hero CTA and the tile's link are dropped rather than pointing at a 404.
  const hasPoster = publicFileExists(hero.poster_cta.href);

  return (
    <div className="px-6 py-12 md:px-12 md:py-20">
      <article data-page="scdaa" className="mx-auto max-w-[1040px]">
        <section
          data-section="hero"
          className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-12"
        >
          <div data-role="hero-copy" className="min-w-0">
            <p className="overline-label text-body">{hero.eyebrow}</p>
            <h1 className="mt-4 text-(length:--font-size-h1) font-semibold leading-(--line-height-tight) tracking-(--tracking-tight) text-heading text-pretty">
              {hero.headline}
            </h1>
            <p className="mt-3 text-[19px] leading-[1.5] text-body text-pretty">
              {hero.body}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {hasPoster ? (
                <a
                  href={hero.poster_cta.href}
                  target="_blank"
                  rel="noopener"
                  className={SOLID_PILL}
                >
                  {hero.poster_cta.label}
                </a>
              ) : null}
              {/* next/link, not a plain anchor: a native fragment click fires
                  popstate and the App Router restores its recorded scroll
                  position over the browser's fragment scroll. */}
              <Link
                href={hero.form_link.href}
                className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
              >
                {hero.form_link.label} ↓
              </Link>
            </div>
          </div>

          {/* Poster tile: the whole tile is the link, so a thumb anywhere on
              it opens the PDF. No thumbnail — a 36×48in poster reduced to a
              card is unreadable, and the words below do the work. */}
          <div data-role="poster-tile" className="min-w-0">
            <PosterTile
              poster={hero.poster}
              href={hasPoster ? hero.poster_cta.href : null}
            />
          </div>
        </section>

        <section
          data-section="try"
          className="mt-14 border-t border-(--gray-100) pt-10"
        >
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
            {tryIt.heading}
          </h2>
          <p className="mt-2.5 max-w-[720px] text-[15px] leading-(--line-height-body) text-body text-pretty">
            {tryIt.intro}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {tryIt.cards.map((card) => (
              <div
                key={card.title}
                data-role="try-card"
                className="flex min-w-0 flex-col items-start rounded-lg bg-subtle p-6 md:p-7"
              >
                <h3 className="text-[19px] font-semibold leading-[1.35] text-heading text-pretty">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                  {card.body}
                </p>
                <a
                  href={card.cta.href}
                  target="_blank"
                  rel="noopener"
                  className={`mt-5 ${OUTLINE_PILL}`}
                >
                  {card.cta.label}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section
          id="form"
          data-section="form"
          className="mt-14 scroll-mt-24 border-t border-(--gray-100) pt-10"
        >
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] md:gap-12">
            <div className="min-w-0 rounded-lg bg-subtle p-6 md:p-7">
              <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
                {form.heading}
              </h2>
              <div className="mt-5">
                <ScdaaForm />
              </div>
            </div>
            <div
              data-role="mission-note"
              className="min-w-0 md:self-start md:pt-1"
            >
              <p className="overline-label text-body">{form.mission.eyebrow}</p>
              <p className="mt-3 text-[19px] font-semibold leading-[1.4] text-heading text-pretty">
                {form.mission.statement}
              </p>
              <p className="mt-3 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {form.mission.body}
              </p>
            </div>
          </div>
        </section>

        <section
          data-section="involve"
          className="mt-14 border-t border-(--gray-100) pt-10"
        >
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
            {involve.heading}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {involve.cards.map((card, i) => (
              <div
                key={card.title}
                data-role="involve-card"
                className="flex min-w-0 flex-col items-start rounded-lg bg-subtle p-6 md:p-7"
              >
                <p className="overline-label text-body">{card.eyebrow}</p>
                <h3 className="mt-2.5 text-[19px] font-semibold leading-[1.35] text-heading text-pretty">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                  {card.body}
                </p>
                {card.email ? (
                  <div className="mt-4">
                    <CopyEmail email={card.email} />
                  </div>
                ) : null}
                {/* The PRO waitlist is the primary action of the pair; the
                    platform card's mailto is secondary. The PRO link opens in
                    a new tab (per the brief) and lands on #register, which
                    already exists on that page. */}
                {card.cta.href.startsWith("mailto:") ? (
                  <a
                    href={card.cta.href}
                    className={`mt-5 ${OUTLINE_PILL}`}
                  >
                    {card.cta.label}
                  </a>
                ) : (
                  <a
                    href={card.cta.href}
                    target="_blank"
                    rel="noopener"
                    className={`mt-5 ${i === 1 ? SOLID_PILL : OUTLINE_PILL}`}
                  >
                    {card.cta.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section
          data-section="feedback"
          className="mt-14 rounded-lg bg-subtle p-6 md:p-9"
        >
          <h3 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
            {feedback.heading}
          </h3>
          <p className="mt-2.5 max-w-[640px] text-[15px] leading-(--line-height-body) text-body text-pretty">
            {feedback.body}
          </p>
          <div className="mt-4">
            <CopyEmail email={feedback.email} />
          </div>
          <a href={feedback.cta.href} className={`mt-5 ${OUTLINE_PILL}`}>
            {feedback.cta.label}
          </a>
        </section>
      </article>
    </div>
  );
}
