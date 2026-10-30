"use client";

import { useEffect, useState } from "react";
import BookCard from "@/components/BookCard";
import PillRow from "@/components/PillRow";
import {
  AUDIENCES,
  DEFAULT_FILTERS,
  SORTS,
  THEMES,
  filterBooks,
  parseFilters,
  serializeFilters,
  sortBooks,
  type Book,
  type BookFilters,
  type BookSort,
} from "@/lib/books";

/**
 * Filterable book list for /resources/books. Audience and Theme pill rows
 * (OR within a row, AND across rows) plus a sort select; state lives in the
 * query string (`?audience=patients,caregivers&theme=health&sort=az`) so a
 * filtered view can be shared.
 *
 * The server render is the unfiltered default view, so the full list is in
 * the static HTML and works with JS disabled. The URL is read only after
 * hydration (not via useSearchParams, which would make the prerender emit a
 * Suspense fallback instead of the list).
 */
export default function BookBrowser({ books }: { books: Book[] }) {
  const [filters, setFilters] = useState<BookFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    setFilters(parseFilters(window.location.search));
  }, []);

  const update = (next: BookFilters) => {
    setFilters(next);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${serializeFilters(next)}`
    );
  };

  const toggle = (row: "audience" | "theme", slug: string) => {
    const selected = filters[row];
    update({
      ...filters,
      [row]: selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug],
    });
  };

  const visible = sortBooks(filterBooks(books, filters), filters.sort);
  const filtered = filters.audience.length > 0 || filters.theme.length > 0;

  return (
    <div data-component="book-browser">
      <div data-role="filters" className="flex flex-col gap-5">
        <PillRow
          legend="Audience"
          facets={AUDIENCES}
          selected={filters.audience}
          onToggle={(slug) => toggle("audience", slug)}
        />
        <PillRow
          legend="Theme"
          facets={THEMES}
          selected={filters.theme}
          onToggle={(slug) => toggle("theme", slug)}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-hairline pb-4">
        <p data-role="result-count" aria-live="polite" className="text-[15px] text-body">
          {filtered
            ? `${visible.length} of ${books.length} ${books.length === 1 ? "book" : "books"}`
            : `${books.length} ${books.length === 1 ? "book" : "books"}`}
          {filtered ? (
            <button
              type="button"
              onClick={() => update({ ...filters, audience: [], theme: [] })}
              className="ml-3 font-semibold text-link transition-colors hover:text-link-hover"
            >
              Clear filters
            </button>
          ) : null}
        </p>
        <label className="flex items-center gap-2 text-[15px] text-body">
          Sort by
          <select
            value={filters.sort}
            onChange={(e) => update({ ...filters, sort: e.target.value as BookSort })}
            className="rounded-sm border border-input bg-page px-2.5 py-1.5 text-[15px] text-heading"
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length ? (
        <ul data-role="book-list" className="mt-6 grid gap-4 lg:grid-cols-2">
          {visible.map((book) => (
            <li key={book.slug}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      ) : (
        <p data-role="no-match" className="mt-6 text-[15px] text-body">
          No books match these filters. Try removing one.
        </p>
      )}
    </div>
  );
}
