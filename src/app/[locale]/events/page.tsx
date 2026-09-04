import type { Metadata } from "next";
import { getAllEvents, getEventsLanding } from "@/lib/content";
import { splitEvents } from "@/lib/events";
import type { Locale } from "@/lib/i18n";
import EventCard from "@/components/EventCard";
import PageHeader from "@/components/PageHeader";

/**
 * The upcoming/past split compares eventEnd to "now" at render time. Pages
 * are prerendered, so revalidate hourly (ISR): an event moves to Past within
 * an hour of ending, with no deploy.
 */
export const revalidate = 3600;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const { frontmatter } = getEventsLanding(locale);
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Sickle Cell Events — third-party webinars, symposia, awareness days and
 * patient-association meetings relayed by SCKIN (News ▾ → Events). Two
 * groups, Upcoming (soonest first) and Past (most recent first), on the
 * news-card pattern; copy and every label come from content/events.md.
 */
export default async function EventsPage({ params }: { params: Params }) {
  const { locale } = await params;
  const activeLocale = locale as Locale;
  const { frontmatter } = getEventsLanding(activeLocale);
  const { upcoming, past } = splitEvents(getAllEvents(activeLocale));

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="events" className="mx-auto max-w-[720px]">
        <PageHeader title={frontmatter.title} subhead={frontmatter.intro} />
        <p data-role="disclaimer" className="mt-4 text-[13px] text-muted">
          {frontmatter.disclaimer}
        </p>

        <section data-section="upcoming" className="mt-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
            {frontmatter.upcoming_heading}
          </h2>
          {upcoming.length ? (
            <ul data-role="event-list" className="mt-4 flex flex-col gap-4">
              {upcoming.map((event) => (
                <EventCard
                  key={event.slug}
                  event={event}
                  locale={activeLocale}
                  landing={frontmatter}
                  past={false}
                />
              ))}
            </ul>
          ) : (
            <p data-role="empty" className="mt-3 text-[15px] text-muted">
              {frontmatter.empty}
            </p>
          )}
        </section>

        {past.length ? (
          <section
            data-section="past"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {frontmatter.past_heading}
            </h2>
            <ul data-role="event-list" className="mt-4 flex flex-col gap-4">
              {past.map((event) => (
                <EventCard
                  key={event.slug}
                  event={event}
                  locale={activeLocale}
                  landing={frontmatter}
                  past
                />
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </div>
  );
}
