import type { Metadata } from "next";
import { getImpact } from "@/lib/content";
import type { Testimonial } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getImpact();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/** A quote from a community member or clinician. */
function TestimonialCard({ t }: { t: Testimonial }) {
  const attribution = [t.role, t.institution, t.country]
    .filter(Boolean)
    .join(", ");
  return (
    <figure data-role="testimonial" className="rounded-lg bg-subtle p-6">
      <blockquote className="text-[17px] leading-(--line-height-body) text-heading text-pretty">
        {t.quote}
      </blockquote>
      <figcaption className="mt-3 text-[14px] text-body">
        <span data-role="name" className="font-semibold text-heading">
          {t.name}
        </span>
        {attribution ? (
          <span data-role="attribution"> — {attribution}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/**
 * Impact page — gated from the nav until it carries real numbers (the
 * requirements checklist forbids placeholder figures here: funders read this
 * page). Tokenized layout; content from content/impact.md.
 */
export default function ImpactPage() {
  const { frontmatter, html } = getImpact();
  const { hero, stats, testimonials_community, testimonials_clinical } =
    frontmatter;

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="impact" className="mx-auto max-w-[720px]">
        <PageHeader title={hero.headline} subhead={hero.subhead} />

        {stats?.length ? (
          <section data-section="stats" className="mt-10 grid gap-6 md:grid-cols-3">
            {stats.map((s, i) => (
              <div key={i} className="border-t border-(--gray-100) pt-4">
                <p
                  data-role="figure"
                  className="text-[40px] font-semibold leading-none tracking-(--tracking-tight) text-heading-accent"
                >
                  {s.figure}
                </p>
                <p data-role="caption" className="mt-2 text-[15px] leading-normal text-body">
                  {s.caption}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {testimonials_community?.length ? (
          <section
            data-section="testimonials-community"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              From our community
            </h2>
            <div className="mt-5 flex flex-col gap-4">
              {testimonials_community.map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
          </section>
        ) : null}

        {testimonials_clinical?.length ? (
          <section
            data-section="testimonials-clinical"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              From clinicians
            </h2>
            <div className="mt-5 flex flex-col gap-4">
              {testimonials_clinical.map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
          </section>
        ) : null}

        <Prose html={html} className="mt-8" />
      </article>
    </div>
  );
}
