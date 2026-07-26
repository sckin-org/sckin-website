import type { Metadata } from "next";
import { getResponsibleAi, renderSectionBody } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getResponsibleAi();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Responsible AI — ships on the generic tokenized content template until its
 * dedicated design exists (deferred 2026-07-22). Two anchor sections matching
 * the shipped anchors: #approach (with sub-topic blocks) and #surveys. Copy is
 * placeholder until the master doc's [TO ADD] fields are filled.
 */
export default function ResponsibleAiPage() {
  const { frontmatter, html } = getResponsibleAi();

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="responsible-ai" className="mx-auto max-w-[720px]">
        <PageHeader title={frontmatter.title} />

        {frontmatter.sections?.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="mt-8 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {section.heading}
            </h2>
            {section.body ? (
              <div
                className="prose-sckin mt-3"
                dangerouslySetInnerHTML={{
                  __html: renderSectionBody(section.body),
                }}
              />
            ) : null}

            {section.subsections?.map((sub) => (
              <div key={sub.heading} data-role="subsection" className="mt-7">
                <h3 className="text-[17px] font-semibold text-heading">
                  {sub.heading}
                </h3>
                {sub.body ? (
                  <div
                    className="prose-sckin mt-2 text-[15px]"
                    dangerouslySetInnerHTML={{
                      __html: renderSectionBody(sub.body),
                    }}
                  />
                ) : null}
              </div>
            ))}
          </section>
        ))}

        <Prose html={html} className="mt-8" />
      </article>
    </div>
  );
}
