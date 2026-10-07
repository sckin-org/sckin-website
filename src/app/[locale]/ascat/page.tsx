import type { Metadata } from "next";
import Link from "next/link";
import { getAscat, publicFileExists } from "@/lib/content";
import AscatForm from "@/components/AscatForm";

/**
 * /ascat — contact & sign-up page for people met at ASCAT 2026. Deliberately
 * not in the main navigation (reached from the conference QR code), but
 * indexable with Open Graph tags so sckin.org/ascat previews well on
 * LinkedIn. Mobile first: the hero copy is short and the form card follows
 * it immediately, before the talk details.
 */

const PAGE_URL = "https://sckin.org/ascat";

const OUTLINE_PILL =
  "inline-flex min-h-[44px] items-center rounded-pill border border-cta px-5 py-2.5 text-[15px] font-semibold text-heading-accent transition-colors hover:bg-cta hover:text-on-band hover:no-underline focus-visible:no-underline focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2";

export function generateMetadata(): Metadata {
  const { frontmatter } = getAscat();
  return {
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

export default function AscatPage() {
  const { frontmatter } = getAscat();
  const { hero, form, involve, slides } = frontmatter;

  // Each download renders only if its file exists at build time, so this
  // page can ship in any order relative to the branch that adds the PDFs.
  const hasSlides = publicFileExists(slides.slides.href);
  const hasPoster = publicFileExists(slides.poster.href);

  return (
    <div className="px-6 py-12 md:px-12 md:py-20">
      <article data-page="ascat" className="mx-auto max-w-[1040px]">
        <section
          data-section="hero"
          className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-12"
        >
          <div data-role="hero-copy">
            <p className="overline-label text-muted">{hero.eyebrow}</p>
            <h1 className="mt-4 text-(length:--font-size-h1) font-semibold leading-(--line-height-tight) tracking-(--tracking-tight) text-heading text-pretty">
              {hero.headline}
            </h1>
            <p className="mt-3 text-[19px] leading-[1.5] text-body text-pretty">
              {hero.body}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={hero.linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                className={OUTLINE_PILL}
              >
                {hero.linkedin.label}
              </a>
              <Link
                href={hero.try_link.href}
                className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
              >
                {hero.try_link.label} →
              </Link>
            </div>
          </div>

          {/* Mobile order: copy → form → talk. On desktop the form card spans
              the right column and the talk block sits under the copy. */}
          <div
            id="form"
            data-section="form"
            className="scroll-mt-24 rounded-lg bg-subtle p-6 md:col-start-2 md:row-span-2 md:row-start-1 md:p-7"
          >
            {/* Real anchor targets for the involve-card links: the browser's
                own fragment scroll lands here (programmatic scrolling loses
                to Chrome's pending-fragment handling); AscatForm reads the
                same hashes to pre-select the matching options. */}
            <span id="form-evaluator" className="scroll-mt-24" aria-hidden="true" />
            <span id="form-organisation" className="scroll-mt-24" aria-hidden="true" />
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {form.heading}
            </h2>
            <div className="mt-5">
              <AscatForm linkedin={hero.linkedin} />
            </div>
          </div>

          <div
            data-role="talk"
            className="rounded-lg bg-subtle p-5 md:col-start-1 md:self-start"
          >
            <p className="overline-label text-muted">{hero.talk.label}</p>
            <p className="mt-2 text-[15px] font-semibold leading-[1.45] text-heading text-pretty">
              {hero.talk.title}
            </p>
            <p className="mt-2 text-[13px] text-muted">{hero.talk.meta}</p>
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
            {involve.cards.map((card) => (
              <div
                key={card.intent}
                data-role="involve-card"
                className="rounded-lg bg-subtle p-6 md:p-7"
              >
                <p className="overline-label text-muted">{card.eyebrow}</p>
                <h3 className="mt-2.5 text-[19px] font-semibold leading-[1.35] text-heading text-pretty">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                  {card.body}
                </p>
                {/* next/link, not a plain anchor: a native fragment click
                    fires popstate and the App Router restores its recorded
                    scroll position over the browser's fragment scroll. Link
                    navigates via pushState and scrolls to the anchor itself;
                    AscatForm pre-selects from the same hash. */}
                <Link
                  href={`#form-${card.intent}`}
                  className="mt-4 inline-flex min-h-[44px] items-center text-[15px] font-semibold text-link transition-colors hover:text-link-hover focus-visible:ring-2 focus-visible:ring-(--color-cta) focus-visible:ring-offset-2"
                >
                  {card.cta_label} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {hasSlides || hasPoster ? (
          <section
            data-section="slides"
            className="mt-14 border-t border-(--gray-100) pt-10"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {slides.heading}
            </h2>
            <p className="mt-2.5 max-w-[720px] text-[15px] leading-(--line-height-body) text-body text-pretty">
              {slides.body}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {hasSlides ? (
                <a
                  href={slides.slides.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={OUTLINE_PILL}
                >
                  {slides.slides.label}
                </a>
              ) : null}
              {hasPoster ? (
                <a
                  href={slides.poster.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={OUTLINE_PILL}
                >
                  {slides.poster.label}
                </a>
              ) : null}
            </div>
          </section>
        ) : null}
      </article>
    </div>
  );
}
