import Link from "next/link";
import type { Doc, EventFrontmatter, EventsLandingFrontmatter } from "@/lib/content";
import { eventPlace, formatEventWhen } from "@/lib/events";
import { localizedHref, type Locale } from "@/lib/i18n";

/**
 * One event on the /events listing — the news-card pattern (Homepage.dc.html
 * §4b) with the event facts as a meta line + chips. Past events keep full
 * text contrast but lose the tinted card and the Register button, and carry
 * a "Past event" pill, so they read as muted without failing WCAG contrast.
 */
export default function EventCard({
  event,
  locale,
  landing,
  past,
}: {
  event: Doc<EventFrontmatter>;
  locale: Locale;
  landing: EventsLandingFrontmatter;
  past: boolean;
}) {
  const fm = event.frontmatter;
  const { labels, formats } = landing;
  const when = formatEventWhen(fm, locale);
  const detailHref = localizedHref(`/events/${event.slug}`, locale);
  const chips = [formats[fm.format], eventPlace(fm), fm.cost].filter(
    (chip): chip is string => Boolean(chip)
  );

  return (
    <li
      data-role="event"
      data-past={past ? "true" : undefined}
      className={
        past
          ? "rounded-lg border border-hairline bg-page p-6 md:p-7"
          : "rounded-lg bg-subtle p-6 md:p-7"
      }
    >
      <p data-role="when" className="text-[13px] text-muted">
        {when.line}
      </p>
      <h3
        className={`mt-2.5 text-[19px] font-semibold leading-[1.35] text-pretty ${past ? "text-body" : "text-heading"}`}
      >
        <Link href={detailHref} className="transition-colors hover:text-link">
          {fm.title}
        </Link>
      </h3>
      <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
        {fm.summary}
      </p>
      <p data-role="organizer" className="mt-2.5 text-[13px] text-muted">
        {labels.organizer}: {fm.organizer}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {past ? (
          <span className="rounded-pill border border-hairline-strong px-2.5 py-[3px] text-[12px] font-semibold uppercase tracking-[0.04em] text-body">
            {labels.past}
          </span>
        ) : null}
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-pill bg-chip px-3 py-1 text-[12px] font-semibold text-chip-fg"
          >
            {chip}
          </span>
        ))}
      </div>
      <div
        data-role="actions"
        className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3"
      >
        {!past && fm.registrationUrl ? (
          <a
            href={fm.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-pill bg-cta px-5 py-2.5 text-[15px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:no-underline focus-visible:no-underline"
          >
            {labels.register}
          </a>
        ) : null}
        <Link
          href={detailHref}
          className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
        >
          {labels.details} →
        </Link>
      </div>
    </li>
  );
}
