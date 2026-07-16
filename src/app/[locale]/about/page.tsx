import type { Metadata } from "next";
import Link from "next/link";
import { getAbout } from "@/lib/content";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getAbout();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * About page. Renders anchor sections (SCKIN, Our Board, Our Founder,
 * Our Collaborators, Friends of SCKIN) keyed by their `id` so nav dropdown
 * links (/about#board, ...) resolve.
 */
export default function AboutPage() {
  const { frontmatter, html } = getAbout();

  return (
    <article data-page="about">
      <h1>{frontmatter.title}</h1>

      {frontmatter.sections?.map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.heading}</h2>
          {section.body ? <p>{section.body}</p> : null}

          {section.members?.length ? (
            <ul>
              {section.members.map((m, i) => (
                <li key={i}>
                  <strong>{m.name}</strong>
                  {m.role ? ` — ${m.role}` : ""}
                  {m.bio ? <p>{m.bio}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}

          {section.items?.length ? (
            <ul>
              {section.items.map((item, i) => (
                <li key={i}>
                  {item.url ? (
                    <Link href={item.url}>{item.name}</Link>
                  ) : (
                    item.name
                  )}
                  {item.note ? ` — ${item.note}` : ""}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <Prose html={html} />
    </article>
  );
}
