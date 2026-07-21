# SCKIN Website — Requirements & Content Checklist

> Living document and single source of truth for status. Work page by page.
> **Loop per page:** draft in the Master Doc → paste into Claude Code → it writes
> `content/<page>.md` → commit → tick it off → check on `localhost:3000`.

---

## Decisions locked

| Decision | Resolution |
|---|---|
| **Stack** | Next.js · **Vercel (Pro)** · GitHub · markdown + frontmatter |
| **Stripe** | SCKIN account → Chase nonprofit account. **Apply for 501(c)(3) rate** (2.2% + 30¢ vs 2.9% + 30¢ — not automatic) |
| **Pro leads** | Native on-site form → Google Sheet via **service-account API route** *(supersedes Apps Script per master doc v3.1 — switched 2026-07-20, `9aa2577`)* |
| **Contact** | Native on-site form → Google Sheet (same pattern; email notification needs a new home — see Technical setup) |
| **Language** | English at launch; `/[locale]/` routing built in, `en` unprefixed |
| **News taxonomy** | **Not a content decision.** DAG owns classification + normalization; site derives filters dynamically |
| **Testimonial consent** | Handled personally, no tech guardrail |
| **Site search** | Deferred to phase 2 |
| **FAQ page** | None — folded into Responsible AI / SickleCellPedia / Donate |

**Guardrail:** keep everything vanilla Next.js so core functionality stays portable —
avoid Vercel-*proprietary* primitives (e.g. Vercel-managed storage/KV, Vercel Cron)
where a standard Next.js equivalent exists. Standard Next.js `middleware.ts` is a
framework feature, not a Vercel product, and is explicitly allowed — it powers the
i18n locale routing.

---

## Remaining blockers

- [ ] **Testimonials** — start the asks NOW (longest lead time; depends on other people replying)
  - [ ] Community: patients / caregivers / parents
  - [ ] Clinical: Dr. Hsu · Prof. Bartolucci · Dr. Thomas
- [ ] **Impact numbers** — conversations · countries reached · questions answered · channel split
- [ ] **France / 54 years** — confirm source (54 traces to a 2019 *US* study in available sources)
- [ ] **"Friends of SCKIN"** — define what this section actually is
- [ ] **Board bios** — Maimouna Phelan, Bill Phelan (no bio links on current site)

---

## Technical setup (not content — run in parallel)

- [x] **Run the i18n + News filters + Forms prompt in Claude Code** *(done — `middleware.ts` + `src/lib/i18n.ts`, `NewsBrowser` + `getNewsFacets`, `/api/contact` + `/api/pro-lead` → `src/lib/sheets.ts`)*
- [x] **Connect Vercel to the repo → staging URL** *(done — see Step 1 record below)*
- [ ] Create a Google Cloud project + **service account** *(forms backend switched from the Apps Script webhook to service-account Sheets writes 2026-07-20, `9aa2577` — no SDK, JWT via node:crypto)*
- [ ] Enable the **Google Sheets API** on that project
- [ ] Create the contacts Google Sheet — **one combined first tab**, header row `id · created_at · source · full_name · email · is_healthcare_professional · role · country · city_region · notes · consent · locale · status` — and **share it with the service-account email** *(sources: `pro_interest` · `newsletter` · `contact`; dedupe on email+source; schema is the AWS-migration superset from master doc v3.1)*
- [ ] Add `GOOGLE_SERVICE_ACCOUNT_KEY` (the SA's JSON key, verbatim) + `SHEETS_SPREADSHEET_ID` to Vercel env vars *(never commit them — read in `src/lib/sheets.ts`; unset ⇒ routes log the miss and acknowledge without persisting, forms show success; `.env.example` couldn't be updated — `.env*` is permission-blocked)*
- [ ] Re-home the contact-form email notification *(the retired Apps Script webhook emailed contact@sckin.org per message; TODO in `src/app/api/contact/route.ts` — e.g. a Sheets-driven Apps Script trigger or an email API)*
- [ ] Create Stripe account + apply for nonprofit rate
- [ ] Plan donation receipts *(US donors need written acknowledgment above $250)*

