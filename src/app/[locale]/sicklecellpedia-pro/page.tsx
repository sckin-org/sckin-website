import type { Metadata } from "next";
import { getSicklecellpediaPro } from "@/lib/content";
import Prose from "@/components/Prose";
import SubmissionForm from "@/components/SubmissionForm";

export function generateMetadata(): Metadata {
  const { frontmatter } = getSicklecellpediaPro();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * SickleCellPedia Pro — pre-launch page: tagline, intro, the four feature
 * blocks, then the "Register your interest" lead-capture form at #register
 * (linked from the Home Tool 2 CTA). The form posts to /api/pro-lead, which
 * appends to the contacts Google Sheet via the service account.
 */
export default function SicklecellpediaProPage() {
  const { frontmatter, html } = getSicklecellpediaPro();
  const { tagline, intro, status, features, register, form } = frontmatter;

  return (
    <article data-page="sicklecellpedia-pro">
      <h1>{frontmatter.title}</h1>
      {tagline ? <p data-role="tagline">{tagline}</p> : null}
      {status ? <p data-role="status">{status}</p> : null}
      {intro ? <p>{intro}</p> : null}

      {features?.length ? (
        <section data-section="features">
          {features.map((feature, i) => (
            <div key={i} data-role="feature">
              <h3>{feature.name}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </section>
      ) : null}

      {form ? (
        <section id="register" data-section="register">
          <h2>{register?.heading ?? "Register your interest"}</h2>
          {register?.subtext ? <p>{register.subtext}</p> : null}
          <SubmissionForm
            endpoint="/api/pro-lead"
            fields={form.fields}
            submitLabel={form.submit_label}
            confirmation={form.confirmation}
            fallbackEmail="contact@sckin.org"
          />
        </section>
      ) : null}

      <Prose html={html} />
    </article>
  );
}
