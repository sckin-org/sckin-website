import type { Metadata } from "next";
import Link from "next/link";
import { getResources } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

export function generateMetadata(): Metadata {
  const { frontmatter } = getResources();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * /resources — hub for the five Resources products (content/resources.md).
 * Books and Articles are live: their cards are links; the others are plain
 * cards with a "Coming soon" pill and are deliberately not clickable.
 */
export default function ResourcesPage() {
  const { frontmatter } = getResources();

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="resources" className="mx-auto max-w-[880px]">
        <div className="max-w-[720px]">
          <PageHeader title={frontmatter.title} subhead={frontmatter.intro} />
        </div>

        <ul data-role="product-list" className="mt-10 grid gap-4 md:grid-cols-2">
          {frontmatter.products.map((product) => {
            const body = (
              <>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[19px] font-semibold leading-[1.35] text-heading">
                    {product.name}
                  </h2>
                  {!product.href && product.tag ? (
                    <span className="rounded-pill border border-hairline-strong px-2.5 py-[3px] text-[12px] font-semibold uppercase tracking-[0.04em] text-body">
                      {product.tag}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                  {product.description}
                </p>
                {product.href ? (
                  <span
                    aria-hidden="true"
                    className="mt-3.5 inline-block text-[15px] font-semibold text-link transition-colors group-hover:text-link-hover"
                  >
                    Browse {product.name.toLowerCase()} →
                  </span>
                ) : null}
              </>
            );

            return (
              <li key={product.name} data-role="product" className="flex">
                {product.href ? (
                  <Link
                    href={product.href}
                    className="group block w-full rounded-lg border border-hairline-strong bg-page p-6 transition-shadow hover:no-underline hover:shadow-card focus-visible:no-underline md:p-7"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="w-full rounded-lg bg-subtle p-6 md:p-7">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </article>
    </div>
  );
}
