/**
 * Articles (/resources/articles) — the record types, facets, filtering,
 * ordering and URL-state helpers shared by the server page and the
 * client-side <ArticleBrowser />. Kept free of Node imports so the client
 * bundle can use it; the loader that reads content/articles.json lives in
 * src/lib/content.ts (getAllArticles).
 */

import { facetSlug, type Facet } from "@/lib/facets";

/**
 * One record of content/articles.json, exactly as stored. Field names map
 * 1:1 to the planned `articles` table in Postgres — keep them stable.
 * `editorNote` is internal: getAllArticles strips it before anything renders,
 * so it never reaches the HTML or the client payload.
 */
export interface ArticleRecord {
  /** `{year}-{firstAuthor}-{shortTitle}`, slugged; the card's anchor. */
  id: string;
  year: number;
  shortTitle: string;
  title: string;
  firstAuthor: string;
  journal: string;
  citation: string;
  doi: string | null;
  pmid: string | null;
  freeFullTextUrl: string | null;
  /** File name under public/articles/, served at /articles/{hostedPdf}. */
  hostedPdf: string | null;
  theme: string;
  tags: string[];
  impact: string;
  studyType: string;
  regions: string[];
  population: string;
  /** "Current" or "Superseded". */
  currency: string;
  /** `id` of the article that replaces this one, when Superseded. */
  supersededBy: string | null;
  established: string;
  plainLanguageNote: string | null;
  editorNote: string | null;
}

/** An article as the page renders it: the record minus `editorNote`. */
export type Article = Omit<ArticleRecord, "editorNote">;

/** Facet values in display order; `label` is the value as stored. Options
 * the data does not use are dropped (articleFacets), and any value the data
 * uses that is missing here is appended, so a new value still filters. */
const THEMES = ["Biology", "Epidemiology", "Drug therapy", "Disease management", "Curative therapy"];
const IMPACTS = ["Changed understanding", "Changed practice"];
const STUDY_TYPES = ["Case report", "Lab/genetics", "Cohort", "RCT", "Review/guideline"];
const REGIONS = ["Global", "High-income", "Sub-Saharan Africa", "India"];
const POPULATIONS = ["Children", "Adults", "All"];

export const GUIDELINES_TAG = "Guidelines";

/** The multi-select facet rows, keyed by their query-string name. */
export type FacetKey = "theme" | "impact" | "study" | "region" | "population";

export const FACET_ROWS: Array<{ key: FacetKey; legend: string }> = [
  { key: "theme", legend: "Theme" },
  { key: "impact", legend: "Impact" },
  { key: "study", legend: "Study type" },
  { key: "region", legend: "Region" },
  { key: "population", legend: "Population" },
];

/** The record values a facet row matches against (a record can sit in
 * several regions, so every row reads as a list). */
const valuesOf: Record<FacetKey, (a: Article) => string[]> = {
  theme: (a) => [a.theme],
  impact: (a) => [a.impact],
  study: (a) => [a.studyType],
  region: (a) => a.regions,
  population: (a) => [a.population],
};

const CANONICAL: Record<FacetKey, string[]> = {
  theme: THEMES,
  impact: IMPACTS,
  study: STUDY_TYPES,
  region: REGIONS,
  population: POPULATIONS,
};

export type ArticleFacets = Record<FacetKey, Facet[]>;

/** Pill options per row, derived from the data in the canonical order. */
export function articleFacets(articles: Article[]): ArticleFacets {
  const rows = {} as ArticleFacets;
  for (const { key } of FACET_ROWS) {
    const present = new Set(articles.flatMap(valuesOf[key]));
    const extra = [...present]
      .filter((v) => !CANONICAL[key].includes(v))
      .sort((a, b) => a.localeCompare(b, "en"));
    rows[key] = [...CANONICAL[key].filter((v) => present.has(v)), ...extra].map(
      (label) => ({ slug: facetSlug(label), label })
    );
  }
  return rows;
}

export type ArticleOrder = "oldest" | "newest";

export interface ArticleFilters extends Record<FacetKey, string[]> {
  guidelines: boolean;
  free: boolean;
  order: ArticleOrder;
}

export const DEFAULT_FILTERS: ArticleFilters = {
  theme: [],
  impact: [],
  study: [],
  region: [],
  population: [],
  guidelines: false,
  free: false,
  order: "oldest",
};

export function isGuideline(article: Article): boolean {
  return article.tags.includes(GUIDELINES_TAG);
}

/** Any facet narrowing the list (the order is not a filter). */
export function hasFilters(filters: ArticleFilters): boolean {
  return (
    FACET_ROWS.some(({ key }) => filters[key].length > 0) ||
    filters.guidelines ||
    filters.free
  );
}

/** OR within a row, AND across rows; an empty row matches everything. The
 * input order is kept — filters never reorder the list. */
export function filterArticles(
  articles: Article[],
  filters: ArticleFilters
): Article[] {
  return articles.filter(
    (article) =>
      FACET_ROWS.every(({ key }) => {
        const selected = filters[key];
        if (selected.length === 0) return true;
        const values = valuesOf[key](article).map(facetSlug);
        return selected.some((s) => values.includes(s));
      }) &&
      (!filters.guidelines || isGuideline(article)) &&
      (!filters.free || Boolean(article.freeFullTextUrl))
  );
}

/** Publication year, oldest or newest first. Same-year papers keep their
 * order in content/articles.json (oldest first) and reverse with the list,
 * so newest-first is the exact mirror of the default. */
export function sortArticles(
  articles: Article[],
  order: ArticleOrder
): Article[] {
  const sorted = [...articles].sort((a, b) => a.year - b.year);
  return order === "newest" ? sorted.reverse() : sorted;
}

/** Read `?theme=a,b&study=rct&guidelines=1&free=1&sort=newest`, ignoring
 * values the page does not offer. */
export function parseFilters(
  search: string,
  facets: ArticleFacets
): ArticleFilters {
  const params = new URLSearchParams(search);
  const filters: ArticleFilters = { ...DEFAULT_FILTERS };
  for (const { key } of FACET_ROWS) {
    const allowed = new Set(facets[key].map((f) => f.slug));
    const values = (params.get(key) ?? "").split(",").map(facetSlug);
    filters[key] = [...new Set(values)].filter((v) => allowed.has(v));
  }
  filters.guidelines = params.get("guidelines") === "1";
  filters.free = params.get("free") === "1";
  filters.order = params.get("sort") === "newest" ? "newest" : "oldest";
  return filters;
}

/** The inverse of parseFilters; defaults are omitted so the plain URL stays
 * plain. Commas are left unescaped to keep shared links readable. */
export function serializeFilters(filters: ArticleFilters): string {
  const parts: string[] = [];
  for (const { key } of FACET_ROWS) {
    if (filters[key].length) parts.push(`${key}=${filters[key].join(",")}`);
  }
  if (filters.guidelines) parts.push("guidelines=1");
  if (filters.free) parts.push("free=1");
  if (filters.order !== "oldest") parts.push(`sort=${filters.order}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}

export function pubmedUrl(pmid: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
}

/** A hosted copy under public/articles/; tolerates a leading slash or a
 * value that already carries the /articles/ prefix. */
export function hostedPdfUrl(hostedPdf: string): string {
  return `/articles/${hostedPdf.replace(/^\/?(articles\/)?/, "")}`;
}
