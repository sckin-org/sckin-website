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
 * Shared renderer for the legal pages (/privacy, /terms). Renders the
 * frontmatter of a `content/legal/*.md` file — title, subtitle, last-updated
 * line — then the Markdown body as prose.
 */
export default function LegalDocument({
  doc,
}: {
  doc: Doc<LegalFrontmatter>;
}) {
  const { title, subtitle, lastUpdated } = doc.frontmatter;
  return (
    <article data-page="legal">
      <h1>{title}</h1>
      <p data-role="subtitle">{subtitle}</p>
      <p data-role="last-updated">
        Last updated: {formatLastUpdated(lastUpdated)}
      </p>
      <Prose html={doc.html} />
    </article>
  );
}
