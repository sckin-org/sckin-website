import Prose from "@/components/Prose";
import type { Doc, LegalFrontmatter } from "@/lib/content";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Format an ISO `YYYY-MM-DD` date as "December 2, 2025". Parsed by hand rather
 * than via `Date` so the rendered day can never drift with the timezone.
 * Falls back to the raw string if the value isn't a well-formed ISO date.
 */
function formatLastUpdated(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || m > 12 || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/**
 * Shared renderer for the legal pages (/privacy, /terms), styled to the
 * content-page template (Homepage.dc.html §4d): overline → title → subtitle →
 * last-updated line → divider → prose body from `content/legal/*.md`.
 */
export default function LegalDocument({
  doc,
}: {
  doc: Doc<LegalFrontmatter>;
}) {
  const { title, subtitle, lastUpdated } = doc.frontmatter;
  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="legal" className="mx-auto max-w-[720px]">
        <p className="overline-label text-muted">SCKIN</p>
        <h1 className="mt-4 text-(length:--font-size-h1) font-semibold leading-(--line-height-tight) tracking-(--tracking-tight) text-heading text-pretty">
          {title}
        </h1>
        <p
          data-role="subtitle"
          className="mt-3 text-[19px] leading-[1.5] text-body text-pretty"
        >
          {subtitle}
        </p>
        <p data-role="last-updated" className="mt-4 text-[13px] text-muted">
          Last updated: {formatLastUpdated(lastUpdated)}
        </p>
        <div className="mt-8 border-t border-(--gray-100) pt-8">
          <Prose html={doc.html} />
        </div>
      </article>
    </div>
  );
}
