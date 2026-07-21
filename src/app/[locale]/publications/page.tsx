import type { Metadata } from "next";
import Image from "next/image";
import {
  getPublications,
  publicFileExists,
  renderSectionBody,
} from "@/lib/content";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getPublications();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Publications — top-level route, four sections in master-doc order:
 * Presentations · Publications · Abstracts · Other Contributions. Entry
 * format: Title · Authors/Presenter · Venue · Date · Link (external links
 * open in a new tab).
 */
export default function PublicationsPage() {
  const { frontmatter, html } = getPublications();

  return (
    <article data-page="publications">
      <h1>{frontmatter.title}</h1>
      {frontmatter.intro ? <p>{frontmatter.intro}</p> : null}

      {frontmatter.sections?.map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.heading}</h2>
          {section.note ? (
            <p
              data-role="note"
              dangerouslySetInnerHTML={{
                __html: renderSectionBody(section.note),
              }}
            />
          ) : null}

          {section.entries.map((entry, i) => (
            <div key={i} data-role="publication-entry">
              <h3>{entry.title}</h3>
              {entry.people ? <p data-role="people">{entry.people}</p> : null}
              {entry.venue || entry.date ? (
                <p data-role="venue">
                  {[entry.venue, entry.date].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              {entry.status ? (
                <p data-role="status">{entry.status}</p>
              ) : null}
              {entry.description ? <p>{entry.description}</p> : null}
              {entry.image && publicFileExists(entry.image) ? (
                <Image
                  src={entry.image}
                  alt={entry.image_alt ?? ""}
                  width={320}
                  height={240}
                />
              ) : null}
              {entry.link ? (
                <p>
                  <a
                    href={entry.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {entry.link.label}
                  </a>
                </p>
              ) : null}
            </div>
          ))}
        </section>
      ))}

      <Prose html={html} />
    </article>
  );
}
