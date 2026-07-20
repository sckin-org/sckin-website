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
| **Pro leads** | Native on-site form → Google Sheet via Apps Script |
| **Contact** | Native on-site form → Google Sheet (same pattern) |
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
- [ ] Create Google Sheet with two tabs: `pro-leads`, `contact`
- [ ] Deploy Apps Script Web App → get endpoint URL
- [ ] Add `GOOGLE_SHEETS_WEBHOOK_URL` to Vercel env vars *(never commit it — code reads it in `src/lib/sheets.ts`; unset ⇒ forms show the graceful error state)*
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
Committed. Outstanding: hero + 3 tool images, alt text, 1 testimonial.

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

### 3. SickleCellPedia — `/sicklecellpedia`
*Mostly migration. Quick win.*

- [x] Intro *(have it)*
- [x] Web access copy + Voiceflow embed *(Project ID `684db2d2921b2a3ad5910594`)*
- [x] WhatsApp access copy *(have it)*
- [x] Facebook Messenger copy *(have it)*
- [x] QR code image → `public/images/`
- [ ] EN/FR note *(have it)*
- [x] → Paste to Claude Code

### 4. About — `/about`
*5 anchor sections. Partial migration.*

- [ ] `#sckin` — org story + 501(c)(3) statement *(have partial)*
- [ ] `#our-founder` — your story
- [ ] `#our-board` — 9 members + bios *(have names/LinkedIn)*
- [ ] `#our-collaborators` — Henri Mondor/RED, Dr. Hsu, Dr. Thomas, etc.
- [ ] `#friends-of-sckin` — *(blocked: define it)*
- [ ] Board photos → `public/images/`
- [ ] → Paste to Claude Code

### 5. Donate — `/donate`
*Prioritize — revenue page. Stripe checkout is live in test mode — see the Donations (Stripe) section above.*

- [x] Why donations matter / what they fund *(lede: sustains SickleCellPedia; expand later if desired)*
- [x] Suggested amounts — $10/$20/$50 monthly, $25/$50/$100 one-time, custom
- [x] Recurring giving — yes; monthly is the default with $20 pre-selected
- [x] Tax note — EIN 33-1763512, 501(c)(3) language on donate + success pages
- [ ] 2–3 condensed impact stats + link to `/impact`
- [ ] 1 patient testimonial
- [x] Confirmation / thank-you copy — `/donate/success` with IRS receipt language
- [x] → Paste to Claude Code

### 6. SickleCellPedia Pro — `/sicklecellpedia-pro`
*Pre-launch page — credibility carries it. Lead-capture backend is wired; page copy is still stubbed.*

- [ ] Tagline — one-line value prop for HCPs
- [ ] Intro *(have draft)*
- [ ] 4 features *(have drafts: citations · chain-of-thought · multi-agent · credential access)*
- [ ] Additional features?
- [ ] Lead-capture subtext
- [ ] Confirmation message
- [ ] Clinician testimonials
- [ ] → Paste to Claude Code

### 7. Responsible AI — `/responsible-ai`
*Heavy lift. Distinctive — few nonprofits have this.*

- [ ] Our approach
- [ ] Guideline grounding & mandatory citations
- [ ] Medical disclaimer
- [ ] Known limitations — **be candid; candor is what makes this page credible**
- [ ] Evaluation & benchmarking
- [ ] Data privacy
- [ ] `#hitl-surveys` — intro · who can participate · what's involved · CTA · survey embed
- [ ] → Paste to Claude Code

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

### 9. Publications — `/impact/publications`
*Assembly, not writing. Pull from Zotero + abstract records.*

- [ ] Intro line
- [ ] EHA Stockholm 2026
- [ ] ASCAT London 2026
- [ ] SCDAA 2026
- [ ] Globinoscope essay
- [ ] Others
- [ ] *(Each: title · authors · venue · date · link/PDF)*
- [ ] → Paste to Claude Code

### 10. Sickle Cell News — `/news`
*Page copy only — posts come from the DAG into `content/news/`. Filters are built and derive facets dynamically.*

- [ ] Intro copy — explain the AI classifier
- [ ] 3–5 seed posts so the page isn't empty at launch *(only `example-post.md` today)*
- [ ] Confirm DAG emits the agreed frontmatter contract *(`title`, `date`, `summary`, `source_url`, `topics: []`, `geographies: []`, `image`)*
- [ ] → Paste to Claude Code

### 11. Contact — `/contact`
*Mostly stubbed. Form backend is wired; copy is not.*

- [ ] Hero subhead
- [ ] Google Calendar scheduling link
- [ ] "Prefer to talk?" line
- [ ] Confirmation message
- [ ] → Paste to Claude Code

### 12. Utility ♻️

- [ ] `/whatsapp` — migrate from existing site *(the WhatsApp bot's welcome links here for terms — keep consistent with `/terms`; see WhatsApp integration)*
- [ ] `/feedback` — migrate + add testimonial consent language
- [ ] Footer — contact · socials · links · legal (`/privacy` · `/terms`)
- [ ] → Paste to Claude Code

### 13. Legal — `/privacy` · `/terms`
*New pages. Blocking the WhatsApp/Meta app publish — see **WhatsApp integration** above.*

- [ ] `/privacy` — Privacy Policy as a real hosted page on the SCKIN domain (e.g. `sckin.org/privacy`), **not** a Google Doc
- [ ] `/terms` — Terms of Service as a real hosted page on the SCKIN domain (e.g. `sckin.org/terms`), **not** a Google Doc
- [ ] Both: distinct, permanent URLs · publicly viewable without login · stable (no link rotation) — Meta stores and periodically re-validates them
- [ ] ToS content consistent with what the WhatsApp bot tells users (welcome references `sckin.org/whatsapp` terms)
- [ ] Link both from the footer
- [ ] → Paste to Claude Code

---

## Images

Originals (full resolution) → `Products > website > Images`. Name by page and role.
Destination: `public/images/` *(currently holds `sicklecellpedia-whatsapp-qr.png`)*.

- [ ] `home-hero.jpg`
- [ ] `home-tool-pedia.jpg`
- [ ] `home-tool-pro.jpg`
- [ ] `home-tool-news.jpg`
- [x] `sicklecellpedia-qr.png` *(shipped as `sicklecellpedia-whatsapp-qr.png`)*
- [ ] Board photos (×9)
- [ ] Founder photo
- [ ] SCKIN logo *(pull from current site)*
- [ ] **Alt text for every image** — accessibility + SEO

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

### Audit & checklist reconciliation (2026-07-18)

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
