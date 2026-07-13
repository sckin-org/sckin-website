import type { Metadata } from "next";
import { getResponsibleAi } from "@/lib/content";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getResponsibleAi();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Responsible AI. Anchor sections keyed by `id`; includes the
 * Human-in-the-Loop Surveys section (/responsible-ai#human-in-the-loop).
 */
export default function ResponsibleAiPage() {
  const { frontmatter, html } = getResponsibleAi();

  return (
    <article data-page="responsible-ai">
      <h1>{frontmatter.title}</h1>

      {frontmatter.sections?.map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.heading}</h2>
          {section.body ? <p>{section.body}</p> : null}
        </section>
      ))}

      <Prose html={html} />
    </article>
  );
}
