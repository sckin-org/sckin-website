import type { Metadata } from "next";
import { getAllBlogPosts, getBlogLanding } from "@/lib/content";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getBlogLanding();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * SCKIN Blog — announcements and updates in SCKIN's own voice (product,
 * impact, milestones), distinct from the AI-summarized News feed. Linked from
 * the News landing page. Card list scaffold; posts are authored later in the
 * /admin CMS into content/blog/.
 */
export default function BlogPage() {
  const { frontmatter } = getBlogLanding();
  const posts = getAllBlogPosts();

  return (
    <article data-page="blog">
      <h1>{frontmatter.title}</h1>
      {frontmatter.intro ? <p>{frontmatter.intro}</p> : null}

      {posts.length ? (
        <ul data-role="post-list">
          {posts.map((post) => (
            <li key={post.slug} data-role="post">
              <h3>{post.frontmatter.title}</h3>
              <p data-role="meta">
                {[post.frontmatter.author, post.frontmatter.date]
                  .filter(Boolean)
                  .join(" · ")}
                {post.frontmatter.tag ? ` · ${post.frontmatter.tag}` : ""}
              </p>
              {post.frontmatter.summary ? (
                <p>{post.frontmatter.summary}</p>
              ) : null}
              <Prose html={post.html} />
            </li>
          ))}
        </ul>
      ) : (
        <p data-role="empty">{frontmatter.empty}</p>
      )}
    </article>
  );
}
