import type { Metadata } from "next";
import Link from "next/link";
import { getAllNews, getNewsLanding } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

export function generateMetadata(): Metadata {
  const { frontmatter } = getNewsLanding();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Sickle Cell News landing — launch phase: intro, the "In development —
 * expected September 2026" badge, and post cards styled to the news-card
 * comp (Homepage.dc.html §4b). No topic/geography filters yet — those ship
 * with the taxonomy (<NewsBrowser /> is built and parked for that phase).
 */
export default function NewsPage() {
  const { frontmatter } = getNewsLanding();
  const posts = getAllNews();

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="news" className="mx-auto max-w-[720px]">
        <PageHeader title={frontmatter.title} subhead={frontmatter.intro} />
        {frontmatter.status ? (
          <p data-role="status" className="mt-4">
            <span className="rounded-pill border border-hairline-strong px-2.5 py-[3px] text-[12px] font-semibold uppercase tracking-[0.04em] text-body">
              {frontmatter.status}
            </span>
          </p>
        ) : null}

        {posts.length ? (
          <ul data-role="post-list" className="mt-8 grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <li
                key={post.slug}
                data-role="post"
                className="rounded-lg bg-subtle p-6 md:p-7"
              >
                <p data-role="date" className="text-[13px] text-muted">
                  {post.frontmatter.date}
                </p>
                <h3 className="mt-2.5 text-[19px] font-semibold leading-[1.35] text-heading text-pretty">
                  {post.frontmatter.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                  {post.frontmatter.summary}
                </p>
                {post.frontmatter.source_url ? (
                  <a
                    href={post.frontmatter.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3.5 inline-block text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
                  >
                    Read at source ↗
                  </a>
                ) : null}
                {post.frontmatter.topics?.length ||
                post.frontmatter.geographies?.length ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {[
                      ...(post.frontmatter.topics ?? []),
                      ...(post.frontmatter.geographies ?? []),
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-pill bg-chip px-3 py-1 text-[12px] font-semibold text-chip-fg"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p data-role="empty" className="mt-8 text-[15px] text-muted">
            {frontmatter.empty}
          </p>
        )}

        {frontmatter.blog ? (
          <section
            data-section="blog-teaser"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {frontmatter.blog.heading}
            </h2>
            {frontmatter.blog.body ? (
              <p className="mt-2 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {frontmatter.blog.body}
              </p>
            ) : null}
            <Link
              href={frontmatter.blog.cta.href}
              className="mt-3 inline-block text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
            >
              {frontmatter.blog.cta.label} →
            </Link>
          </section>
        ) : null}
      </article>
    </div>
  );
}
