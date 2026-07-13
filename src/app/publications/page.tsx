import type { Metadata } from "next";
import Link from "next/link";
import { getPublications } from "@/lib/content";

export function generateMetadata(): Metadata {
  const { frontmatter } = getPublications();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

export default function PublicationsPage() {
  const { frontmatter } = getPublications();

  return (
    <article data-page="publications">
      <h1>{frontmatter.title}</h1>

      {frontmatter.publications?.length ? (
        <ul>
          {frontmatter.publications.map((pub, i) => (
            <li key={i}>
              {pub.url ? (
                <Link href={pub.url}>{pub.title}</Link>
              ) : (
                <span>{pub.title}</span>
              )}
              {pub.authors ? <div>{pub.authors}</div> : null}
              <div>
                {[pub.venue, pub.year].filter(Boolean).join(", ")}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Publications will be listed here.</p>
      )}
    </article>
  );
}
