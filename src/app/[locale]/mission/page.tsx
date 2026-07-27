import type { Metadata } from "next";
import Link from "next/link";
import { getMission } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getMission();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Mission page — vision, mission, hypothesis as stacked statement blocks,
 * the four "in practice" scenarios as cards, and the closing statement with
 * CTAs. Content from content/mission.md.
 */
export default function MissionPage() {
  const { frontmatter, html } = getMission();
  const { vision, mission, hypothesis, practice, closing } = frontmatter;

  const statements: Array<{ id: string; heading: string; body: string }> = [
    ...(vision ? [{ id: "vision", heading: "Our vision", body: vision }] : []),
    ...(mission
      ? [{ id: "mission", heading: "Our mission", body: mission }]
      : []),
    ...(hypothesis
      ? [{ id: "hypothesis", heading: "Our hypothesis", body: hypothesis }]
      : []),
  ];

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="mission" className="mx-auto max-w-[720px]">
        <PageHeader title={frontmatter.title} />

        {statements.map((block) => (
          <section
            key={block.id}
            id={block.id}
            className="mt-8 border-t border-(--gray-100) pt-8 first-of-type:mt-10"
          >
            <p className="overline-label text-muted">{block.heading}</p>
            <p className="mt-3 text-[22px] font-semibold leading-(--line-height-snug) tracking-[-0.01em] text-heading text-pretty md:text-[28px]">
              {block.body}
            </p>
          </section>
        ))}

        {practice?.cases?.length ? (
          <section
            id="practice"
            className="mt-8 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {practice.heading}
            </h2>
            {practice.intro ? (
              <p className="mt-3 text-[17px] leading-[1.6] text-body text-pretty">
                {practice.intro}
              </p>
            ) : null}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {practice.cases.map((scenario) => (
                <div
                  key={scenario.title}
                  data-role="scenario"
                  className="rounded-lg bg-subtle p-6"
                >
                  <h3 className="text-[17px] font-semibold text-heading">
                    {scenario.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                    {scenario.description}
                  </p>
                </div>
              ))}
            </div>
            {practice.note ? (
              <p
                data-role="note"
                className="mt-4 text-[13px] leading-normal text-muted"
              >
                {practice.note}
              </p>
            ) : null}
          </section>
        ) : null}

        {closing ? (
          <section
            id="closing"
            className="mt-8 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold leading-(--line-height-snug) tracking-[-0.01em] text-heading text-pretty md:text-[28px]">
              {closing.statement}
            </h2>
            {closing.ctas?.length ? (
              <div
                data-role="ctas"
                className="mt-6 flex flex-wrap items-center gap-5"
              >
                {closing.ctas.map((cta, i) =>
                  i === 0 ? (
                    <Link
                      key={cta.href}
                      href={cta.href}
                      data-role="cta"
                      className="rounded-pill bg-cta px-6 py-3 text-[17px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:no-underline focus-visible:no-underline"
                    >
                      {cta.label}
                    </Link>
                  ) : (
                    <Link
                      key={cta.href}
                      href={cta.href}
                      className="text-[17px] font-semibold text-link transition-colors hover:text-link-hover"
                    >
                      {cta.label} →
                    </Link>
                  )
                )}
              </div>
            ) : null}
          </section>
        ) : null}

        <Prose html={html} className="mt-8" />
      </article>
    </div>
  );
}
