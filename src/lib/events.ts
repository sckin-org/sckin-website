import type { Doc, EventFrontmatter } from "./content";
import type { Locale } from "./i18n";

/**
 * Event helpers: wall-clock date/time formatting, the upcoming/past split, and
 * the .ics feed. Kept apart from the content loader (pure functions over an
 * already-loaded event) so pages and the calendar route share one source.
 */

/** BCP 47 tag per site locale for Intl formatting. A Record over Locale, so
 * adding a locale to LOCALES fails the typecheck until an entry lands here. */
const INTL_LOCALE: Record<Locale, string> = { en: "en-US" };

const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/**
 * The wall-clock part of an ISO 8601 timestamp — the time as printed on the
 * flyer — as a UTC Date, so Intl can format it with `timeZone: "UTC"` and no
 * conversion. The offset in the string is deliberately ignored here; it is
 * what makes `isPastEvent` and the .ics file exact. Null if the string does
 * not start like an ISO timestamp.
 */
function wallClock(iso: string): Date | null {
  const match = WALL_CLOCK.exec(iso);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

function format(
  date: Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    timeZone: "UTC",
    ...options,
  }).format(date);
}

export interface EventWhen {
  /** "Thursday, September 24, 2026" (a range when the event spans days). */
  date: string;
  /** "10:00 AM – 3:00 PM" */
  time: string;
  timeZone: string;
  /** date · time timeZone — the one-line form for cards and meta lines. */
  line: string;
}

export function formatEventWhen(
  fm: EventFrontmatter,
  locale: Locale
): EventWhen {
  const start = wallClock(fm.eventStart);
  const end = wallClock(fm.eventEnd);
  if (!start || !end) {
    // Malformed frontmatter: show the raw values rather than crash the page.
    const time = `${fm.eventStart} – ${fm.eventEnd}`;
    return {
      date: "",
      time,
      timeZone: fm.timeZone,
      line: `${time} ${fm.timeZone}`,
    };
  }
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  const sameDay =
    start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10);
  const date = sameDay
    ? format(start, locale, dateOptions)
    : `${format(start, locale, dateOptions)} – ${format(end, locale, dateOptions)}`;
  const time = `${format(start, locale, timeOptions)} – ${format(end, locale, timeOptions)}`;
  return { date, time, timeZone: fm.timeZone, line: `${date} · ${time} ${fm.timeZone}` };
}

/** Platform and/or location, e.g. "Zoom" or "Zoom · UIC campus, Chicago". */
export function eventPlace(fm: EventFrontmatter): string | undefined {
  return [fm.platform, fm.location].filter(Boolean).join(" · ") || undefined;
}

/** An event is past once its (offset-aware) end time has gone by. */
export function isPastEvent(
  fm: EventFrontmatter,
  now: number = Date.now()
): boolean {
  const end = new Date(fm.eventEnd).getTime();
  return Number.isFinite(end) && end < now;
}

function startTime(doc: Doc<EventFrontmatter>): number {
  return new Date(doc.frontmatter.eventStart).getTime();
}

/** Upcoming soonest first; past most recent first. */
export function splitEvents(
  events: Doc<EventFrontmatter>[],
  now: number = Date.now()
): { upcoming: Doc<EventFrontmatter>[]; past: Doc<EventFrontmatter>[] } {
  const upcoming = events
    .filter((e) => !isPastEvent(e.frontmatter, now))
    .sort((a, b) => startTime(a) - startTime(b));
  const past = events
    .filter((e) => isPastEvent(e.frontmatter, now))
    .sort((a, b) => startTime(b) - startTime(a));
  return { upcoming, past };
}

/* -------------------------------------------------------------------------- */
/* iCalendar (.ics) — RFC 5545                                                */
/* -------------------------------------------------------------------------- */

/** 20260924T150000Z — the instant in UTC, so every calendar app converts it
 * to the viewer's own zone. */
function icsStamp(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/** Escape TEXT values (§3.3.11): backslash, semicolon, comma, newlines. */
function icsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold content lines longer than 75 octets (§3.1); continuation lines start
 * with a space. 70 characters leaves headroom for multi-byte text. */
function icsFold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 70) {
    parts.push(rest.slice(0, 70));
    rest = ` ${rest.slice(70)}`;
  }
  parts.push(rest);
  return parts.join("\r\n");
}

/**
 * A single-event calendar file. `pageUrl` is the absolute URL of the event's
 * page on this site (goes into URL and DESCRIPTION). DTSTAMP uses publishedAt
 * rather than "now" so the output is stable between requests.
 */
export function buildIcs(event: Doc<EventFrontmatter>, pageUrl: string): string {
  const fm = event.frontmatter;
  const place = eventPlace(fm);
  const description = [
    fm.summary,
    fm.registrationUrl ? `Register: ${fm.registrationUrl}` : "",
    pageUrl,
  ]
    .filter(Boolean)
    .join("\n\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SCKIN//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.slug}@sckin.org`,
    `DTSTAMP:${icsStamp(fm.publishedAt)}`,
    `DTSTART:${icsStamp(fm.eventStart)}`,
    `DTEND:${icsStamp(fm.eventEnd)}`,
    `SUMMARY:${icsText(fm.title)}`,
    `DESCRIPTION:${icsText(description)}`,
    place ? `LOCATION:${icsText(place)}` : "",
    `URL:${pageUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return `${lines.map(icsFold).join("\r\n")}\r\n`;
}
