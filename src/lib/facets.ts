/**
 * Filter-pill primitives shared by the Resources browsers (Books, Articles).
 * Kept free of Node imports so client components can use them.
 */

export interface Facet {
  /** URL value, e.g. `?audience=young-adults`. */
  slug: string;
  label: string;
}

export function facetSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