---

## WhatsApp integration (SickleCellPedia → FlowBridge → Meta)

*SickleCellPedia runs in Voiceflow and reaches WhatsApp via FlowBridge. Replies had stopped: the Meta app lost its WhatsApp webhook subscription and reverted to "unpublished," so Meta stopped delivering inbound messages. The app cannot go Live until the blockers below clear.*

**Meta app:** "Sickle Cell Information App" (App ID `1000244904758270`) · WhatsApp number `+1 555-751-3738`

**Fixes already done**
- [x] Voiceflow routing corrected — FlowBridge uses the WhatsApp clone's Dialog Manager API token
- [x] Meta app: WhatsApp use case re-added; webhook reconfigured + verified (callback `https://sckin.flowbridge.app/api/webhooks/whatsapp/1`, verify token stored in FlowBridge); `messages` field subscribed
- [x] Business payment method added in WhatsApp Manager
- [x] FlowBridge webhook endpoint confirmed healthy

**Remaining Meta blockers** — *"ineligible for submission" until all three clear*
- [ ] App icon — exactly 1024×1024 px, square, PNG/JPG (RGB), <5 MB *(compliant icon being prepared separately)*
- [ ] Privacy Policy URL — replace the rejected Google Docs link with the hosted `/privacy` page *(see Legal, §13)*
- [ ] Terms of Service URL — replace the Google Docs link with the hosted `/terms` page
- [ ] Category = **Education** — save so the requirement clears

**Publish steps** — *after the pages + icon exist*
- [ ] Enter the hosted Privacy Policy + Terms of Service URLs in Meta → Basic Settings
- [ ] Upload the 1024×1024 icon; confirm Category = Education; save
- [ ] When the "ineligible for submission" banner clears → publish the app (set to Live)
- [ ] *(Business Verification already complete. "Access verification / Tech Provider" is a separate multi-day review — not required for this single first-party bot; skip it.)*

**Final acceptance test** — *after the app is Live*
- [ ] Send a fresh WhatsApp message to `+1 555-751-3738` and confirm: reply comes from the WhatsApp clone (references `sckin.org/whatsapp` terms) · four-language welcome appears (English, French, Hindi, Arabic) · welcome does **not** repeat on a second message (`welcome_shown` gating works)

**Risks to watch**
- [ ] Both the Privacy Policy and ToS URLs in Meta must be swapped away from Google Docs links — Meta re-validates periodically and rejects Docs links
- [ ] Keep the WhatsApp payment method valid — an unpaid/invalid method can suppress outbound messages

---

## Donations (Stripe)

Integrated 2026-07-17 — see `docs/stripe-donations.md` for full setup and go-live steps.

- **Recurring-first donate page** — `/donate` defaults to Monthly with $20 pre-selected; one-time tiers ($25/$50/$100) show a monthly-upsell nudge; custom amounts supported ($1–$25,000).
- **Stripe Checkout integration** — `POST /api/checkout` creates a Checkout Session (`subscription` mode for monthly, `payment` for one-time) and redirects to Stripe-hosted checkout; success returns to `/donate/success` with tax-receipt language (EIN 33-1763512).
- **Webhook receipts** — signature-verified `/api/webhooks/stripe` handles `checkout.session.completed`, `invoice.paid` (renewals only, no double receipts), and `invoice.payment_failed`; IRS-compliant acknowledgment text is ready in `src/lib/donations.ts`, Kit email send still TODO.
- **Lookup-key price resolution** — suggested tiers resolve catalog prices by lookup key (`monthly_10/20/50`, `once_25/50/100`), seeded idempotently by `scripts/stripe-seed.mjs`.
- **Test/live parity** — same code and env-var names in both modes; go-live is re-running the seed script with the live key and swapping key values in Vercel.

