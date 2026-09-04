import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllEvents,
  getEvent,
  getEventsLanding,
  publicFileExists,
} from "@/lib/content";
import { eventPlace, formatEventWhen, isPastEvent } from "@/lib/events";
import { localizedHref, type Locale } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";

/** Hourly ISR, as on the listing, so Register disappears once the event ends. */
export const revalidate = 3600;
/** Only slugs with a content file exist; anything else is a 404. */
export const dynamicParams = false;

type Params = Promise<{ locale: string; slug: string }>;

/** One page per event file, per locale (the layout supplies the locales). */
export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  return getAllEvents(params.locale).map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = getEvent(slug, locale);
  if (!event) return {};
  return {
    title: event.frontmatter.title,
    description: event.frontmatter.summary,
  };
}

/**
 * Event detail — facts block (when · where · format · organizer · speakers ·
 * cost), the flyer (linking to the PDF), body prose, then Register / flyer /
 * add-to-calendar. Register and the calendar link hide once the event is
 * past. Attributed to the organizer and the sourceNote, never to a SCKIN
 * author; the community disclaimer closes every page.
 */
export default async function EventPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const activeLocale = locale as Locale;
  const event = getEvent(slug, activeLocale);
  if (!event) notFound();

  const { frontmatter: landing } = getEventsLanding(activeLocale);
  const { labels, formats } = landing;
  const fm = event.frontmatter;
  const when = formatEventWhen(fm, activeLocale);
  const place = eventPlace(fm);
  const past = isPastEvent(fm);
  const href = (path: string) => localizedHref(path, activeLocale);
  const flyer =
    fm.flyerImage && publicFileExists(fm.flyerImage) ? (
      <Image
        src={fm.flyerImage}
        alt={fm.flyerImageAlt ?? ""}
        width={1200}
        height={1553}
        sizes="(max-width: 767px) 100vw, 400px"
        className="h-auto w-full rounded-md border border-hairline"
      />
    ) : null;

  const facts: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: labels.when,
      value: (
        <>
          {when.date ? (
            <>
              {when.date}
              <br />
            </>
          ) : null}
          {when.time} {when.timeZone}
        </>
      ),
    },
    { label: labels.where, value: place ?? formats[fm.format] },
    { label: labels.format, value: formats[fm.format] },
    { label: labels.organizer, value: fm.organizer },
    ...(fm.speakers?.length
      ? [{ label: labels.speakers, value: fm.speakers.join(", ") }]
      : []),
    ...(fm.cost ? [{ label: labels.cost, value: fm.cost }] : []),
  ];

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="event" className="mx-auto max-w-[720px]">
        <p className="mb-6">
          <Link
            href={href("/events")}
            className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
          >
            ← {labels.back}
          </Link>
        </p>
        <PageHeader
          overline={landing.nav_label ?? landing.title}
          title={fm.title}
          subhead={fm.summary}
          meta={when.line}
        />

        <dl
          data-role="facts"
          className="mt-6 rounded-lg bg-subtle p-6 md:grid md:grid-cols-[max-content_1fr] md:gap-x-8 md:gap-y-3 md:p-7"
        >
          {facts.map((fact) => (
            <div key={fact.label} className="mt-3 first:mt-0 md:contents">
              <dt className="text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">
                {fact.label}
              </dt>
              <dd className="mt-0.5 text-[15px] leading-(--line-height-body) text-body md:mt-0">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        {past ? (
          <p data-role="status" className="mt-4">
            <span className="rounded-pill border border-hairline-strong px-2.5 py-[3px] text-[12px] font-semibold uppercase tracking-[0.04em] text-body">
              {labels.past}
            </span>
          </p>
        ) : null}

        {flyer ? (
          <div data-role="flyer" className="mt-6 max-w-[400px]">
            {fm.flyerPdf ? (
              <a
                href={fm.flyerPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md transition-opacity hover:opacity-90"
              >
                {flyer}
              </a>
            ) : (
              flyer
            )}
          </div>
        ) : null}

        <Prose html={event.html} className="mt-6" />

        {(!past && fm.registrationUrl) || fm.flyerPdf ? (
          <div
            data-role="actions"
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3"
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
            {fm.flyerPdf ? (
              <a
                href={fm.flyerPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
              >
                {labels.flyer} ↗
              </a>
            ) : null}
            {!past ? (
              <a
                href={href(`/events/${event.slug}/calendar`)}
                className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
              >
                {labels.calendar} ↓
              </a>
            ) : null}
          </div>
        ) : null}

        {fm.sourceNote ? (
          <p data-role="source" className="mt-6 text-[13px] text-muted">
            {fm.sourceNote}
          </p>
        ) : null}
        <p data-role="disclaimer" className="mt-2 text-[13px] text-muted">
          {landing.disclaimer}
        </p>
      </article>
    </div>
  );
}
