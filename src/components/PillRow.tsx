import type { Facet } from "@/lib/facets";

/**
 * One row of toggle pills under a legend — the filter control on the
 * Resources browsers (BookBrowser, ArticleBrowser). Each pill is a button
 * with `aria-pressed`, so its state is announced, not shown by colour alone.
 */
export default function PillRow({
  legend,
  facets,
  selected,
  onToggle,
}: {
  legend: string;
  facets: Facet[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <fieldset>
      <legend className="overline-label text-body">{legend}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {facets.map((facet) => {
          const on = selected.includes(facet.slug);
          return (
            <button
              key={facet.slug}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(facet.slug)}
              className={
                on
                  ? "rounded-pill border border-selected bg-selected px-3.5 py-1.5 text-[14px] font-semibold text-on-selected transition-colors"
                  : "rounded-pill border border-hairline-strong px-3.5 py-1.5 text-[14px] font-semibold text-body transition-colors hover:border-heading hover:text-heading"
              }
            >
              {facet.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
