import type { Metadata } from "next";
import { getImpact, getImpactData, getPublications } from "@/lib/content";
import type { Testimonial } from "@/lib/content";
import {
  channelSplit,
  distinctCountries,
  isPartialMonth,
  languageTotals,
  monthlyEngaged,
  rankedCountries,
  totalEngagedConversations,
  transcriptWindow,
  unknownCountryConversations,
} from "@/lib/impact";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getImpact();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/** "2026-03-16" → "March 16, 2026". Formats as UTC so the calendar date in
 * the ISO string is never shifted by the build machine's local timezone. */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** "2026-03" → "Mar" */
function formatMonthShort(month: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

const CHANNEL_LABEL: Record<string, string> = {
  web: "Web widget",
  whatsapp: "WhatsApp",
};

/** A quote from a community member or clinician. */
function TestimonialCard({ t }: { t: Testimonial }) {
  const attribution = [t.role, t.institution, t.country]
    .filter(Boolean)
    .join(", ");
  return (
    <figure data-role="testimonial" className="rounded-lg bg-subtle p-6">
      <blockquote className="text-[17px] leading-(--line-height-body) text-heading text-pretty">
        {t.quote}
      </blockquote>
      <figcaption className="mt-3 text-[14px] text-body">
        <span data-role="name" className="font-semibold text-heading">
          {t.name}
        </span>
        {attribution ? (
          <span data-role="attribution"> — {attribution}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/** A horizontal proportion bar — CSS only, no chart dependency. */
function Bar({ pct, tone }: { pct: number; tone: "strong" | "soft" }) {
  return (
    <div className="mt-1.5 h-2 rounded-pill bg-(--gray-100)">
      <div
        className={`h-2 rounded-pill ${tone === "strong" ? "bg-cta" : "bg-(--red-300)"}`}
        style={{ width: `${Math.max(pct, 2)}%` }}
      />
    </div>
  );
}

/**
 * Impact page — gated from the nav (src/lib/nav.ts, IMPACT_NAV_LIVE) until
 * this page carries real numbers. It now does: every figure below is
 * computed at build time from content/impact-data/*.json via
 * src/lib/impact.ts, never hand-typed here or in content/impact.md. See
 * content/impact-data/README.md for what each field means and why.
 */
export default function ImpactPage() {
  const { frontmatter, html } = getImpact();
  const { hero, testimonials_community, testimonials_clinical } = frontmatter;

  const periods = getImpactData();
  const period2025 = periods.find((p) => p.period === "2025")!;
  const periodH1 = periods.find((p) => p.period === "2026-H1")!;
  const periodQ3 = periods.find((p) => p.period === "2026-Q3")!;

  const dataWindow = transcriptWindow(periods)!; // H1 + Q3 always carry transcripts
  const windowLabel = `${formatDate(dataWindow.start)} – ${formatDate(dataWindow.end)}`;

  const totalConversations = totalEngagedConversations(periods);
  const countries = distinctCountries(periods);
  const languages = languageTotals(periods);
  const namedLanguages = ["en", "fr"].filter((l) => (languages[l] ?? 0) > 0);
  const otherLanguageMentions = Object.entries(languages)
    .filter(([lang]) => !["en", "fr"].includes(lang))
    .reduce((sum, [, n]) => sum + n, 0);

  const stats = [
    {
      figure: totalConversations.toLocaleString(),
      caption: "substantive conversations with SickleCellPedia",
    },
    {
      figure: countries.length.toString(),
      caption: "countries & regions reached",
    },
    {
      figure: namedLanguages.length.toString(),
      caption: "languages confirmed — English and French, plus early questions in other languages",
    },
  ];

  const channels = channelSplit(periods);
  const totalChannelEngaged = channels.reduce((sum, c) => sum + c.engaged, 0);

  const ranked = rankedCountries(periods);
  const topCountries = ranked.slice(0, 8);
  const remainingCountries = ranked.length - topCountries.length;
  const maxCountryCount = topCountries[0]?.conversations ?? 1;
  const unknownCountry = unknownCountryConversations(periods);

  const months = monthlyEngaged(periods);
  const maxMonthly = Math.max(...months.map((m) => m.engaged), 1);

  const octoberSpike2025 =
    period2025.assistant.analytics?.per_project?.web_agent.by_month?.[
      "2025-10"
    ];
  const augustExcluded2025 =
    period2025.assistant.analytics?.excluded_months?.["2025-08"];

  const { frontmatter: publicationsFm } = getPublications();
  const scdCoalitionEntry = publicationsFm.sections
    ?.find((s) => s.id === "presentations")
    ?.entries.find((e) => e.title.startsWith("Can AI Be Trusted"));

  const pillClass =
    "rounded-pill border border-hairline-strong px-2.5 py-[3px] text-[12px] font-semibold uppercase tracking-[0.04em] text-body";

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="impact" className="mx-auto max-w-[720px]">
        <PageHeader title={hero.headline} subhead={hero.subhead} />

        {/* Stat tiles */}
        <section data-section="stats" className="mt-10 grid gap-6 md:grid-cols-3">
          {stats.map((s, i) => (
            <div key={i} className="border-t border-(--gray-100) pt-4">
              <p
                data-role="figure"
                className="text-[40px] font-semibold leading-none tracking-(--tracking-tight) text-heading-accent"
              >
                {s.figure}
              </p>
              <p data-role="caption" className="mt-2 text-[15px] leading-normal text-body">
                {s.caption}
              </p>
            </div>
          ))}
        </section>
        <p className="mt-4 text-[13px] text-muted">
          These three cover {windowLabel} — the window Voiceflow's
          conversation transcripts still retain. SickleCellPedia has been
          live since June 2025; see <a href="#usage" className="text-link hover:text-link-hover">Usage over time</a> for
          the fuller, longer-running picture and <a href="#methodology" className="text-link hover:text-link-hover">Methodology</a> for
          what counts as a conversation.
        </p>

        {/* Reach */}
        <section data-section="reach" className="mt-10 border-t border-(--gray-100) pt-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
            Reach
          </h2>
          <p className="mt-3 text-[15px] leading-(--line-height-body) text-body text-pretty">
            Channel and country figures below also cover {windowLabel}. The
            web widget and WhatsApp behave differently — WhatsApp only
            launched as its own agent in June 2026 — and both matter.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            {channels.map((c) => (
              <div key={c.channel}>
                <div className="flex items-baseline justify-between text-[14px]">
                  <span className="font-semibold text-heading">
                    {CHANNEL_LABEL[c.channel] ?? c.channel}
                  </span>
                  <span className="text-muted">
                    {c.engaged.toLocaleString()} conversations
                  </span>
                </div>
                <Bar
                  pct={totalChannelEngaged ? (c.engaged / totalChannelEngaged) * 100 : 0}
                  tone="strong"
                />
              </div>
            ))}
          </div>

          <h3 className="mt-8 text-[17px] font-semibold text-heading">
            Where SickleCellPedia is used
          </h3>
          <div className="mt-4 flex flex-col gap-3">
            {topCountries.map(({ country, conversations }) => (
              <div key={country}>
                <div className="flex items-baseline justify-between text-[14px]">
                  <span className="text-body">{country}</span>
                  <span className="text-muted">{conversations}</span>
                </div>
                <Bar pct={(conversations / maxCountryCount) * 100} tone="soft" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-muted">
            {remainingCountries > 0
              ? `Plus ${remainingCountries} more countries and regions. `
              : null}
            Country could not be resolved for {unknownCountry.toLocaleString()}{" "}
            conversations — mostly earlier web sessions, before country
            detection went live in April 2026.
          </p>
        </section>

        {/* Usage over time */}
        <section id="usage" data-section="usage" className="mt-10 border-t border-(--gray-100) pt-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
            Usage over time
          </h2>
          <p className="mt-3 text-[15px] leading-(--line-height-body) text-body text-pretty">
            Substantive conversations by month, {windowLabel} — the only
            span with a consistent, transcript-verified definition of
            &quot;conversation.&quot;
          </p>

          <div
            role="img"
            aria-label={`Substantive conversations by month, ${windowLabel}: ${months
              .map((m) => `${formatMonthShort(m.month)} ${m.engaged}`)
              .join(", ")}`}
            className="mt-6 flex items-end gap-2 md:gap-3"
          >
            {months.map(({ month, engaged }) => {
              const partial = isPartialMonth(month, dataWindow);
              const heightPct = (engaged / maxMonthly) * 100;
              return (
                <div key={month} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-heading">{engaged}</span>
                  <div className="flex h-[120px] w-full items-end">
                    <div
                      className={`w-full rounded-t-sm ${partial ? "bg-(--red-200)" : "bg-cta"}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted">
                    {formatMonthShort(month)}
                    {partial ? "*" : ""}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] text-muted">
            * Partial month — transcripts begin {formatDate(dataWindow.start)}, and{" "}
            {formatDate(dataWindow.end)} is the most recent day counted.
          </p>

          <div className="mt-8 flex flex-col gap-5">
            <div>
              <h3 className="text-[15px] font-semibold text-heading">2024 — not tracked</h3>
              <p className="mt-1 text-[15px] leading-(--line-height-body) text-body text-pretty">
                No usage data exists for 2024: SickleCellPedia and this
                website did not exist yet.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading">2025</h3>
              <p className="mt-1 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {period2025.assistant.analytics?.unique_users_monthly_sum.toLocaleString()}{" "}
                monthly active-user instances and{" "}
                {period2025.assistant.analytics?.interactions.toLocaleString()}{" "}
                interactions across the year, from Analytics totals — the
                web agent launched in June 2025 and no transcripts survive
                today to verify individual conversations, so there is no
                &quot;substantive conversations&quot; figure for this year.
                {augustExcluded2025
                  ? ` August 2025 (${augustExcluded2025.unique_users} users) is excluded throughout as internal testing.`
                  : null}
                {octoberSpike2025
                  ? ` October alone brought ${octoberSpike2025.unique_users} users and ${octoberSpike2025.interactions} interactions — clinicians and delegates trying SickleCellPedia at ASCAT London, a real but conference-driven spike, not an organic baseline.`
                  : null}
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading">
                January – June 2026
              </h3>
              <p className="mt-1 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {periodH1.assistant.analytics?.unique_users_monthly_sum.toLocaleString()}{" "}
                monthly active-user instances and{" "}
                {periodH1.assistant.analytics?.interactions.toLocaleString()}{" "}
                interactions across the full six months (Analytics); of
                these,{" "}
                {periodH1.assistant.transcripts?.engaged_conversations.toLocaleString()}{" "}
                were verified as substantive conversations within the
                transcript window (from March 16).
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-heading">
                  July – September 2026
                </h3>
                <span className={pillClass}>In progress</span>
              </div>
              <p className="mt-1 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {periodQ3.assistant.transcripts?.engaged_conversations.toLocaleString()}{" "}
                substantive conversations so far this quarter, with full
                transcript coverage through{" "}
                {periodQ3.data_through ? formatDate(periodQ3.data_through) : "today"}
                . Figures will grow as the quarter continues.
              </p>
            </div>
          </div>
        </section>

        {/* Presentations & events */}
        <section data-section="presentations" className="mt-10 border-t border-(--gray-100) pt-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
            Presentations &amp; events
          </h2>
          <p className="mt-3 text-[15px] leading-(--line-height-body) text-body text-pretty">
            SCKIN treats speaking directly to clinicians, patients and
            researchers as impact in its own right, alongside SickleCellPedia
            usage.
          </p>

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <p className="text-[13px] text-muted">
                April 21, 2026 · SCD Coalition Peer Learning Exchange (webinar)
              </p>
              <h3 className="mt-1 text-[17px] font-semibold leading-[1.35] text-heading text-pretty">
                Can AI Be Trusted for Sickle Cell Disease Education?
                Introducing SickleCellPedia
              </h3>
              <p className="mt-1.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                Zacharie Liman-Tinguiri and Dr. Lewis Thomas presented a
                real-world case study of SickleCellPedia.
              </p>
              <p className="mt-2">
                <a
                  href={scdCoalitionEntry?.link?.href ?? "/publications#presentations"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
                >
                  {scdCoalitionEntry?.link?.label ?? "See the presentation"} →
                </a>
              </p>
            </div>

            <div>
              <p className="text-[13px] text-muted">
                July 23, 2026 · Warrior Con 2026 (13th Annual Sickle Cell
                Warriors Convention)
              </p>
              <h3 className="mt-1 text-[17px] font-semibold leading-[1.35] text-heading text-pretty">
                Responsible AI Will Revolutionize Sickle Cell Care
              </h3>
              <p className="mt-2">
                <a
                  href="/news/blog"
                  className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
                >
                  Read more on our blog →
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <h3 className="text-[17px] font-semibold text-heading">Upcoming</h3>
            <span className={pillClass}>Not yet happened</span>
          </div>
          <div className="mt-4 flex flex-col gap-5">
            <div>
              <p className="text-[13px] text-muted">
                October 2026 · ASCAT (Academy on Sickle Cell and
                Thalassaemia), London
              </p>
              <p className="mt-1.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                SCKIN&apos;s benchmarking abstract has been accepted for an
                oral presentation.
              </p>
              <p className="mt-2">
                <a
                  href="/publications#abstracts"
                  className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
                >
                  See the abstract →
                </a>
              </p>
            </div>
            <div>
              <p className="text-[13px] text-muted">
                October 2026 · SCDAA 54th Annual National Convention
              </p>
              <p className="mt-1.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                SCKIN will also be presenting at the Sickle Cell Disease
                Association of America&apos;s national convention.
              </p>
            </div>
          </div>
        </section>

        {/* Research */}
        <section data-section="research" className="mt-10 border-t border-(--gray-100) pt-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
            Research
          </h2>
          <p className="mt-3 text-[15px] leading-(--line-height-body) text-body text-pretty">
            An abstract benchmarking SickleCellPedia against general-purpose
            LLMs on clinical questions was accepted at the EHA (European
            Hematology Association) 2026 congress — full citation on our{" "}
            <a href="/publications" className="text-link hover:text-link-hover">
              Publications page
            </a>{" "}
            once confirmed.
          </p>
          <p className="mt-3 text-[15px] leading-(--line-height-body) text-body text-pretty">
            SCKIN&apos;s work was also featured in{" "}
            <em>New Globinoscope</em> N°11 (July 2026), the magazine of the
            FilRougE-MCGRE rare-disease health network — see the{" "}
            <a href="/publications#publications" className="text-link hover:text-link-hover">
              Publications page
            </a>{" "}
            for the full citations.
          </p>
        </section>

        {/* Methodology */}
        <section id="methodology" data-section="methodology" className="mt-10 border-t border-(--gray-100) pt-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
            Methodology
          </h2>
          <p className="mt-3 text-[15px] leading-(--line-height-body) text-body text-pretty">
            This is a funder-facing page, so here is exactly how the numbers
            above are built.
          </p>
          <div className="mt-5 flex flex-col gap-4">
            <div>
              <h3 className="text-[15px] font-semibold text-heading">
                What counts as a conversation
              </h3>
              <p className="mt-1 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {periodQ3.methodology.engaged_conversation}
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading">
                What we exclude
              </h3>
              <p className="mt-1 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {periodQ3.methodology.test_exclusions}
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading">
                Country and language
              </h3>
              <p className="mt-1 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {periodQ3.methodology.country} {periodQ3.methodology.language}
                {otherLanguageMentions > 0
                  ? ` ${otherLanguageMentions.toLocaleString()} conversations opened in a language other than English or French.`
                  : ""}
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading">
                How far back we can look
              </h3>
              <p className="mt-1 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {periodQ3.methodology.retention}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-muted">
            Figures last generated {formatDate(periodQ3.generated_on)}.
          </p>
        </section>

        {testimonials_community?.length ? (
          <section
            data-section="testimonials-community"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              From our community
            </h2>
            <div className="mt-5 flex flex-col gap-4">
              {testimonials_community.map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
          </section>
        ) : null}

        {testimonials_clinical?.length ? (
          <section
            data-section="testimonials-clinical"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              From clinicians
            </h2>
            <div className="mt-5 flex flex-col gap-4">
              {testimonials_clinical.map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
          </section>
        ) : null}

        <Prose html={html} className="mt-8" />
      </article>
    </div>
  );
}
