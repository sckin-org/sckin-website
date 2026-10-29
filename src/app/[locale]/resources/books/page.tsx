import type { Metadata } from "next";
import { getAllBooks, getBooksLanding } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import BookBrowser from "@/components/BookBrowser";
import BookSuggestionForm from "@/components/BookSuggestionForm";

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
 * getAllBooks for cover resolution). The disclosures sit above the
 * filters so they precede every affiliate link on the page — the
 * Bookshop.org list link included, which follows them directly; the
 * "Suggest a book" toggle sits between those and the list.
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

        <p
          data-role="bookshop-list"
          className="mt-5 max-w-[720px] text-[15px] leading-(--line-height-body) text-body"
        >
          <a
            href={frontmatter.store.url}
            target="_blank"
            rel="noopener sponsored"
            className="font-semibold text-link transition-colors hover:text-link-hover"
          >
            {frontmatter.store.link}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>{" "}
          — {frontmatter.store.note}
        </p>

        <div className="mt-4 max-w-[720px]">
          <BookSuggestionForm copy={frontmatter.suggest} />
        </div>

        <div className="mt-8">
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
