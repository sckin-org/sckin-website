import type { Metadata } from "next";
import { getResponsibleAi, renderSectionBody } from "@/lib/content";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getResponsibleAi();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Responsible AI. Two anchor sections matching the nav dropdown: Our approach
 * (/responsible-ai#approach) and Human-in-the-Loop Surveys
 * (/responsible-ai#surveys), each with sub-topic blocks. Copy is placeholder
 * until the master doc's [TO ADD] fields are filled.
 */
export default function ResponsibleAiPage() {
  const { frontmatter, html } = getResponsibleAi();

  return (
    <article data-page="responsible-ai">
      <h1>{frontmatter.title}</h1>

      {frontmatter.sections?.map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.heading}</h2>
          {section.body ? (
            <div
              dangerouslySetInnerHTML={{
                __html: renderSectionBody(section.body),
              }}
            />
          ) : null}

          {section.subsections?.map((sub) => (
            <div key={sub.heading} data-role="subsection">
              <h3>{sub.heading}</h3>
              {sub.body ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderSectionBody(sub.body),
                  }}
                />
              ) : null}
            </div>
          ))}
        </section>
      ))}

      <Prose html={html} />
    </article>
  );
}
