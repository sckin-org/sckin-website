"use client";

import { useEffect, useRef, useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import PillRow from "@/components/PillRow";
import {
  DEFAULT_FILTERS,
  FACET_ROWS,
  filterArticles,
  hasFilters,
  parseFilters,
  serializeFilters,
  sortArticles,
  type Article,
  type ArticleFacets,
  type ArticleFilters,
  type FacetKey,
} from "@/lib/articles";

/** The two on/off filters, shown as one pill row after the facets. */
const SHOW_ONLY = [
  { slug: "guidelines", label: "Guidelines" },
  { slug: "free", label: "Free full text only" },
] as const;

/**
 * Filterable reading list for /resources/articles — the BookBrowser pattern:
 * pill rows for Theme, Impact, Study type, Region and Population (OR within
 * a row, AND across rows), plus Guidelines and Free-full-text toggles, and a
 * "Newest first" toggle. Filters only narrow the list; the order is the
 * toggle's alone. State lives in the query string
 * (`?theme=biology&study=rct,cohort&free=1&sort=newest`) so a filtered view
 * can be shared; the `#id` hash of a deep link is kept.
 *
 * The server render is the unfiltered, oldest-first view, so the full list
 * is in the static HTML and works with JS disabled. The URL is read only
 * after hydration (not via useSearchParams, which would make the prerender
 * emit a Suspense fallback instead of the list).
 */
export default function ArticleBrowser({
  articles,
  facets,
}: {
  articles: Article[];
  facets: ArticleFacets;
}) {
  const [filters, setFilters] = useState<ArticleFilters>(DEFAULT_FILTERS);

  // The latest filters, for the hashchange listener registered once below.
  const current = useRef(filters);
  useEffect(() => {
    current.current = filters;
  }, [filters]);

  const update = (next: ArticleFilters) => {
    current.current = next;
    setFilters(next);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${serializeFilters(next)}${window.location.hash}`
    );
  };

  useEffect(() => {
    // A link to a card the filters hide (a "Superseded by" link, or a shared
    // URL) clears the facets, keeping the order, so the card can be shown
    // and scrolled to.
    const reveal = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id || !articles.some((a) => a.id === id)) return;
      if (filterArticles(articles, current.current).some((a) => a.id === id)) return;
      update({ ...DEFAULT_FILTERS, order: current.current.order });
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    };

    const parsed = parseFilters(window.location.search, facets);
    current.current = parsed;
    setFilters(parsed);
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `update` only touches state and the URL
  }, [articles, facets]);

  const toggle = (row: FacetKey, slug: string) => {
    const selected = filters[row];
    update({
      ...filters,
      [row]: selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug],
    });
  };

  const byId = new Map(articles.map((a) => [a.id, a]));
  const visible = sortArticles(filterArticles(articles, filters), filters.order);
  const filtered = hasFilters(filters);
  const noun = articles.length === 1 ? "article" : "articles";
  const newest = filters.order === "newest";

  return (
    <div data-component="article-browser">
      <div data-role="filters" className="grid gap-5 md:grid-cols-2 md:gap-x-10">
        {FACET_ROWS.map(({ key, legend }) =>
          facets[key].length ? (
            <PillRow
              key={key}
              legend={legend}
              facets={facets[key]}
              selected={filters[key]}
              onToggle={(slug) => toggle(key, slug)}
            />
          ) : null
        )}
        <PillRow
          legend="Show only"
          facets={[...SHOW_ONLY]}
          selected={SHOW_ONLY.filter((t) => filters[t.slug]).map((t) => t.slug)}
          onToggle={(slug) => {
            const key = slug as (typeof SHOW_ONLY)[number]["slug"];
            update({ ...filters, [key]: !filters[key] });
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-hairline pb-4">
        <p data-role="result-count" aria-live="polite" className="text-[15px] text-body">
          {filtered
            ? `${visible.length} of ${articles.length} ${noun}`
            : `${articles.length} ${noun}`}
          {filtered ? (
            <button
              type="button"
              onClick={() =>
                update({ ...DEFAULT_FILTERS, order: filters.order })
              }
              className="ml-3 font-semibold text-link transition-colors hover:text-link-hover"
            >
              Clear filters
            </button>
          ) : null}
        </p>
        <button
          type="button"
          data-role="order-toggle"
          aria-pressed={newest}
          onClick={() =>
            update({ ...filters, order: newest ? "oldest" : "newest" })
          }
          className={
            newest
              ? "rounded-pill border border-selected bg-selected px-3.5 py-1.5 text-[14px] font-semibold text-on-selected transition-colors"
              : "rounded-pill border border-hairline-strong px-3.5 py-1.5 text-[14px] font-semibold text-body transition-colors hover:border-heading hover:text-heading"
          }
        >
          Newest first
        </button>
      </div>

      {visible.length ? (
        <ol data-role="article-list" className="mt-6 grid gap-4">
          {visible.map((article) => (
            <li key={article.id}>
              <ArticleCard
                article={article}
                replacement={
                  article.supersededBy ? byId.get(article.supersededBy) : undefined
                }
              />
            </li>
          ))}
        </ol>
      ) : (
        <p data-role="no-match" className="mt-6 text-[15px] text-body">
          No articles match these filters. Try removing one.
        </p>
      )}
    </div>
  );
}
