import type { Metadata } from "next";
import { getImpact } from "@/lib/content";
import type { Testimonial } from "@/lib/content";
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
    <figure data-role="testimonial">
      <blockquote>{t.quote}</blockquote>
      <figcaption>
        <span data-role="name">{t.name}</span>
        {attribution ? <span data-role="attribution">{attribution}</span> : null}
      </figcaption>
    </figure>
  );
}

/**
 * Impact page. Renders the structured frontmatter from content/impact.md:
 * a hero, headline stats, and two testimonial rows (community and clinical).
 * Unstyled placeholder layout — visual design arrives from the Claude Design
 * handoff.
 */
export default function ImpactPage() {
  const { frontmatter, html } = getImpact();
  const { hero, stats, testimonials_community, testimonials_clinical } =
    frontmatter;

  return (
    <article data-page="impact">
      <section data-section="hero">
        <h1>{hero.headline}</h1>
        <p>{hero.subhead}</p>
      </section>

      {stats?.length ? (
        <section data-section="stats">
          {stats.map((s, i) => (
            <div key={i}>
              <p data-role="figure">{s.figure}</p>
              <p data-role="caption">{s.caption}</p>
            </div>
          ))}
        </section>
      ) : null}

      {testimonials_community?.length ? (
        <section data-section="testimonials-community">
          <h2>From our community</h2>
          {testimonials_community.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </section>
      ) : null}

      {testimonials_clinical?.length ? (
        <section data-section="testimonials-clinical">
          <h2>From clinicians</h2>
          {testimonials_clinical.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </section>
      ) : null}

      <Prose html={html} />
    </article>
  );
}
