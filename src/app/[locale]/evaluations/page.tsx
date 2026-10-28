import type { Metadata } from "next";
import {
  getEvaluations,
  publicFileExists,
  renderAccessBody,
} from "@/lib/content";
import EvaluationsForm from "@/components/EvaluationsForm";

/**
 * /evaluations — sign-up page for medical professionals who rate
 * SickleCellPedia answers for the benchmarking study. Sibling of /ascat:
 * same layout, form styling and submission pipeline. Not in the main
 * navigation (reached from print QR codes and ?ref= referral links), but
 * indexable and in the sitemap.
 *
 * Mobile order: copy → how answers are rated → form → reference. On desktop
 * the form card spans the right column.
 *
 * Small text uses text-body rather than text-muted, as on /scdaa — the muted
 * grey misses WCAG AA at these sizes.
 */

const PAGE_URL = "https://sckin.org/evaluations";

export function generateMetadata(): Metadata {
  const { frontmatter } = getEvaluations();
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

export default function EvaluationsPage() {
  const { frontmatter } = getEvaluations();
  const { hero, criteria, form, reference } = frontmatter;
  const hasPoster = publicFileExists(reference.poster.href);

  return (
    <div className="px-6 py-12 md:px-12 md:py-20">
      <article data-page="evaluations" className="mx-auto max-w-[1040px]">
        <section
          data-section="hero"
          className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-12"
        >
          <div data-role="hero-copy" className="min-w-0">
            <h1 className="text-(length:--font-size-h1) font-semibold leading-(--line-height-tight) tracking-(--tracking-tight) text-heading text-pretty">
              {hero.headline}
            </h1>
            <p className="mt-3 text-[19px] leading-[1.5] text-body text-pretty">
              {hero.subtitle}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {hero.intro.map((paragraph) => (
                <p
                  key={paragraph}
                  className="prose-sckin text-[15px] leading-(--line-height-body) text-pretty"
                  dangerouslySetInnerHTML={{
                    __html: renderAccessBody(paragraph),
                  }}
                />
              ))}
            </div>
          </div>

          {/* DOM order is the mobile (and reading) order: copy → criteria →
              form. On desktop the form card spans the right column. */}
          <div
            data-section="criteria"
            className="min-w-0 rounded-lg bg-subtle p-5 md:col-start-1 md:row-start-2 md:self-start md:p-6"
          >
            <h2 className="text-[19px] font-semibold leading-[1.35] text-heading">
              {criteria.heading}
            </h2>
            <dl className="mt-3 flex flex-col gap-3">
              {criteria.items.map((item) => (
                <div
                  key={item.term}
                  className="text-[15px] leading-(--line-height-body) text-body text-pretty"
                >
                  <dt className="inline font-semibold text-heading">
                    {item.term}:
                  </dt>{" "}
                  <dd className="inline">{item.definition}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            id="form"
            data-section="form"
            className="min-w-0 scroll-mt-24 rounded-lg bg-subtle p-6 md:col-start-2 md:row-span-2 md:row-start-1 md:p-7"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {form.heading}
            </h2>
            <div className="mt-5">
              <EvaluationsForm />
            </div>
          </div>
        </section>

        <section
          data-section="reference"
          className="mt-14 border-t border-(--gray-100) pt-8"
        >
          <p
            className="prose-sckin max-w-[720px] text-[13px] leading-[1.5] text-pretty"
            dangerouslySetInnerHTML={{
              __html: renderAccessBody(reference.citation),
            }}
          />
          {hasPoster ? (
            <a
              href={reference.poster.href}
              target="_blank"
              rel="noopener"
              className="mt-3 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-link transition-colors hover:text-link-hover"
            >
              {reference.poster.label} ↗
            </a>
          ) : null}
        </section>
      </article>
    </div>
  );
}
