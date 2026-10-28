/**
 * Books (/resources/books) — the facets, filtering, sorting and URL-state
 * helpers shared by the server page and the client-side <BookBrowser />.
 * Kept free of Node imports so the client bundle can use it; the loader that
 * reads content/books/*.md lives in src/lib/content.ts (getAllBooks).
 */

export interface Facet {
  /** URL value, e.g. `?audience=young-adults`. */
  slug: string;
  label: string;
}

/** Pill rows, in display order. Matching against frontmatter is by slug, so
 * "Young Adults", "young adults" and "young-adults" all land on one pill. */
export const AUDIENCES: Facet[] = [
  { slug: "children", label: "Children" },
  { slug: "young-adults", label: "Young Adults" },
  { slug: "patients", label: "Patients" },
  { slug: "caregivers", label: "Caregivers" },
  { slug: "hcp", label: "HCP" },
];

export const THEMES: Facet[] = [
  { slug: "health", label: "Health" },
  { slug: "social", label: "Social" },
  { slug: "memoirs", label: "Memoirs" },
  { slug: "biography", label: "Biography" },
  { slug: "fiction", label: "Fiction" },
];

export type BookSort = "order" | "az" | "year";

export const SORTS: Array<{ value: BookSort; label: string }> = [
  { value: "order", label: "Recommended" },
  { value: "az", label: "A–Z" },
  { value: "year", label: "Year (newest)" },
];

/** A book as the page renders it: frontmatter normalized (arrays are arrays,
 * empty strings dropped, facet values slugged). */
export interface Book {
  slug: string;
  title: string;
  subtitle?: string;
  author?: string;
  publisher?: string;
  selfPublished: boolean;
  year?: number;
  isbn?: string;
  audience: string[];
  theme: string[];
  amazonUrl?: string;
  bookshopUrl?: string;
  freeUrl?: string;
  blurb?: string;
  zachPick: boolean;
  order?: number;
  /** Self-hosted cover (public/images/books/{isbn}.jpg) when present, else
   * the Open Library URL; absent without an ISBN. */
  cover?: string;
}

export interface BookFilters {
  audience: string[];
  theme: string[];
  sort: BookSort;
}

export const DEFAULT_FILTERS: BookFilters = {
  audience: [],
  theme: [],
  sort: "order",
};

export function facetSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** OR within a row, AND across rows; an empty row matches everything. */
export function filterBooks(books: Book[], filters: BookFilters): Book[] {
  const matches = (selected: string[], values: string[]) =>
    selected.length === 0 || selected.some((s) => values.includes(s));
  return books.filter(
    (book) =>
      matches(filters.audience, book.audience) &&
      matches(filters.theme, book.theme)
  );
}

const byTitle = (a: Book, b: Book) =>
  a.title.localeCompare(b.title, "en", { sensitivity: "base" });

/** `order` ascending (unordered entries last), A–Z, or newest year first;
 * title breaks every tie so the result is stable across builds. */
export function sortBooks(books: Book[], sort: BookSort): Book[] {
  const sorted = [...books];
  if (sort === "az") return sorted.sort(byTitle);
  if (sort === "year") {
    return sorted.sort(
      (a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity) || byTitle(a, b)
    );
  }
  return sorted.sort(
    (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || byTitle(a, b)
  );
}

/** Read `?audience=a,b&theme=c&sort=az`, ignoring values we do not offer. */
export function parseFilters(search: string): BookFilters {
  const params = new URLSearchParams(search);
  const pick = (key: string, facets: Facet[]) => {
    const allowed = new Set(facets.map((f) => f.slug));
    const values = (params.get(key) ?? "").split(",").map(facetSlug);
    return [...new Set(values)].filter((v) => allowed.has(v));
  };
  const sort = params.get("sort");
  return {
    audience: pick("audience", AUDIENCES),
    theme: pick("theme", THEMES),
    sort: SORTS.some((s) => s.value === sort) ? (sort as BookSort) : "order",
  };
}

/** The inverse of parseFilters; defaults are omitted so the plain URL stays
 * plain. Commas are left unescaped to keep shared links readable. */
export function serializeFilters(filters: BookFilters): string {
  const parts: string[] = [];
  if (filters.audience.length) parts.push(`audience=${filters.audience.join(",")}`);
  if (filters.theme.length) parts.push(`theme=${filters.theme.join(",")}`);
  if (filters.sort !== "order") parts.push(`sort=${filters.sort}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

/** Open Library cover by ISBN; `default=false` makes a missing cover a 404 so
 * the card can fall back to the designed title card. */
export function coverUrl(isbn: string): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
}
