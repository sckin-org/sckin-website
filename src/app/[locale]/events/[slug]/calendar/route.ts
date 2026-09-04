import { getEvent } from "@/lib/content";
import { buildIcs } from "@/lib/events";
import { isLocale, localizedHref } from "@/lib/i18n";

/**
 * GET /events/<slug>/calendar — the event as a downloadable .ics file
 * ("Add to calendar" on the event page). Path has no extension on purpose:
 * the locale middleware skips dotted paths, so `calendar.ics` would never be
 * rewritten into the `[locale]` tree.
 *
 * Reads the request origin for the absolute page URL, which makes this a
 * dynamic handler (fine on Fluid Compute); the response is cacheable for an
 * hour like the event pages.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return new Response("Not found", { status: 404 });
  const event = getEvent(slug, locale);
  if (!event) return new Response("Not found", { status: 404 });

  const origin = new URL(request.url).origin;
  const pageUrl = `${origin}${localizedHref(`/events/${event.slug}`, locale)}`;

  return new Response(buildIcs(event, pageUrl), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
