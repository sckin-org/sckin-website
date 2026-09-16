import type { ImpactPeriodData } from "./content";

/**
 * Pure aggregation over the impact-data period files (src/lib/content.ts
 * getImpactData()), kept apart from both the content loader and the page
 * component so the arithmetic behind every number on /impact is in one
 * reviewable place, not scattered through JSX.
 *
 * Only 2026-H1 and 2026-Q3 carry transcripts — 2025's have already expired
 * (Voiceflow's 6-month retention) and 2024 predates the assistant entirely.
 * So everywhere below that talks about "conversations", "countries" or
 * "channels" is scoped to those two periods' transcript window, not to all
 * time. Callers should surface that window (transcriptWindow, below)
 * alongside any figure computed here.
 */

function periodsWithTranscripts(
  periods: ImpactPeriodData[]
): ImpactPeriodData[] {
  return periods.filter((p) => p.assistant.transcripts);
}

/** Sum of engaged_conversations across every period with transcripts. */
export function totalEngagedConversations(periods: ImpactPeriodData[]): number {
  return periodsWithTranscripts(periods).reduce(
    (sum, p) => sum + (p.assistant.transcripts?.engaged_conversations ?? 0),
    0
  );
}

/** Distinct countries/regions across every period with transcripts (a
 * country appearing in two periods counts once). "North America (US/Canada)"
 * is one bucketed label in the source data, so it counts as one entry here
 * too — this is a count of distinct labels, not of sovereign states. */
export function distinctCountries(periods: ImpactPeriodData[]): string[] {
  const set = new Set<string>();
  for (const p of periodsWithTranscripts(periods)) {
    for (const country of Object.keys(
      p.assistant.transcripts?.countries_engaged_conversations ?? {}
    )) {
      set.add(country);
    }
  }
  return [...set];
}

/** Countries ranked by total engaged conversations summed across periods,
 * highest first. Insertion order in the source JSON happens to already be
 * descending per period, but a merge across periods is not — sort here
 * rather than rely on that. */
export function rankedCountries(
  periods: ImpactPeriodData[]
): Array<{ country: string; conversations: number }> {
  const totals = new Map<string, number>();
  for (const p of periodsWithTranscripts(periods)) {
    for (const [country, n] of Object.entries(
      p.assistant.transcripts?.countries_engaged_conversations ?? {}
    )) {
      totals.set(country, (totals.get(country) ?? 0) + n);
    }
  }
  return [...totals.entries()]
    .map(([country, conversations]) => ({ country, conversations }))
    .sort((a, b) => b.conversations - a.conversations);
}

/** Engaged conversations with no resolved country, summed across periods. */
export function unknownCountryConversations(
  periods: ImpactPeriodData[]
): number {
  return periodsWithTranscripts(periods).reduce(
    (sum, p) => sum + (p.assistant.transcripts?.country_unknown_engaged ?? 0),
    0
  );
}

/** Engaged conversations by channel (web vs. whatsapp), summed across
 * periods. */
export function channelSplit(
  periods: ImpactPeriodData[]
): Array<{ channel: string; engaged: number }> {
  const totals = new Map<string, number>();
  for (const p of periodsWithTranscripts(periods)) {
    for (const [channel, stats] of Object.entries(
      p.assistant.transcripts?.by_channel ?? {}
    )) {
      totals.set(channel, (totals.get(channel) ?? 0) + stats.engaged);
    }
  }
  return [...totals.entries()].map(([channel, engaged]) => ({
    channel,
    engaged,
  }));
}

/**
 * First-message language-detection totals, summed across periods with
 * transcripts. "other" is an unspecified catch-all bucket in the source data
 * (py3langid output that isn't "en" or "fr"), not one language — it can hold
 * any number of distinct languages. Treat this as "at least this many
 * categories were seen", not as a count of named languages.
 */
export function languageTotals(
  periods: ImpactPeriodData[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const p of periodsWithTranscripts(periods)) {
    for (const [lang, n] of Object.entries(
      p.assistant.transcripts?.languages_first_message ?? {}
    )) {
      totals[lang] = (totals[lang] ?? 0) + n;
    }
  }
  return totals;
}

/** Monthly engaged-conversation totals across every period with a by_month
 * transcript breakdown, oldest month first. */
export function monthlyEngaged(
  periods: ImpactPeriodData[]
): Array<{ month: string; engaged: number }> {
  const byMonth = new Map<string, number>();
  for (const p of periodsWithTranscripts(periods)) {
    for (const [month, stats] of Object.entries(
      p.assistant.transcripts?.by_month ?? {}
    )) {
      byMonth.set(month, (byMonth.get(month) ?? 0) + stats.engaged);
    }
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, engaged]) => ({ month, engaged }));
}

const ISO_DATE = /\d{4}-\d{2}-\d{2}/g;

/**
 * The full span covered by transcript-derived figures (conversations,
 * countries, channels, languages): the earliest and latest ISO date found
 * across every transcripts.window string. Parsed from that prose rather than
 * hardcoded, so the page can't silently drift from the data files. Null if
 * no period has transcripts.
 */
export function transcriptWindow(
  periods: ImpactPeriodData[]
): { start: string; end: string } | null {
  const dates = periodsWithTranscripts(periods).flatMap(
    (p) => p.assistant.transcripts?.window.match(ISO_DATE) ?? []
  );
  if (!dates.length) return null;
  return {
    start: dates.reduce((a, b) => (a < b ? a : b)),
    end: dates.reduce((a, b) => (a > b ? a : b)),
  };
}

/** True if `month` (YYYY-MM) is only partially covered by `window` — its
 * first or last calendar day falls outside the window's start/end. Used to
 * flag the edge bars in the monthly chart (transcripts began mid-March 2026;
 * Q3 is still in progress). */
export function isPartialMonth(
  month: string,
  window: { start: string; end: string }
): boolean {
  const [year, monthNum] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
  const monthStart = `${month}-01`;
  const monthEnd = `${month}-${String(lastDay).padStart(2, "0")}`;
  return (
    (month === window.start.slice(0, 7) && window.start !== monthStart) ||
    (month === window.end.slice(0, 7) && window.end !== monthEnd)
  );
}