**Status (2026-07-17)** — live in TEST MODE end to end:
- [x] Code integrated, typecheck + production build passing, committed (`3ff1ca4`) and deployed to Vercel production
- [x] Test catalog seeded (product + 6 lookup-key prices)
- [x] Local e2e verified: all three checkout shapes return Checkout URLs; webhook signature verification passed via `stripe listen` + `stripe trigger`
- [x] All three env vars in Vercel (Preview + Production): `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [x] Test-mode webhook endpoint created (`we_1TuMqKBzu5I6XlHdtYgUqbaH` → `https://sckin-website.vercel.app/api/webhooks/stripe`) via `scripts/stripe-webhook-setup.mjs`, which pipes the signing secret straight into `vercel env add` without displaying it — reuse it at go-live
- [x] Production smoke test: `/api/checkout` returns Checkout URLs; webhook rejects forged signatures (400)
- [ ] One full test-card donation on production (`4242 4242 4242 4242`) + confirm `[donation] checkout completed` in Vercel function logs
- [ ] After domain cutover: update the webhook endpoint URL to `www.sckin.org` (Stripe dashboard, secret unchanged) or rerun the setup script with `WEBHOOK_URL=...`
- [ ] Enable Customer portal (Stripe dashboard → Settings → Billing) for recurring-donor self-serve
- [ ] Kit acknowledgment-email wiring (TODOs in webhook route; copy ready in `src/lib/donations.ts`)
- [ ] Go-live (after Stripe account review): reseed with live key, swap key values in Vercel, live webhook endpoint, $1 verify-and-refund

---

## Pages

### 1. Home — `/` ✅
Committed. *Rebuilt to master doc v3.1 2026-07-20 (`e8e3036`): hypothesis section, secondary "Donate to support SCKIN" CTA, tools with WhatsApp link + QR + status badges, Tool 2 CTA → `#register`, Get involved (donate + embed-form CTAs), email signup wired to `/api/newsletter`.* Outstanding: hero + 3 tool images, alt text, 1 testimonial, {PENDING} "Sickle Cell News" name confirm.

### 2. Mission — `/mission` ✅
*Committed `36fb373`, live on staging. Short page — done.*

- [x] Mission statement
- [x] Vision — the future state SCKIN is working toward
- [x] Hypothesis
- [x] Use case — Patient *(Danielle, Houston — hydroxyurea prep)*
- [x] Use case — Caregiver *(Amina, Dakar — the 2 a.m. fever)*
- [x] Use case — Clinician / under-resourced HCP *(Dr. Okonkwo, Nigeria — delivered as one combined scenario)*
- [x] Use case — Newly diagnosed family *(Claire & Thomas, Paris — added beyond the original list)*
- [x] Closing statement + CTAs *(Try SickleCellPedia · Support our work)*
- [x] → Paste to Claude Code

### 3. SickleCellPedia — `/sicklecellpedia` ✅
*Mostly migration. Quick win. Reworked 2026-07-20 (`fe63413`): the site-wide launcher + auto-open became an always-open INLINE embed on the page (Voiceflow `embedded` render mode, same web project ID — no corner launcher anywhere now, resolving the master doc's global-vs-page open item as page-only pending Zacharie's confirmation); v3.1 "trusted medical resources" intro.*

- [x] Intro *(have it)*
- [x] Web access copy + Voiceflow embed *(Project ID `684db2d2921b2a3ad5910594`)*
- [x] WhatsApp access copy *(have it)*
- [x] Facebook Messenger copy *(have it)*
- [x] QR code image → `public/images/` *(regenerated crisp as `whatsapp-qr.png` via `scripts/generate-whatsapp-qr.mjs`, `c321570`)*
- [x] EN/FR note *(shipped 2026-07-20 — bilingual line under the access channels)*
- [x] → Paste to Claude Code
- [ ] **Manual (Zacharie): publish the Voiceflow web agent (`684db2d2921b2a3ad5910594`) Dev → Production** *(embed renders; Dev was republished but not pushed to Prod, so the live pane serves a ~5-month-old build until then)*

### 4. About — `/about` ✅
*5 anchor sections. Built to master doc v3.1, committed `41bee26` — anchors shipped as `#sckin · #board · #founder · #collaborators · #friends`, matching the nav dropdown.*

