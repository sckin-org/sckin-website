import type { Metadata } from "next";
import Image from "next/image";
import {
  getPublications,
  publicFileExists,
  renderSectionBody,
} from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getPublications();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Publications — four sections in master-doc order (Presentations ·
 * Publications · Abstracts · Other Contributions), styled to the grouped-
 * entries comp (Homepage.dc.html §4a): anchor pills, bordered section
 * headings, hairline-divided entries with title / people / venue·date / link.
 */
export default function PublicationsPage() {
  const { frontmatter, html } = getPublications();
  const sections = frontmatter.sections ?? [];

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="publications" className="mx-auto max-w-[720px]">
        <PageHeader title={frontmatter.title} subhead={frontmatter.intro} />

        {sections.length > 1 ? (
          <nav
            aria-label="Publication sections"
            className="mt-6 flex flex-wrap gap-2"
          >
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-pill border border-hairline-strong px-3.5 py-1.5 text-[14px] font-semibold text-body transition-colors hover:border-heading hover:text-heading"
              >
                {section.heading}
              </a>
            ))}
          </nav>
        ) : null}

        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-10">
            <h2 className="border-b border-hairline pb-3 text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {section.heading}
            </h2>
            {section.note ? (
              <p
                data-role="note"
                className="prose-sckin mt-3 text-[15px]"
                dangerouslySetInnerHTML={{
                  __html: renderSectionBody(section.note),
                }}
              />
            ) : null}

            <div className="flex flex-col">
              {section.entries.map((entry, i) => (
                <div
                  key={i}
                  data-role="publication-entry"
                  className="border-b border-(--gray-100) py-5 last:border-b-0"
                >
                  <h3 className="text-[17px] font-semibold leading-[1.4] text-heading text-pretty">
                    {entry.title}
                  </h3>
                  {entry.people ? (
                    <p data-role="people" className="mt-1.5 text-[15px] leading-normal text-body">
                      {entry.people}
                    </p>
                  ) : null}
                  {entry.venue || entry.date ? (
                    <p data-role="venue" className="mt-1 text-[13px] text-muted">
                      {[entry.venue, entry.date].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                  {entry.status ? (
                    <p data-role="status" className="mt-1 text-[13px] font-semibold text-body">
                      {entry.status}
                    </p>
                  ) : null}
                  {entry.description ? (
                    <p className="mt-2 text-[15px] leading-(--line-height-body) text-body text-pretty">
                      {entry.description}
                    </p>
                  ) : null}
                  {entry.image && publicFileExists(entry.image) ? (
                    <Image
                      src={entry.image}
                      alt={entry.image_alt ?? ""}
                      width={320}
                      height={240}
                      className="mt-3 rounded-md"
                    />
                  ) : null}
                  {entry.link ? (
                    <p className="mt-2.5">
                      <a
                        href={entry.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
                      >
                        {entry.link.label} →
                      </a>
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}

        <Prose html={html} className="mt-8" />
      </article>
    </div>
  );
}
