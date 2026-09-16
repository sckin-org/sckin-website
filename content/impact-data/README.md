# Impact page data

One JSON file per reporting period. The Impact page (`src/app/[locale]/impact/page.tsx`)
should read these files rather than carrying numbers in `content/impact.md`, so that a
quarterly refresh is a data-file change, not a copy change.

| File | Status | Notes |
|---|---|---|
| `2024.json` | `not_tracked` | No assistant usage survives for 2024 — publish as "not tracked". Website visits pending Squarespace export. |
| `2025.json` | `analytics_only` | Agent created June 2025. Totals from the Voiceflow Analytics API only; transcripts have expired so there are no channel/country splits. See caveats inside the file before publishing. |
| `2026-H1.json` | `final` | Totals from Analytics; splits from transcripts 16 Mar – 30 Jun. Website visits pending. |
| `2026-Q3.json` | `partial` | Data through 15 Sep 2026. Re-run at quarter end. |

## Shape of a period file

```
period, label, start, end, status, generated_on, [data_through]
website:   { visits, unique_visitors, source, note }        ← filled by hand from Squarespace / Vercel
assistant:
  analytics:   period totals — sessions, unique_users_monthly_sum, interactions, per_project.{web_agent,whatsapp_agent}.by_month
  transcripts: rates and splits — engaged_conversations, engaged_rate, by_channel, by_month,
               countries_reached, countries_engaged_conversations, languages_first_message
  caveats:     [] — read these before quoting a number
methodology: definitions (identical in every file)
```

## Which number goes on the page

* **Conversations** → `assistant.transcripts.engaged_conversations` when present (a session with a
  real question and a real answer). Fall back to `assistant.analytics.sessions` only with a footnote,
  because raw sessions include widget loads where nobody typed.
* **Countries reached** → `assistant.transcripts.countries_reached`.
* **Messages people sent** → `assistant.transcripts.user_messages` (messages from users in
  non-test sessions; not "questions" — many are greetings, and not "turns", which is ambiguous).
* **People** → prefer `assistant.transcripts.unique_users_engaged` for the transcript window; the
  Analytics `unique_users_monthly_sum` double-counts people active in more than one month.

## Refreshing

```
VOICEFLOW_API_KEY=<workspace API key> node scripts/impact-assistant-usage.mjs 2026-Q4 --write
```

Then fill in `website` by hand and review `caveats`. Raw API responses are cached in
`scripts/.impact-raw/` (gitignored). **Never commit raw transcripts**: they contain health
conversations and, for WhatsApp, phone numbers. Only the aggregates in this folder are committed.

Voiceflow retains transcripts for 6 months, so run the refresh within 6 months of the period's end
or the transcript-derived splits are lost for good. Analytics totals remain available.

## Privacy

Country for WhatsApp users is derived from the phone number's dialling code at compute time; the
number is never written to this folder. Team test numbers are not yet excluded — add them to the
exclusion list in the script (last-four match) once known.
