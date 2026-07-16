import type { Metadata } from "next";
import Link from "next/link";
import { getContact } from "@/lib/content";
import Prose from "@/components/Prose";
import SubmissionForm from "@/components/SubmissionForm";

export function generateMetadata(): Metadata {
  const { frontmatter } = getContact();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Contact page. Renders the structured frontmatter from content/contact.md in a
 * deliberate order: hero → deflect → form → schedule → direct. The deflect
 * block sits ABOVE the form on purpose — most visitors want a sickle cell
 * question answered, and SickleCellPedia does that instantly, so we point them
 * there before offering a form that waits on a human.
 *
 * Unstyled placeholder layout — visual design arrives from the Claude Design
 * handoff.
 */
export default function ContactPage() {
  const { frontmatter, html } = getContact();
  const { hero, deflect, form, schedule, direct } = frontmatter;

  return (
    <article data-page="contact">
      {/* 1. Hero */}
      <section data-section="hero">
        <h1>{hero.headline}</h1>
        <p>{hero.subhead}</p>
      </section>

      {/* 2. Deflect — steer disease questions to the chatbot, above the form */}
      {deflect ? (
        <section data-section="deflect">
          <h2>{deflect.heading}</h2>
          <p>{deflect.body}</p>
          <Link href={deflect.cta.href}>{deflect.cta.label}</Link>
        </section>
      ) : null}

      {/* 3. Form */}
      <section data-section="form">
        {form.heading ? <h2>{form.heading}</h2> : null}
        <SubmissionForm
          endpoint="/api/contact"
          fields={form.fields}
          submitLabel={form.submit_label}
          confirmation={form.confirmation}
          fallbackEmail={direct?.email ?? "contact@sckin.org"}
        />
      </section>

      {/* 4. Schedule */}
      {schedule ? (
        <section data-section="schedule">
          <h2>{schedule.heading}</h2>
          <p>{schedule.body}</p>
          <a href={schedule.cta.href}>{schedule.cta.label}</a>
        </section>
      ) : null}

      {/* 5. Direct — email + socials */}
      {direct ? (
        <section data-section="direct">
          {direct.email ? (
            <p>
              <a href={`mailto:${direct.email}`}>{direct.email}</a>
            </p>
          ) : null}
          <ul data-role="social">
            {direct.facebook ? (
              <li>
                <a href={direct.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
            ) : null}
            {direct.linkedin ? (
              <li>
                <a href={direct.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <Prose html={html} />
    </article>
  );
}
