import type { Metadata } from "next";
import { getAllBooks, getBooksLanding } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import BookBrowser from "@/components/BookBrowser";

export function generateMetadata(): Metadata {
  const { frontmatter } = getBooksLanding();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * /resources/books — the first live Resources product. Copy and disclosures
 * come from content/books.md, entries from content/books/*.md (see
 * getAllBooks for the clinical-review gate). The disclosures sit above the
 * filters so they precede every affiliate link on the page.
 */
export default function BooksPage() {
  const { frontmatter } = getBooksLanding();
  const books = getAllBooks();

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="books" className="mx-auto max-w-[1040px]">
        <div className="max-w-[720px]">
          <PageHeader
            overline="SCKIN Resources"
            title={frontmatter.title}
            subhead={frontmatter.intro}
          />
        </div>

        <aside
          data-role="disclosures"
          aria-label="Disclosures"
          className="mt-8 flex max-w-[720px] flex-col gap-2 rounded-md bg-subtle px-5 py-4 text-[14px] leading-[1.5] text-body"
        >
          {frontmatter.disclosures.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </aside>

        <div className="mt-10">
          {books.length ? (
            <BookBrowser books={books} />
          ) : (
            <p data-role="empty" className="text-[15px] text-body">
              {frontmatter.empty}
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
