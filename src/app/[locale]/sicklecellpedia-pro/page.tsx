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
 * SickleCellPedia Pro — "register your interest" lead-capture page. Uses the
 * shared SubmissionForm (same pattern as /contact), posting to /api/pro-lead,
 * which appends to the Google Sheet via the Apps Script webhook.
 */
export default function SicklecellpediaProPage() {
  const { frontmatter, html } = getSicklecellpediaPro();
  const { intro, status, form } = frontmatter;

  return (
    <article data-page="sicklecellpedia-pro">
      <h1>{frontmatter.title}</h1>
      {status ? <p data-role="status">{status}</p> : null}
      {intro ? <p>{intro}</p> : null}

      {form ? (
        <SubmissionForm
          endpoint="/api/pro-lead"
          fields={form.fields}
          submitLabel={form.submit_label}
          confirmation={form.confirmation}
          fallbackEmail="contact@sckin.org"
        />
      ) : null}

      <Prose html={html} />
    </article>
  );
}
