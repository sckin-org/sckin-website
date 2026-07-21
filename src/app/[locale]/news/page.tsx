import type { Metadata } from "next";
import Link from "next/link";
import { getAllNews, getNewsLanding } from "@/lib/content";

export function generateMetadata(): Metadata {
  const { frontmatter } = getNewsLanding();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Sickle Cell News landing — launch phase (master doc v3.1): brief intro, the
 * "In development — expected September 2026" badge, and a simple card list.
 * No topic/geography filters yet — those ship later with the taxonomy
 * (<NewsBrowser /> is built and parked for that phase). Posts are authored in
 * the /admin CMS, not here.
 */
export default function NewsPage() {
  const { frontmatter } = getNewsLanding();
  const posts = getAllNews();

  return (
    <article data-page="news">
      <h1>{frontmatter.title}</h1>
      {frontmatter.status ? (
        <p data-role="status">{frontmatter.status}</p>
      ) : null}
      {frontmatter.intro ? <p>{frontmatter.intro}</p> : null}

      {posts.length ? (
        <ul data-role="post-list">
          {posts.map((post) => (
            <li key={post.slug} data-role="post">
              <h3>
                {post.frontmatter.source_url ? (
                  <a
                    href={post.frontmatter.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {post.frontmatter.title}
                  </a>
                ) : (
                  post.frontmatter.title
                )}
              </h3>
              <p data-role="date">{post.frontmatter.date}</p>
              <p>{post.frontmatter.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p data-role="empty">{frontmatter.empty}</p>
      )}

      {frontmatter.blog ? (
        <section data-section="blog-teaser">
          <h2>{frontmatter.blog.heading}</h2>
          {frontmatter.blog.body ? <p>{frontmatter.blog.body}</p> : null}
          <Link href={frontmatter.blog.cta.href}>
            {frontmatter.blog.cta.label}
          </Link>
        </section>
      ) : null}
    </article>
  );
}