- [x] `#sckin` — org story + 501(c)(3) statement *(IRS determination letter linked, new tab; vision + mission included; EIN 33-1763512)*
- [x] `#founder` — your story *(full bio)*
- [x] `#board` — 9 members + bios *(responsive card grid; Zacharie's card links to Our Founder instead of repeating the bio; Maimouna + Bill intentionally bio-less, no placeholder text; Kyle + Kiari bios are {DRAFT — Zacharie to review})*
- [x] `#collaborators` — RED (FR description + AI-translated EN) · ASH–SCDC · SC3 *(logo/link/description/status/collaboration per v3.1)*
- [ ] `#friends` — *(blocked: define it; heading + anchor reserved, body intentionally empty)*
- [ ] Board photos → `public/images/team/` *(placeholders rendering — initials blocks for people, name-only for org logos in `public/images/logos/`; pending real image files, which appear on drop-in with no code change)*
- [x] → Paste to Claude Code

### 5. Donate — `/donate`
*Prioritize — revenue page. Stripe checkout is live in test mode — see the Donations (Stripe) section above. 2026-07-20 (`a261344`): eyebrow now the doc title "Support Our Work"; fine print carries the verbatim master-doc tax line ("…tax-deductible to the extent permitted by law").*

- [x] Why donations matter / what they fund *(lede: sustains SickleCellPedia; expand later if desired)*
- [x] Suggested amounts — $10/$20/$50 monthly, $25/$50/$100 one-time, custom
- [x] Recurring giving — yes; monthly is the default with $20 pre-selected
- [x] Tax note — EIN 33-1763512, 501(c)(3) language on donate + success pages
- [ ] 2–3 condensed impact stats + link to `/impact`
- [ ] 1 patient testimonial
- [x] Confirmation / thank-you copy — `/donate/success` with IRS receipt language
- [x] → Paste to Claude Code

### 6. SickleCellPedia Pro — `/sicklecellpedia-pro`
*Pre-launch page — credibility carries it. Built to master doc v3.1 (`39ca799`); v3.1 field set + required consent checkbox → `/api/pro-lead` (`9aa2577`). **Form renders and validates but is inert pending the Google service account + Sheets env vars** — see Technical setup.*

- [ ] Tagline — one-line value prop for HCPs *(still [TO ADD]; renders nothing meanwhile)*
- [x] Intro *(v3.1 wording — "…and other underserved communities")*
- [x] 4 features *(mandatory citations · chain-of-thought · multi-agent · credential-based access)*
- [ ] Additional features? *([TO ADD] in the doc)*
- [ ] Lead-capture subtext *(doc's example line renders at `#register`; final copy [TO ADD])*
- [ ] Confirmation message *(doc's example line renders on submit; final copy [TO ADD])*
- [ ] Clinician testimonials
- [x] → Paste to Claude Code

### 7. Responsible AI — `/responsible-ai`
*Heavy lift. Distinctive — few nonprofits have this. Structure + anchors shipped 2026-07-20 (`2fba37e`): `#approach` with the five sub-blocks and `#surveys`, matching the nav dropdown; every body is [TO ADD] in the doc, so clean "Content coming soon." placeholders render.*

- [ ] Our approach
- [ ] Guideline grounding & mandatory citations
- [ ] Medical disclaimer
- [ ] Known limitations — **be candid; candor is what makes this page credible**
- [ ] Evaluation & benchmarking
- [ ] Data privacy
- [ ] `#surveys` — intro · who can participate · what's involved · CTA · survey embed *(section + anchor built; all copy and the Google Form link pending)*
- [x] → Paste to Claude Code *(scaffold only — the copy above still needs writing)*

### 8. Impact — `/impact`
*Needs real numbers. Don't let it block the other pages.*

- [ ] Hero headline + subhead
- [ ] Stat: total conversations
- [ ] Stat: countries reached
- [ ] Stat: questions answered
- [ ] Our reach — who · where · channel split (web/WhatsApp/FB)
- [ ] What people ask us — themes from the 1,587-turn / 315-conversation analysis
- [ ] Community testimonials
- [ ] Clinically evaluated — brief summary, link to Responsible AI
- [ ] Clinician testimonials
- [ ] → Paste to Claude Code
- [ ] ⚠️ **No placeholder figures — funders read this page**

### 9. Publications — `/publications`
*Assembly, not writing. Pull from Zotero + abstract records. Moved top-level (was `/impact/publications`) and rebuilt to v3.1's four sections — Presentations · Publications · Abstracts · Other Contributions — committed `a294044`.*

- [ ] Intro line *(doc's example line renders; final [TO ADD])*
- [ ] EHA Stockholm 2026 *(no entry in master doc v3.1 yet)*
- [x] ASCAT London 2026 *(Abstracts: paper #226, accepted as Oral, presenting author Mr Zacharie Liman-Tinguiri, SCKIN; {PENDING} exact 2026 dates + link)*
- [ ] SCDAA 2026 *(no entry in master doc v3.1 yet)*
- [ ] Globinoscope essay *(section + N°11 source link render; pending article titles/authors/pages — two clearly-marked TO-ADD entries)*
- [x] Others *(Presentations: SCD Coalition webinar Apr 21 2026 with poster Drive link; Other Contributions: public ASCAT-2025 NotebookLM link — both new-tab)*
- [x] *(Each: title · authors · venue · date · link/PDF)*
- [x] → Paste to Claude Code

### 10. Sickle Cell News — `/news`
*Page copy only — posts come from the DAG into `content/news/`. Filters are built and derive facets dynamically.*

- [x] Intro copy — explain the AI classifier *(v3.1 launch phase, `7a82af5`: "In development — expected September 2026" badge, social-distribution language, plain card list — no filters yet, `NewsBrowser` parked until the taxonomy ships)*
- [x] Blog subpage — `/news/blog` *(SCKIN's own announcements, linked from the News landing + News ▾ nav; card scaffold + empty state; posts authored later in `/admin` into `content/blog/`)*
- [ ] 3–5 seed posts so the page isn't empty at launch *(only `example-post.md` today)*
- [ ] Confirm DAG emits the agreed frontmatter contract *(`title`, `date`, `summary`, `source_url`, `topics: []`, `geographies: []`, `image`)*
- [x] → Paste to Claude Code *(landing + blog shipped; seed posts + taxonomy later)*

### 11. Contact — `/contact`
*Mostly stubbed. Form backend is wired; copy is not.*

- [ ] Hero subhead
- [ ] Google Calendar scheduling link
- [ ] "Prefer to talk?" line
- [ ] Confirmation message
- [ ] → Paste to Claude Code

### 12. Utility ♻️

- [x] `/whatsapp` — migrate from existing site *(the WhatsApp bot's welcome links here for terms — keep consistent with `/terms`; see WhatsApp integration)* *(shipped 2026-07-19 as an **unlisted** landing page: noindex,nofollow · no sitemap entry · removed from the footer nav · normal site chrome · links to `/privacy`, `/terms`, and the feedback Google Form)*
- [ ] `/feedback` — migrate + add testimonial consent language
- [x] Footer — contact · socials · links · legal (`/privacy` · `/terms`) *(legal links added 2026-07-19; 2026-07-20 `226bb91`: real Facebook + LinkedIn URLs — confirm the LinkedIn slug spelling "knowlege" — wa.me placeholder social removed, footer links per doc = About · News · Feedback + legal; nav restructured to the locked v3.1 set with News ▾ (Latest News · Blog) + mobile hamburger — Contact and Impact are out of the nav per the locked spec, routes still reachable)*
- [ ] → Paste to Claude Code *(remaining: `/feedback`)*

### 13. Legal — `/privacy` · `/terms`
*New pages. Blocking the WhatsApp/Meta app publish — see **WhatsApp integration** above.*

- [x] `/privacy` — Privacy Policy as a real hosted page on the SCKIN domain (e.g. `sckin.org/privacy`), **not** a Google Doc *(renders `content/legal/privacy.md` via the shared `LegalDocument` component)*
- [x] `/terms` — Terms of Service as a real hosted page on the SCKIN domain (e.g. `sckin.org/terms`), **not** a Google Doc *(renders `content/legal/terms.md`, titled "User Agreement")*
- [x] Both: distinct, permanent URLs · publicly viewable without login · stable (no link rotation) — Meta stores and periodically re-validates them *(static prerendered routes, indexable, no auth)*
- [x] ToS content consistent with what the WhatsApp bot tells users (welcome references `sckin.org/whatsapp` terms) *(`/whatsapp` links straight to `/terms` and `/privacy`)*
- [x] Link both from the footer *(Privacy · Terms, every page)*
- [x] → Paste to Claude Code *(shipped 2026-07-19)*

---

## Images

Originals (full resolution) → `Products > website > Images`. Name by page and role.
Destination: `public/images/` *(currently holds `whatsapp-qr.png`; team photos → `public/images/team/`, org logos → `public/images/logos/` — the documented per-person/per-org filenames are already referenced in `content/about.md`, so files appear on drop-in with no code change)*.

- [ ] `home-hero.jpg`
- [ ] `home-tool-pedia.jpg`
- [ ] `home-tool-pro.jpg`
- [ ] `home-tool-news.jpg`
- [x] `sicklecellpedia-qr.png` *(regenerated crisp as `whatsapp-qr.png` via `scripts/generate-whatsapp-qr.mjs` (`c321570`), shown on Home Tool 1 + SickleCellPedia)*
- [ ] Board photos (×9) → `public/images/team/` *(initials placeholders rendering meanwhile)*
- [ ] Founder photo
- [ ] Org logos (RED · ASH–SCDC · SC3) → `public/images/logos/` *(name-only rendering meanwhile)*
- [ ] `publication-genai-safety-poster.jpg` *(poster thumbnail for the Presentations entry)*
- [ ] SCKIN logo *(pull from current site)*
- [ ] **Alt text for every image** — accessibility + SEO *(QR + board/logo alts shipped; hero/tool alts [TO ADD] with TODOs in `content/home.md`)*

---

## After the content

- [ ] Design in Claude Design — Home first, plus Publications entries and News cards/filters so the component set is complete. Export the handoff bundle.
- [ ] Claude Code builds the components from the bundle and wires them to the content files
- [ ] Integrations — Voiceflow embed · Stripe checkout · embed/licensing form link
- [ ] QA — `design-review` skill against the staging URL · accessibility (WCAG AA — `#C41E3A` red needs contrast checks against light backgrounds) · mobile · performance
- [ ] Domain cutover — lower TTL a few days ahead · point sckin.org DNS at Vercel · keep Squarespace live until it resolves *(Vercel provisions SSL automatically once DNS verifies)*
- [ ] *(Post-launch: Decap CMS at `/admin` — needs a GitHub OAuth app + one-file OAuth handler API route · news auto-repost to FB/LinkedIn · registrar move to Cloudflare · then the MCP server on AWS)*

---

## Suggested order

**Warm-ups (mostly migration):** Mission → SickleCellPedia → About
**Revenue:** Donate
**Product:** Pro
**Heavy lifts:** Responsible AI → Impact
**Assembly:** Publications → News → Contact → Utility

Impact last on purpose — it depends on numbers you may still be gathering.

---

## History

### Content build to master doc v3.1 (2026-07-20)

Built the remaining static pages from `sckin-master-doc-v3_1.md` (now committed
at the repo root, `3c50dbe`), directly on `main` after fast-forwarding the
legal-pages branch (no open PR existed). Eleven commits: crisp generated
WhatsApp QR replacing the scraped one (`c321570`); always-open INLINE Voiceflow
embed on /sicklecellpedia replacing the site-wide launcher (`fe63413`); Google
**service-account** Sheets backend + `/api/newsletter` replacing the Apps
Script webhook (`9aa2577` — one combined contacts tab, AWS-migration superset
schema, dedupe on email+source, graceful acknowledge-without-persist when env
is unset, Pro form gains HCP Yes/No + city/region + required consent →
/privacy); Home v3.1 (`e8e3036`); Pro page + `#register` (`39ca799`); About
with board grid + collaborators (`41bee26`); Responsible AI `#approach`/`#surveys`
scaffold (`2fba37e`); Publications moved to `/publications` with four sections
(`a294044`); News landing (Sept-2026 badge, filters parked) + `/news/blog`
(`7a82af5`); locked v3.1 nav + mobile hamburger + doc footer with real socials
(`226bb91`); Donate verbatim tax line (`a261344`).

Verified: `npm run build` + `tsc --noEmit` clean; **52 rendered-HTML checks**
against a local prod server all pass (anchor ids, new-tab external links, QR
alt text, Pro form fields + consent, News badge, initials placeholders, old
`/impact/publications` 404s, `/whatsapp` still unlisted, verbatim donate tax
line). Notes: `.env.example` could not be updated (`.env*` permission-blocked)
— the new env-var names live in `src/lib/sheets.ts` and Technical setup;
`/contact` and `/impact` remain routable but left the nav per the locked v3.1
spec (flag if Contact should be footer-linked); the retired Apps Script
contact-email notification is tracked as a Technical-setup TODO.

### Legal pages + unlisted /whatsapp (2026-07-19)

Built §13 and most of §12 on `feat/legal-pages`. Policy text lives as
Decap-ready Markdown with frontmatter (`title`, `subtitle`, `lastUpdated`) in
`content/legal/privacy.md` and `content/legal/terms.md`, rendered by one shared
`src/components/LegalDocument.tsx` (title → subtitle → "Last updated:
December 2, 2025" → prose body) through the existing gray-matter + marked
pipeline — no new dependencies. `/privacy` and `/terms` are indexable static
routes; `/whatsapp` was rebuilt as an unlisted landing page (noindex,nofollow
metadata, absent from any sitemap — none exists yet — robots.txt untouched/
nonexistent, no auth) with same-tab links to `/privacy` and `/terms` and a
new-tab link to the feedback Google Form. Footer gained Privacy + Terms links
on every page; the footer's `/whatsapp` nav link was **removed** so the page is
genuinely unlisted (the external `wa.me` social placeholder stays). Verified:
`npm run build` + `tsc --noEmit` clean, and 26 rendered-HTML checks against a
local prod server (titles, subtitle, date line, noindex on `/whatsapp` only,
link targets, footer links) all pass. Merge of the PR is the deliberate go-live
action; after deploy, enter the URLs in Meta (see WhatsApp integration).

Verified the checklist against actual repo, build, git, and Vercel state. Repo:
production build and `tsc --noEmit` both pass (exit 0); `3ff1ca4` and `36fb373`
are on `main`; working tree clean; `.vercel` and `.env*` (template excepted)
gitignored; no secret material in history (only `.env.example` ever tracked).
Confirmed i18n routing (`en` unprefixed via `middleware.ts`), dynamic News
facets (`getNewsFacets` derives from post frontmatter, no hardcoded lists), the
forms' graceful error path when `GOOGLE_SHEETS_WEBHOOK_URL` is unset
(`sheets.ts` throws → `submission-handler.ts` catch returns JSON 500, never
HTML), and the Stripe checkout/webhook shape (subscription-vs-payment mode, six
lookup keys, `cancel_url` → `/donate`, renewal-only `invoice.paid` filter, custom
amount bounded $1–$25,000 server-side; note `/api/checkout` is NOT rate-limited).
Vercel: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and
`STRIPE_WEBHOOK_SECRET` present in Preview + Production; `GOOGLE_SHEETS_WEBHOOK_URL`
absent; latest Production deployment Ready; no custom domain attached.

Corrected: ticked the SickleCellPedia page items — built and committed
(`7e67d36`): copy in `content/sicklecellpedia.md`, Voiceflow shipped as a
site-wide widget + auto-open (`src/lib/voiceflow.ts`, `VoiceflowWidget`/
`VoiceflowAutoOpen`) rather than an inline embed, QR in `public/images/`. Ticked
the SickleCellPedia QR image (shipped as `sicklecellpedia-whatsapp-qr.png`) and
updated the images note. Left the EN/FR note unticked — deliberately omitted from
the shipped page, pending a final call. Nothing was unticked: every remaining
`[x]` was either verified present (env vars, `3ff1ca4`, build) or depends on Meta,
the Google Sheet, Apps Script, or the Stripe dashboard and is unverifiable from
here — left exactly as-is.

### Stripe donations integrated, test mode (2026-07-17)

Donations feature integrated from the handoff bundle and deployed: recurring-first
donate page, Checkout API with lookup-key pricing, signature-verified webhook.
Catalog seeded, all three Stripe env vars set in Vercel (Preview + Production),
test-mode webhook endpoint pointed at the `.vercel.app` production URL pending
domain cutover. Vercel CLI installed and repo linked (`.vercel/` gitignored).
Full status checklist in the Donations (Stripe) section; setup/go-live runbook
in `docs/stripe-donations.md`.

### Hosting: Amplify → Vercel (2026-07-16)

Hosting is committed to **Vercel (Pro)**, so "two-way door" is no longer a hard
constraint. This supersedes the earlier AWS Amplify plan and the blanket
"no middleware" wording, which was aimed at Vercel's proprietary Routing Middleware
product and the Amplify two-way-door goal — not at Next.js `middleware.ts`.

### Step 1 — Connect Vercel to the GitHub repo ✅

**Prerequisites**
- [x] Repo lives in the `sckin-org` GitHub organization and `npm run build` passes locally with no errors.
- [x] Vercel account created — signed up with GitHub using zacharie.liman.tinguiri@sckin.org's GitHub identity so org access carries over.
- [x] Plan decision: Hobby tier is personal/non-commercial only; SCKIN needs Pro ($20/mo, one deployer seat). SCKIN team on Pro.

**Connection steps**
- [x] In the Vercel dashboard: Add New → Project → Import Git Repository.
- [x] Authorize the Vercel GitHub App on `sckin-org` — grant access to this repo only (least privilege), not all org repos.
- [x] Confirm Vercel auto-detects the framework preset as Next.js; accept default build command (`next build`) and output settings.
- [x] Environment variables: skipped as planned — none required at the time.
- [x] Deploy and confirm the production URL (https://<project>.vercel.app) renders the Home page.

**Verification**
- [x] Push a trivial commit to `main` → auto-deploy triggers and completes.
- [x] Open a test PR → Vercel posts a preview URL on the PR, then close it.
- [x] Do NOT attach the sckin.org custom domain yet — that is the domain cutover, after the content.

**Status log**
- 2026-07-14 — Deployed to Vercel (team: SCKIN, project: sckin-website, plan: Pro). Staging URL live, content rendering unstyled as expected pre-design. Vercel plugin installed in Claude Code.

---

## Future work

- [ ] **Wire Decap CMS to the legal content files** (`content/legal/privacy.md`, `content/legal/terms.md`) so non-technical editors can update policy text without code. Deferred; needs a GitHub OAuth app + a token-exchange endpoint (no Netlify git-gateway on Vercel). The files are already Decap-ready: plain Markdown + frontmatter (`title`, `subtitle`, `lastUpdated`), one folder, one shared renderer.
- [ ] **Rewrite the Privacy Policy and User Agreement to cover all surfaces** where SCKIN / SickleCellPedia is available. The current text (dated 2025-12-02) references only WhatsApp and Facebook Messenger; it needs to also account for the website RAG assistant on sckin.org, the newsletter, and the contact form.
- [ ] **Stubs / TODOs left by the legal-pages task (2026-07-19):**
  - No `sitemap.ts` / `robots.ts` exists site-wide yet. When one is added, `/whatsapp` must be **excluded** from the sitemap and must **not** be listed in robots.txt (a `Disallow` would advertise the URL and block crawlers from seeing its `noindex`).
  - The footer's `/whatsapp` nav link was removed to keep the page unlisted — if it should be discoverable from the site after all, restore one `<li>` in `SiteFooter.tsx`.
  - Legal page `<title>`s follow the site template (`Privacy Policy — SCKIN`), not the `| SCKIN` variant from the task spec — deliberate, to match the repo's existing pattern.
  - Legal frontmatter is camelCase (`lastUpdated`) unlike the site's snake_case page frontmatter — deliberate, it's the contract for the future Decap collection; keep it stable.
  - Pre-existing and untouched: placeholder social URLs in the footer, stub `/feedback` page.
