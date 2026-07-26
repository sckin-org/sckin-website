import type { Metadata } from "next";
import { getAllBlogPosts, getBlogLanding } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
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
 * impact, milestones), distinct from the AI-summarized News feed. Card list
 * on the news-card pattern; posts are authored later in the /admin CMS into
 * content/blog/.
 */
export default function BlogPage() {
  const { frontmatter } = getBlogLanding();
  const posts = getAllBlogPosts();

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="blog" className="mx-auto max-w-[720px]">
        <PageHeader title={frontmatter.title} subhead={frontmatter.intro} />

        {posts.length ? (
          <ul data-role="post-list" className="mt-8 flex flex-col gap-4">
            {posts.map((post) => (
              <li
                key={post.slug}
                data-role="post"
                className="rounded-lg bg-subtle p-6 md:p-7"
              >
                <p data-role="meta" className="text-[13px] text-muted">
                  {[post.frontmatter.author, post.frontmatter.date]
                    .filter(Boolean)
                    .join(" · ")}
                  {post.frontmatter.tag ? ` · ${post.frontmatter.tag}` : ""}
                </p>
                <h3 className="mt-2.5 text-[19px] font-semibold leading-[1.35] text-heading text-pretty">
                  {post.frontmatter.title}
                </h3>
                {post.frontmatter.summary ? (
                  <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                    {post.frontmatter.summary}
                  </p>
                ) : null}
                <Prose html={post.html} className="mt-3 text-[15px]" />
              </li>
            ))}
          </ul>
        ) : (
          <p data-role="empty" className="mt-8 text-[15px] text-muted">
            {frontmatter.empty}
          </p>
        )}
      </article>
    </div>
  );
}
