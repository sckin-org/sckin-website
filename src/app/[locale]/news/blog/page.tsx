import type { Metadata } from "next";
import Image from "next/image";
import {
  getAllBlogPosts,
  getBlogLanding,
  publicFileExists,
} from "@/lib/content";
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
 *
 * A post may carry a featured image (optionally linking out, e.g. to a flyer
 * PDF), a primary CTA pill and secondary links — all optional, all rendered
 * new-tab because they point off-site or at downloadable files.
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
            {posts.map((post) => {
              const { image, image_alt, image_href, cta, links } =
                post.frontmatter;
              const featured =
                image && publicFileExists(image) ? (
                  <Image
                    src={image}
                    alt={image_alt ?? ""}
                    width={1200}
                    height={1553}
                    sizes="(max-width: 767px) 100vw, 400px"
                    className="h-auto w-full rounded-md border border-hairline"
                  />
                ) : null;

              return (
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
                  {featured ? (
                    <div data-role="featured-image" className="mt-4 max-w-[400px]">
                      {image_href ? (
                        <a
                          href={image_href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-md transition-opacity hover:opacity-90"
                        >
                          {featured}
                        </a>
                      ) : (
                        featured
                      )}
                    </div>
                  ) : null}
                  <Prose html={post.html} className="mt-3 text-[15px]" />
                  {cta || links?.length ? (
                    <div
                      data-role="actions"
                      className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3"
                    >
                      {cta ? (
                        <a
                          href={cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-pill bg-cta px-5 py-2.5 text-[15px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:no-underline focus-visible:no-underline"
                        >
                          {cta.label}
                        </a>
                      ) : null}
                      {links?.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
                        >
                          {link.label} ↗
                        </a>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
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
