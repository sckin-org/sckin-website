# SCKIN Website — Requirements & Content Checklist

> Living document and **single source of truth for status**. Work page by page.
> **Loop per page:** draft content → paste into Claude Code → it writes
> `content/<page>.md` → commit → tick it off → check on `localhost:3000`.
>
> **Document hierarchy (settled 2026-07-22):** this Checklist is the source of
> truth. `sckin-master-doc-v3_1.md` is **retired** as a decision document — its
> copy has been transcribed into `content/*.md`, so the repo is now the content
> source; keep the file in the repo as historical reference only.
> `sckin-design-spec-phase1.md` is the **design annex** (tokens, layout, and
> visual decisions); where it conflicts with this document, this document wins,
> and the conflict should be fixed in the annex.

---

## Decisions locked

| Decision | Resolution |
|---|---|
| **Stack** | Next.js · **Vercel (Pro)** · GitHub · markdown + frontmatter |
| **Design system** | Locked 2026-07-22 via Claude Design (annex: `sckin-design-spec-phase1.md`). Inter throughout · red `#8A1626` ramp (**revised 2026-07-22** from `#C41E3A` at import review — Zacharie approved the darker red the delivered ramp was anchored on; 9.5:1 on white; correct the token files' fabricated 2026-07-21 approval `$note` to this real provenance) · mobile-first (390px) · two-tone hero, no hero image · minimal-typographic (no photography on Home) · token handoff = CSS custom properties + `tokens.json`; every value must trace to a token |
| **Stripe** | SCKIN account → Chase nonprofit account. **Apply for 501(c)(3) rate** (2.2% + 30¢ vs 2.9% + 30¢ — not automatic) |
| **Donate defaults** | **One-time is the default** (flipped from recurring-first 2026-07-22), $25 pre-selected. Presets are frequency-dependent: one-time $25/$50/$100 · monthly $10/$20/$50 ($20 pre-selected when toggled). Monthly carries a "most impactful" tag. Existing lookup keys (`once_25/50/100`, `monthly_10/20/50`) already match — **no catalog reseed needed**. Optional "Add a note" field → Stripe metadata (to build). Homepage donate band and `/donate` share the same component + defaults |
| **Navigation** | Locked 2026-07-22: **About us ▾** (SCKIN · Our Founder · Board · Collaborators · Friends) · **SickleCellPedia** · **For Clinicians** (label for `/sicklecellpedia-pro`) · **Responsible AI** · **Impact ▾** (Impact · Publications) · **News ▾** (Latest News · Blog · Events — Events added 2026-09-04, see History) · **Donate** (red button, only red element in nav). Reserved slot for future language toggle. Contact stays out of nav (footer-linked). Impact ▾ goes live only when `/impact` has real numbers; until then Publications is the dropdown's only live entry |
| **Publications placement** | Nav: under **Impact ▾**. Route stays **`/publications`** (no URL move — avoids redirect churn; reverses only the nav placement, not commit `a294044`) |
| **Hypothesis** | Full text lives on **`/mission` only**; Home's Mission section carries a one-line distillation + "Our mission →" link (no duplicated full copy) |
| **Pro leads** | Native on-site form → Google Sheet via **Workload Identity Federation API route** *(supersedes Apps Script per master doc v3.1 — switched to a service-account key 2026-07-20, `9aa2577`; switched again to keyless WIF 2026-07-23 — no service-account JSON key ever exists, see Technical setup)* |
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
i18n locale routing. *(The design annex's stricter "no Vercel-proprietary features"
wording is superseded by this paragraph — relaxed per the 2026-07-16 hosting
decision; design tokens ship vendor-neutral regardless.)*

---

## Remaining blockers

- [ ] **Testimonials** — start the asks NOW (longest lead time; depends on other people replying)
  - [ ] Community: patients / caregivers / parents
  - [ ] Clinical: Dr. Hsu · Prof. Bartolucci · Dr. Thomas
- [ ] **Impact numbers** — conversations · countries reached · questions answered · channel split *(gates the Impact ▾ nav item going live)*
- [ ] **GBD figure verification** — confirm the homepage impact-band stats (7.7M · 500K+ · ~80%) against Global Burden of Disease 2021, The Lancet Haematology, before ship
- [ ] **France / 54 years** — confirm source (54 traces to a 2019 *US* study in available sources)
- [x] **"Friends of SCKIN"** — define what this section actually is *(defined 2026-09-04: people and organizations across the sickle cell community who use SCKIN's tools in their own work — a card on `/about#friends` plus a story page at `/friends/<slug>`; first friend Leyla Hamidou, ONG DES, Niger — see History)*
- [ ] **Board bios** — Maimouna Phelan, Bill Phelan (no bio links on current site)

---

## Technical setup (not content — run in parallel)

- [x] **Run the i18n + News filters + Forms prompt in Claude Code** *(done — `middleware.ts` + `src/lib/i18n.ts`, `NewsBrowser` + `getNewsFacets`, `/api/contact` + `/api/pro-lead` → `src/lib/sheets.ts`)*
- [x] **Connect Vercel to the repo → staging URL** *(done — see Step 1 record below)*
- [ ] Create a Google Cloud project + **service account with NO key downloaded** *(forms backend switched from a service-account JSON key to keyless Workload Identity Federation 2026-07-23 — the SA still exists, only for the email that the Sheet gets shared with; it's impersonated at request time via short-lived tokens, never a stored private key)*
- [ ] Enable the **Google Sheets API**, **IAM Service Account Credentials API**, and **IAM Credentials API** on that project
- [ ] Enable **OIDC Federation** for the Vercel project *(Project → Settings → Security; this makes Vercel issue `VERCEL_OIDC_TOKEN` / serve tokens via `@vercel/oidc`)*
- [ ] Create a **Workload Identity Pool + OIDC provider** trusting Vercel's issuer (`https://oidc.vercel.com/[team-slug]`), with an **attribute condition scoped to this exact Vercel project + environment** *(critical — without it, any project in the Vercel team could impersonate the SA; subject claim shape is `owner:[team]:project:[name]:environment:[env]`)*
- [ ] Grant the pool's principal `roles/iam.workloadIdentityUser` on the service account *(this is what lets the WIF exchange impersonate the SA — no other IAM role needed on the SA or project)*
- [ ] Create the contacts Google Sheet — **one combined first tab**, header row `id · created_at · source · full_name · email · is_healthcare_professional · role · country · city_region · notes · consent · locale · status` — and **share it with the service-account email** *(sources: `pro_interest` · `newsletter` · `contact`; dedupe on email+source; schema is the AWS-migration superset from master doc v3.1)*
- [ ] Add `GCP_PROJECT_NUMBER`, `GCP_WORKLOAD_IDENTITY_POOL_ID`, `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID`, `GCP_SERVICE_ACCOUNT_EMAIL`, `SHEETS_SPREADSHEET_ID` to Vercel env vars *(read in `src/lib/sheets.ts`; **none of these are secret** — there's no private key in this flow, unlike the retired `GOOGLE_SERVICE_ACCOUNT_KEY`; unset ⇒ routes log the miss and acknowledge without persisting, forms show success; `.env.example` couldn't be updated — `.env*` is permission-blocked)*
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
**Defaults revised 2026-07-22** (design reconciliation): one-time-first replaces recurring-first.

- **One-time-first donate flow** — default frequency is **One-time with $25 pre-selected**; toggling to Monthly shows $10/$20/$50 with $20 pre-selected and a "most impactful" tag; presets are frequency-dependent (one-time thresholds deliberately higher); custom amounts supported ($1–$25,000). Homepage donate band and `/donate` share the same component and defaults.
- **Stripe Checkout integration** — `POST /api/checkout` creates a Checkout Session (`subscription` mode for monthly, `payment` for one-time) and redirects to Stripe-hosted checkout; success returns to `/donate/success` with tax-receipt language (EIN 33-1763512).
- **Webhook receipts** — signature-verified `/api/webhooks/stripe` handles `checkout.session.completed`, `invoice.paid` (renewals only, no double receipts), and `invoice.payment_failed`; IRS-compliant acknowledgment text is ready in `src/lib/donations.ts`, Kit email send still TODO.
- **Lookup-key price resolution** — suggested tiers resolve catalog prices by lookup key (`monthly_10/20/50`, `once_25/50/100`), seeded idempotently by `scripts/stripe-seed.mjs`. **Unchanged by the 2026-07-22 default flip — no reseed needed.**
- **Test/live parity** — same code and env-var names in both modes; go-live is re-running the seed script with the live key and swapping key values in Vercel.

**Status (2026-07-17, revised 2026-07-22)** — live in TEST MODE end to end:
- [x] Code integrated, typecheck + production build passing, committed (`3ff1ca4`) and deployed to Vercel production
- [x] Test catalog seeded (product + 6 lookup-key prices)
- [x] Local e2e verified: all three checkout shapes return Checkout URLs; webhook signature verification passed via `stripe listen` + `stripe trigger`
- [x] All three env vars in Vercel (Preview + Production): `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [x] Test-mode webhook endpoint created (`we_1TuMqKBzu5I6XlHdtYgUqbaH` → `https://sckin-website.vercel.app/api/webhooks/stripe`) via `scripts/stripe-webhook-setup.mjs`, which pipes the signing secret straight into `vercel env add` without displaying it — reuse it at go-live
- [x] Production smoke test: `/api/checkout` returns Checkout URLs; webhook rejects forged signatures (400)
- [x] **Flip the default frequency to one-time ($25 pre-selected) in the donate component** — decision 2026-07-22; monthly keeps $20 pre-selected when toggled *(shipped 2026-07-26 in the shared `DonateWidget`, Phase 5 PR 2)*
- [x] **"Add a note (optional)" field** — collapsed single-line input; value → Checkout Session `metadata`; surfaces in the Stripe dashboard for Matt *(shipped 2026-07-26 — also stamped onto payment-intent/subscription metadata so it shows on the payment itself)*
- [ ] One full test-card donation on production (`4242 4242 4242 4242`) + confirm `[donation] checkout completed` in Vercel function logs
- [ ] After domain cutover: update the webhook endpoint URL to `www.sckin.org` (Stripe dashboard, secret unchanged) or rerun the setup script with `WEBHOOK_URL=...`
- [ ] Enable Customer portal (Stripe dashboard → Settings → Billing) for recurring-donor self-serve
- [ ] Kit acknowledgment-email wiring (TODOs in webhook route; copy ready in `src/lib/donations.ts`)
- [ ] Go-live (after Stripe account review): reseed with live key, swap key values in Vercel, live webhook endpoint, $1 verify-and-refund

---

## Design (Phase 2) — locked 2026-07-22

Annex: `sckin-design-spec-phase1.md` (amended to match the resolutions in this
document). Comps exist at 390px and 1440px in Claude Design.

- [x] Reference decomposition (Red Cross structure · Apple execution) + 4-round preference elicitation
- [x] Hero: two-tone stacked headline (black + red "universally accessible."), 501(c)(3) overline, primary CTA **Try SickleCellPedia**, text link **Our mission →**; no hero image; capped at 72px on desktop
- [x] Homepage flow: Hero → Mission → Products (2 cards) → Impact band (red) → News → Donate band (red) → Footer
- [x] Impact band content: 7.7M · 500K+ · ~80% · **+5 yrs (OUR GOAL treatment)**, GBD 2021 citation *(figures pending verification — see Remaining blockers)*
- [x] Donate band copy (child-mortality lead) + Stripe trust line; impact-equivalence placeholders clearly marked pending unit costs
- [x] Footer: brand + Kit newsletter signup · Explore + Support link groups · legal bar (© · 501(c)(3) · EIN · Privacy · Terms)
- [x] Product cards: SickleCellPedia one-liner · Pro one-liner with IN DEVELOPMENT tag + Register interest → `#register`
- [x] ~~Design revision needed: donate band presets must be frequency-dependent~~ **resolved in the imported comps** — verified 2026-07-26: `Homepage.dc.html` (`685c4b4`) swaps the preset row with the toggle (one-time $25/$50/$100, $25 default · monthly $10/$20/$50, $20 when toggled), Monthly carries the "most impactful" tag, plus custom amount + collapsed note field
- [x] ~~Design revision needed: nav must match the locked set~~ **resolved in the imported comps** — verified 2026-07-26: the 1440px comp (`685c4b4`) shows About us ▾ · SickleCellPedia · For Clinicians · Responsible AI · Impact ▾ · News ▾ · reserved language-toggle slot · red Donate; 390px keeps hamburger + Donate. *Dropdown contents aren't modeled in the static comp — implement them from the locked set (About anchors · Impact/Publications · Latest News/Blog)*
- [x] Token exports: CSS custom properties file + `tokens.json`, full red ramp + neutrals, AA-safe red stop marked for small text on white *(verified 2026-07-26: `src/styles/tokens.css` + `docs/design/tokens.json` in-repo since `685c4b4` — red-50→900 + gray-0→900 ramps, `--red-500` `#8A1626` annotated 9.5:1 on white, AA/AAA-safe for all text sizes; not yet wired into the app — that's Phase 5)*
- [x] ~~Remaining component designs so the set is complete: Publications entries · News cards/filters · Pro lead form · legal-page template~~ **descoped as Phase 5 blockers 2026-07-26** — resolved per component: **legal-page template** needs no design task (the generic tokenized page template *is* the design; realized when Phase 5 restyles `LegalDocument.tsx`) · **Publications entries** fold into Phase 5 (typographic list item — title · authors · venue · date · link — fully determined by the frozen tokens) · **Pro lead form** derives during Phase 5 from the donate-band comp's form patterns + the token file's form vocabulary (`--border-input*` · error states · chips · segments); optional single Claude Design turn in the existing project if a comp is wanted first · **Responsible AI page** unchanged (deferred per 2026-07-22) — all reviewed on staging per the waived-gate loop
- [ ] News cards/filters design — the one standalone design task left; **deferred until the DAG taxonomy (`topics`/`geographies` frontmatter) + seed posts exist** (~Sept 2026 classifier launch), so the filter UI is designed against real data rather than a speculative taxonomy
- [x] ~~Pre-implementation stakeholder gate~~ **waived 2026-07-22** — Wunmi + Lewis give feedback on the published staging site instead (post-launch loop; token architecture makes revisions a token swap). **Tokens are frozen as of 2026-07-22** (with the `#8A1626` red revision + `$note` provenance correction)

---

## Pages

### 1. Home — `/` ◐ *(redesign supersedes the v3.1 build)*
v3.1 build committed `e8e3036` is **superseded by the locked design** (see Design
section). To carry over deliberately, not silently drop: hypothesis → one-line
distillation in the Mission section (full text on `/mission`) · Sickle Cell News
tool card → **News section intro carries the product framing** (2026-07-22:
Products stays two cards; News is introduced as the AI-curated service — e.g.
"AI-curated research and community updates from around the world" — with the
Sept 2026 badge where relevant, linking to `/news` for the full classifier
explanation) · WhatsApp QR → lives on
`/sicklecellpedia` · email signup → footer (already wired to `/api/newsletter`).
Dropped by design: hero image, tool images, three-tool layout.

- [x] Copy exists (hero, mission, product one-liners, impact stats, donate band, news headlines)
- [x] Rebuild `/` to the locked design once tokens freeze (Phase 5) *(shipped 2026-07-26, PR #12 — content/home.md rewritten to the locked section shape)*
- [x] One-line hypothesis distillation for the Mission section (derive from `/mission`) *(shipped 2026-07-26 — "We believe the information gap drives the life-expectancy gap. Close the first, and the second begins to close.")*
- [ ] 1 testimonial *(slot in Mission or Donate band — blocked on testimonial asks)*
- [ ] {PENDING} "Sickle Cell News" name confirm

### 2. Mission — `/mission` ✅
*Committed `36fb373`, live on staging. Short page — done.*
**2026-07-22:** full hypothesis text lives here (Home carries only a one-line distillation).

- [x] Mission statement *(verbatim: "Our mission is to make useful and reliable information about sickle cell disease universally accessible." — Home's Mission section headline uses the same verbatim statement)*
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
- [x] Board photos → `public/images/team/` *(landed 2026-07-26 — all nine board photos in place at the documented paths and rendering; org logos in `public/images/logos/` still pending, name-only fallback meanwhile)*
- [x] → Paste to Claude Code

### 5. Donate — `/donate` ◐
*Prioritize — revenue page. Stripe checkout is live in test mode — see the Donations (Stripe) section above. 2026-07-20 (`a261344`): eyebrow now the doc title "Support Our Work"; fine print carries the verbatim master-doc tax line ("…tax-deductible to the extent permitted by law"). **2026-07-22: defaults flip to one-time-first — see Donations section.***

- [x] Why donations matter / what they fund *(lede: sustains SickleCellPedia; expand later if desired — designed donate-band copy with child-mortality lead can be reused here)*
- [x] Suggested amounts — one-time $25/$50/$100 · monthly $10/$20/$50 · custom
- [x] ~~Recurring giving default~~ → **One-time is the default** ($25 pre-selected); Monthly keeps the "most impactful" tag *(shipped 2026-07-26, Phase 5 PR 2)*
- [x] Tax note — EIN 33-1763512, 501(c)(3) language on donate + success pages
- [ ] 2–3 condensed impact stats + link to `/impact`
- [ ] 1 patient testimonial
- [x] Confirmation / thank-you copy — `/donate/success` with IRS receipt language
- [x] → Paste to Claude Code

### 6. SickleCellPedia Pro — `/sicklecellpedia-pro`
*Pre-launch page — credibility carries it. Built to master doc v3.1 (`39ca799`); v3.1 field set + required consent checkbox → `/api/pro-lead` (`9aa2577`). **Form renders and validates but is inert pending the Google service account + Sheets env vars** — see Technical setup. **Nav label is "For Clinicians"** (2026-07-22); the page carries the full product name.*

- [x] Tagline — one-line value prop for HCPs *(2026-07-22: "Clinical decision support for health professionals treating sickle cell disease in under-resourced settings.")*
- [x] Intro *(v3.1 wording — "…and other underserved communities")*
- [x] 4 features *(mandatory citations · chain-of-thought · multi-agent · credential-based access)*
- [ ] Additional features? *([TO ADD] in the doc)*
- [ ] Lead-capture subtext *(doc's example line renders at `#register`; final copy [TO ADD])*
- [ ] Confirmation message *(doc's example line renders on submit; final copy [TO ADD])*
- [ ] Clinician testimonials
- [x] → Paste to Claude Code

### 7. Responsible AI — `/responsible-ai`
*Heavy lift. Distinctive — few nonprofits have this. **Top-level nav item (2026-07-22); page design deferred — ships with the token system's generic page template until designed.** Copy landed 2026-08-18 (Zacharie's polished draft): flat top-level sections `#approach` (five commitments + Warrior Con slides link) · `#grounding` · `#disclaimer` · `#pro` · `#limitations` · `#evaluation` · `#privacy`, replacing the 2026-07-20 `#approach`-with-sub-blocks + `#surveys` scaffold (see the 2026-08-18 History entry).*

- [x] Our approach — five commitments + link to the Warrior Con 2026 presentation
- [x] Guideline grounding & mandatory citations — with "get in touch" → `/contact`
- [x] Medical disclaimer
- [x] SickleCellPedia Pro — robustness bullets + link to `/sicklecellpedia-pro`
- [x] Known limitations — **be candid; candor is what makes this page credible**
- [x] Evaluation & benchmarking — ASCAT October 2026 · HITL surveys vs ChatGPT/Claude/Gemini, HealthBench method
- [x] Data privacy — links `/privacy`
- [x] ~~`#surveys` — intro · who can participate · what's involved · CTA · survey embed~~ **dropped 2026-08-18** — superseded by the human-in-the-loop copy in Our approach + Evaluation & benchmarking; revisit if a "Become a rater" flow ships
- [x] → Paste to Claude Code

### 8. Impact — `/impact`
*Needs real numbers. Don't let it block the other pages. **Gates the Impact ▾ nav item going live (2026-07-22).***

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
- [ ] ⚠️ **No placeholder figures — funders read this page** *(this rule is why the homepage impact band deliberately uses epidemiology + the +5 yrs goal, not SCKIN traction numbers — the two are complementary, not duplicative)*

### 9. Publications — `/publications`
*Assembly, not writing. Pull from Zotero + abstract records. Route stays top-level `/publications` (commit `a294044`); **nav placement moved under Impact ▾ 2026-07-22**. Four sections — Presentations · Publications · Abstracts · Other Contributions.*

- [ ] Intro line *(doc's example line renders; final [TO ADD])*
- [ ] EHA Stockholm 2026 *(add: Submission ID EHA-4931, Abstract Code PB3135 — accepted; presented June 11–14 2026)*
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
- [x] Events subpage — `/events` + `/events/[slug]` *(2026-09-04: events from across the sickle cell community, relayed by SCKIN — third-party webinars, symposia, awareness days, patient-association meetings; Upcoming/Past split at render time with hourly ISR; Register + flyer + .ics links; posts in `content/events/`, copy + every label in `content/events.md`; see History)*
- [ ] 3–5 seed posts so the page isn't empty at launch *(only `example-post.md` today; the three headlines used in the homepage design — EHA abstract accepted · WhatsApp launch · Warrior Con — are natural seeds)*
- [ ] Confirm DAG emits the agreed frontmatter contract *(`title`, `date`, `summary`, `source_url`, `topics: []`, `geographies: []`, `image`)*
- [x] → Paste to Claude Code *(landing + blog shipped; seed posts + taxonomy later)*

### 11. Contact — `/contact`
*Mostly stubbed. Form backend is wired; copy is not. Out of nav; footer-linked.*

- [ ] Hero subhead
- [ ] Google Calendar scheduling link
- [ ] "Prefer to talk?" line
- [ ] Confirmation message
- [ ] → Paste to Claude Code

### 12. Utility ♻️

- [x] `/whatsapp` — migrate from existing site *(the WhatsApp bot's welcome links here for terms — keep consistent with `/terms`; see WhatsApp integration)* *(shipped 2026-07-19 as an **unlisted** landing page: noindex,nofollow · no sitemap entry · removed from the footer nav · normal site chrome · links to `/privacy`, `/terms`, and the feedback Google Form)* ⚠️ **must stay unlisted through the redesign — do not re-link it in the new footer**
- [ ] `/feedback` — migrate + add testimonial consent language
- [x] Footer — contact · socials · links · legal (`/privacy` · `/terms`) *(legal links added 2026-07-19; 2026-07-20 `226bb91`: real Facebook + LinkedIn URLs — confirm the LinkedIn slug spelling "knowlege" — wa.me placeholder social removed)* **2026-07-22: footer to be rebuilt to the locked design** (brand + Kit newsletter signup · Explore + Support groups · legal bar) — carry over the real social URLs and keep `/whatsapp` out
- [x] Rebuild nav to the locked 2026-07-22 set *(shipped 2026-07-26, PR #11 — hover/focus dropdowns, mobile hamburger, reserved language-toggle slot; Impact ▾ ships gated behind `IMPACT_NAV_LIVE=false` in `src/lib/nav.ts` until `/impact` has real numbers, with Publications reachable from the footer meanwhile; footer rebuilt in the same PR to the locked design, socials carried over, `/whatsapp` kept out)*
- [ ] → Paste to Claude Code *(remaining: `/feedback` form only)*

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
Destination: `public/images/` *(currently holds `whatsapp-qr.png`; team photos → `public/images/team/`, org logos → `public/images/logos/`, blog featured images → `public/images/blog/` (empty since 2026-09-04), event flyers → `public/images/events/` — the documented per-person/per-org filenames are already referenced in `content/about.md`, so files appear on drop-in with no code change)*.

- ~~`home-hero.jpg`~~ *(dropped 2026-07-22 — locked design is minimal-typographic, no hero image)*
- ~~`home-tool-pedia.jpg` · `home-tool-pro.jpg` · `home-tool-news.jpg`~~ *(dropped 2026-07-22 — product cards are text-only in the locked design)*
- [x] `sicklecellpedia-qr.png` *(regenerated crisp as `whatsapp-qr.png` via `scripts/generate-whatsapp-qr.mjs` (`c321570`), shown on SickleCellPedia)*
- [x] Board photos (×9) → `public/images/team/` *(landed 2026-07-26 — renamed to the documented `team-<name>.jpg` paths, converted to JPEG and resized to max 960px, 15.6 MB → 1.2 MB total; all nine render on `/about`, initials placeholders retired)*
- [ ] Founder photo
- [ ] Org logos (RED · ASH–SCDC · SC3) → `public/images/logos/` *(name-only rendering meanwhile)*
- [ ] `publication-genai-safety-poster.jpg` *(poster thumbnail for the Presentations entry)*
- [ ] SCKIN logo *(pull from current site)*
- [ ] **Alt text for every image** — accessibility + SEO *(QR + board/logo alts shipped; hero/tool alt TODOs in `content/home.md` become obsolete with the redesign — remove them in Phase 5)*

---

## After the content

- [x] ~~**Finish the design deliverables**~~ **closed 2026-07-26** — the two comp revisions resolved in the imported comps · token exports verified in-repo · component designs descoped as Phase 5 blockers (see Design section); the only standalone design task left is News cards/filters, deferred on the taxonomy
- [ ] **Stakeholder feedback (post-launch)** — Wunmi + Lewis review the deployed staging site; revisions applied as token/copy changes *(pre-implementation gate waived 2026-07-22)*
- [x] **Phase 5 (Claude Code)** — **shipped 2026-07-26 as PRs #11/#12/#13**: tokens wired into the theme + Inter · nav/footer rebuilt to the locked set · `/` rebuilt to the locked design · all pages restyled with tokens (page markdown untouched except home.md, rewritten by design) · donate default flip + note field · one-line hypothesis distillation *(see the 2026-07-26 Phase 5 History entry)*
- [ ] Integrations — Voiceflow embed · Stripe checkout · embed/licensing form link
- [ ] QA — `design-review` skill against the staging URL · accessibility (WCAG AA — use the AA-safe red stop from the token export for small text on light backgrounds · `prefers-reduced-motion` degrades scroll reveals to static) · mobile · performance on a throttled connection *(low-bandwidth mobile is a primary audience)*
- [ ] Domain cutover — lower TTL a few days ahead · point sckin.org DNS at Vercel · keep Squarespace live until it resolves *(Vercel provisions SSL automatically once DNS verifies)* · update the Stripe webhook URL after cutover
- [ ] *(Post-launch: Decap CMS at `/admin` — needs a GitHub OAuth app + one-file OAuth handler API route · news auto-repost to FB/LinkedIn · registrar move to Cloudflare · then the MCP server on AWS)*

---

## Suggested order

**Design close-out:** ~~revisions + token export + stakeholder gate~~ ✅ *(closed 2026-07-26 — revisions resolved in the comps, tokens exported + frozen, gate waived; component designs descoped as blockers same day — only News cards/filters remains, deferred on the taxonomy)*
**Implementation:** nav/footer + Home rebuild + donate changes (one PR or a short series)
**Content in parallel:** Responsible AI copy → Impact numbers → Contact → Utility
**Warm-ups already done:** Mission · SickleCellPedia · About · Publications structure

Impact last on purpose — it depends on numbers you may still be gathering, and it gates its own nav item, nothing else.

---

## History

### Chicago summit: final CME flyer and copy replace the first version (2026-09-04)

UIC issued the final, CME-accredited flyer for the **9th Annual Chicago
Sickle Cell Summit** (file `2026 Chicago Sickle Cell Summit CME Flyer 04SEP26
FINAL.pdf`) and Zacharie supplied replacement copy — a long version for the
event page body, a short one for the `/events` card. Both replace the flyer
and copy shipped in PRs #18/#19. The LinkedIn post is handled off-site and
was not touched. Facts checked against the new flyer; what changed:

- **Start time 10 AM → 9 am** Central (`eventStart` is now `09:00-05:00`;
  the "When" line and the .ics follow). End time unchanged, 3 pm.
- **Registration link → `https://tinyurl.com/SCDSummit2026`** (replaces the
  `uic.zoom.us/webinar/register/…` URL). The tinyurl resolves to a UIC Zoom
  link, so `platform: Zoom` stays even though the flyer says "(VIRTUAL)".
- **Speakers:** keynote Mark T. Gladwin, MD (University of Maryland) plus the
  seven featured speakers from UIC and Northwestern named on the flyer,
  including Lewis Hsu, MD — all in `speakers`, so the facts block matches.
- **CME (new):** up to 3.0 *AMA PRA Category 1 Credits*™, accredited by the
  University of Illinois College of Medicine at Chicago — in the body and
  the summary. **Contact (new):** Judy Nocek, PhD, Project Coordinator,
  jnocek@uic.edu — in the body as a plain mailto link (it is public on the
  flyer, unlike the Friends emails, so no obfuscation).
- **Organizer** reworded to the flyer's own phrasing (volunteer Community
  Advisory Board, patient advisors, community-based organizations — UIC).
  **`cost: Free` kept:** the new flyer states no fee and nothing contradicts
  the earlier "free" relayed by Dr. Hsu; flagged for confirmation.
- **Assets:** same paths (`/documents/chicago-sickle-cell-summit-2026.pdf`,
  `/images/events/chicago-sickle-cell-summit-2026.png`), so no link or
  import changes; the old files are overwritten, not kept alongside. Page 1
  rasterized at 1600px wide (was 1200; `next/image` derives the responsive
  variants, so no hand-made srcset). Alt text as supplied.
- No Open Graph image or JSON-LD Event schema exists for events (only
  `/friends/[slug]` sets `openGraph`) and there is no sitemap, so nothing
  else to update.

### Friends of SCKIN defined; first friend Leyla Hamidou, ONG DES, Niger (2026-09-04)

Zacharie defined the long-open "Friends of SCKIN" section: people and
organizations across the sickle cell community who use SCKIN's tools in their
own work, each with a card and a full story page. First friend: Leyla Aïssa
Hamidou, President and Coordinator of DES (Drépanocytose Éducation Santé),
Niamey. Built on `feat/friends-leyla-hamidou`; **Leyla approves the Vercel
preview before it merges** — not auto-merged. Decisions:

- **Placement:** the existing `/about#friends` anchor (About ▾ → Friends of
  SCKIN), which was heading-only, rather than the home page — the locked
  home flow has no Friends slot. Story pages at `/friends/<slug>`.
- **Content model:** `content/friends/<slug>.md` — name · title · seo_title
  · role · organization · location · quote · intro · story_link_label ·
  photo (+alt) · publishedAt · sections[] (markdown) · videos[] (YouTube id
  · caption · note) · contacts[] (label · email) · back_label, plus a `fr`
  block mirroring the translatable fields. Adding a friend = adding a file.
- **Photo:** Leyla supplied a portrait the same day — cropped to a square
  960×960 JPEG at `public/images/friends/leyla-hamidou.jpg` (no GPS/device
  metadata), which is also the Open Graph image. Should the file ever go
  missing, the card and page fall back to an initials placeholder of the
  same size. No video frame used.
- **Videos:** two unlisted SCKIN YouTube videos via youtube-nocookie.com,
  lazy, 16:9, fullscreen — new `YouTubeEmbed` component; no .mp4 in the
  repo. Swapping a video is a one-line content change.
- **Emails:** published with Leyla's permission; rendered as mailto links
  with every character HTML-entity-encoded (`ObfuscatedEmail`) — works
  without JS, defeats naive scrapers.
- **French:** stored under `fr` in the content file, not rendered — the site
  is `en`-only with no switcher. No sitemap exists to update.

### Events section added; the Chicago summit moves out of the Blog (2026-09-04)

Hours after PR #18 landed, Zacharie re-scoped the News menu: **Latest
News** = SCKIN's own news · **Blog** = updates about SCKIN's work · **Events**
(new) = events from across the sickle cell community — webinars, symposia,
awareness days, patient-association meetings — mostly organized by others
and shared with us. The Chicago summit is a relayed third-party event, so it
moved from the Blog into the new section. Decisions:

- **Nav amended:** News ▾ = Latest News · Blog · Events. Amends the
  2026-07-22 locked set on Zacharie's instruction; annex line updated to
  match. Home page untouched in this pass.
- **Content model:** `content/events/*.md` (slug = filename, as for
  news/blog) with landing copy *and every UI label* in `content/events.md`,
  so a `content/events.<locale>.md` localizes the section without code —
  the site is still `en`-only (`LOCALES`), and events thread `locale`
  through loaders, links and Intl formatting the way the rest of the app
  does. Frontmatter is camelCase like the legal collection (contract for a
  future CMS collection): `eventStart`/`eventEnd` as ISO 8601 with offset ·
  `timeZone` label · `format` (online · in-person · hybrid) · `location` ·
  `platform` · `organizer` · `speakers` · `cost` · `registrationUrl` ·
  `flyerPdf` · `flyerImage`(+`Alt`) · `sourceNote` · `publishedAt`. No
  author, no tag: events are attributed to the organizer.
- **Behaviour:** `/events` splits Upcoming (soonest first) / Past (most
  recent first) on `eventEnd` vs. now; both pages revalidate hourly (ISR) so
  the split and the Register button move without a deploy. Past cards keep
  full text contrast (WCAG) but lose the tinted card and Register and carry
  a "Past event" pill. `/events/[slug]` detail + `/events/[slug]/calendar`
  (.ics, small dynamic route handler — no dependency). One-line disclaimer
  on listing and detail.
- **Blog post removed; nothing to redirect.** Blog posts render inline on
  `/news/blog` and never had a URL of their own, so no shared link breaks;
  the flyer PDF keeps its `/documents/` path. Its image moved to
  `public/images/events/` (`public/images/blog/` now empty). The blog card's
  optional image/cta/links fields from PR #18 stay — harmless and
  documented.
- No sitemap exists in the repo, so nothing to add there.

### Chicago Sickle Cell Summit post; blog cards gain image + CTA slots (2026-09-04)

Dr. Lewis Hsu (UIC, SCKIN Medical Director and board member) shared the
flyer for the **9th Annual Chicago Sickle Cell Summit** — *Hope for Sickle
Cell Through Clinical Trials*, a free Zoom webinar on 2026-09-24 hosted by
UIC's Community Advisory Board, keynote Dr. Mark Gladwin. Decisions:

- **Home is the Blog, not the News feed.** `content/news/` is reserved for
  the classifier pipeline (§10: "posts come from the DAG"), so a hand-written
  SCKIN notice lands in `content/blog/` beside the Warrior Con post — master
  doc boundary: "News = announcements, partnerships, events, updates". Tagged
  `Announcement` (documented set: Announcement / Product / Impact; no Event
  tag introduced).
- **Blog card now renders the optional `image`** the v3.1 entry format always
  allowed, plus optional companions added to `BlogPostFrontmatter`:
  `image_alt`, `image_href` (the image links out, new tab — here to the flyer
  PDF), `cta` (pill button, new tab) and `links` (secondary links, new tab).
  All optional; the Warrior Con post is unchanged.
- **Assets:** flyer PDF → `public/documents/` (beside the Warrior Con
  agenda); page 1 rasterized to `public/images/blog/` at 1200px wide — the
  first file in that folder.
- No per-post detail route exists (posts render in full on `/news/blog`) and
  none was added; no `event_date` field either — the date/time lives in the
  copy.

### Responsible AI copy landed; #surveys section dropped (2026-08-18)

Zacharie supplied the polished Responsible AI draft and it shipped verbatim
(minus light link wiring). Decisions taken with him this session:

- **Title unchanged.** "How responsible AI can revolutionize sickle cell
  care" is the *presentation* title, not a page rename — `/responsible-ai`
  keeps its URL, nav label, and "Responsible AI" H1.
- **Warrior Con slides linked from Our approach.** The Google Slides deck
  from the "Sickle Cell Health & A.I." session (Warrior Con 2026, July 23,
  Los Angeles — see the same-day blog post, PR #16) closes the section so
  visitors get a visual of the vision; opens in a new tab via
  renderSectionBody.
- **Structure flattened.** The 2026-07-20 scaffold (`#approach` with five
  sub-blocks + `#surveys`) became seven flat top-level sections — approach ·
  grounding · disclaimer · pro · limitations · evaluation · privacy — the
  new copy added SickleCellPedia Pro as a peer topic and reads as siblings,
  not children. No inbound `#`-links existed, so no redirects needed.
- **`#surveys` dropped** (Zacharie's call, recommended): human-in-the-loop
  now lives in the fifth commitment and in Evaluation & benchmarking; the
  grounding section's "get in touch" → `/contact` covers collaborator
  recruitment until a "Become a rater" flow ships.
- **Pro section links onward** to `/sicklecellpedia-pro` and its
  `#register` interest form (Zacharie's call, recommended).

### Link rendering bug fixed + link-affordance rule adopted (2026-07-26)

Zacharie flagged post-Phase-5 staging: the Donate pill rendered dark grey on
red, and text links rendered plain grey. Root cause was a CSS cascade-layer
bug, not the design: `globals.css` declared `a { color: inherit }` OUTSIDE
any `@layer`, and unlayered CSS outranks Tailwind's layered utilities — so
every `<a>` ignored its color utility (`text-on-band`, `text-link`, …) and
inherited body grey. The frozen tokens were correct all along. Fix: all
hand-written base rules moved into `@layer base` (the redundant anchor rule
deleted — preflight covers it) and `.prose-sckin` into `@layer components`,
which also un-broke per-use utility overrides like `text-[15px]` on prose
blocks. Rule for the future, recorded in globals.css itself: hand-written
CSS must always live inside a cascade layer.

Approved same day, a **link-affordance amendment** to the design annex
(WCAG 1.4.1 — color must not be the only cue): prose links are always
underlined; standalone links (nav, card CTAs, arrow links, footer) underline
on hover/keyboard focus only; pill-shaped anchors never underline
(`hover:no-underline` opt-outs). Tokens unchanged — no value revision, so
the 2026-07-22 freeze stands.

### Phase 5 shipped — the site wears the locked design (2026-07-26)

Implemented as a three-PR series, each squash-merged after green checks.
**PR #11 (`708cc54`)** wired the frozen token export into the live theme
(`globals.css` imports `src/styles/tokens.css`, semantic tokens mapped onto
Tailwind utilities; old placeholder `#c41e3a` palette deleted — `#8A1626`
everywhere), loaded Inter via next/font (400/600 only for low-bandwidth
mobile), and rebuilt the nav + footer to the locked set: hover/focus-within
dropdowns, reserved language-toggle slot, red Donate pill, animated mobile
hamburger with Donate kept visible; footer with brand + newsletter signup
(new `NewsletterSignup` → `/api/newsletter`), Explore/Support groups, legal
bar, carried-over socials. Impact ▾ ships gated (`IMPACT_NAV_LIVE=false`);
Publications sits in the footer's Explore group meanwhile; `/feedback` left
out of the footer per the comp; `/whatsapp` stays unlisted.
**PR #12 (`4bcf91a`)** rebuilt `/` to the comps (Hero → Mission → Products →
red Impact band → News → red Donate band), rewrote `content/home.md` to the
new section shape (obsolete v3.1 image alt TODOs gone), added the one-line
hypothesis distillation from `content/mission.md`, scroll reveals that zero
out under `prefers-reduced-motion` (hero exempt so LCP isn't gated on
hydration; noscript fallback), and the shared `DonateWidget` on the band and
`/donate`: one-time-first $25 default, frequency-dependent presets, note
field → Stripe metadata via `/api/checkout` (session + payment-intent/
subscription); the old recurring-first `DonateForm` deleted. The comp's
impact-equivalence placeholder line deliberately not rendered pending unit
costs. Verified 16/16 against a local prod server incl. live test-mode
Checkout URLs for all three shapes.
**PR #13** restyled every remaining page with the token system — Mission,
About (module CSS re-tokenized; it still referenced pre-Phase-5 variables
deleted in PR #11), SickleCellPedia, Pro (+ lead form to the §4c comp with
its success card), Publications (§4a: anchor pills + hairline entries), News
+ Blog (§4b cards), Responsible AI + legal pages (§4d template + prose
styles), Contact, Feedback, `/whatsapp`, donate success, Impact, 404 — via
shared `PageHeader` + `.prose-sckin`; page markdown/frontmatter untouched.
The §4 component comps (Publications entries · News card · Pro form · legal
template) turned out to exist in the imported `Homepage.dc.html` after all,
so PR #13 implemented them directly rather than deriving from tokens alone.
39/39 rendered-page checks pass; `tsc` + production build clean throughout.
Remaining before cutover: QA pass (design-review · WCAG AA · throttled
mobile), staging review by Wunmi + Lewis, one full test-card donation on
production, board photos/logos on drop-in.

### Design revision flags closed — already resolved in the comps (2026-07-26)

Verified the two "Design revision needed" items from the 2026-07-22
reconciliation against the imported comps (`docs/design/comps/Homepage.dc.html`,
`685c4b4`) and found both already incorporated — the comps were revised in
Claude Design before the import, but the checklist boxes were never ticked.
(1) Donate presets are frequency-dependent in the comp's interaction logic:
`freq === 'monthly' ? presets ['10','20','50'], def '20' : presets
['25','50','100'], def '25'` — matching the locked one-time-first decision and
the existing Stripe lookup keys — with the "most impactful" tag on Monthly,
custom-amount input, and collapsed note field, in both the 1440px and 390px
donate bands. (2) The 1440px nav renders the locked set exactly: About us ▾ ·
SickleCellPedia · For Clinicians · Responsible AI · Impact ▾ · News ▾ · a
24px spacer titled "reserved: language toggle" · red Donate pill; the 390px
comp keeps hamburger + Donate. Caveat carried onto the checklist item: the
static comp shows dropdown carets but not the open dropdown contents, so
dropdown internals are implemented from the locked set, not copied from the
comp. Both boxes ticked; the annex's ⚠️ outstanding-revision note replaced
with a resolved note. Same pass, on approval: the token-exports box was also
verified and ticked — `src/styles/tokens.css` + `docs/design/tokens.json`
(in-repo since `685c4b4`) carry the full red-50→900 and gray-0→900 ramps with
the AA-safe `--red-500` `#8A1626` stop annotated (9.5:1 on white); the tokens
are still not wired into the app, which remains Phase 5 work. The "Suggested
order" design-close-out line updated to match. Design section now fully
closed except the remaining component designs (Publications entries · News
cards/filters · Pro lead form · legal-page template).

**Same-day addendum (component-design descope):** the remaining-components
item resolved as a scoping decision — none of the four gates Phase 5, so
implementation starts with nothing on the design critical path.
Legal-page template: no design task; the generic tokenized page template is
the design, realized when Phase 5 restyles `LegalDocument.tsx`. Publications
entries: folded into Phase 5 — a typographic list item (title · authors ·
venue · date · link) fully determined by the frozen token system in a design
language where "type is the imagery." Pro lead form: derived during Phase 5
from the donate-band comp's demonstrated form patterns (inputs · pills ·
segmented controls) plus the token file's form vocabulary (`--border-input`,
error states, chips, selected segments); an optional single Claude Design
turn in the existing project (inherits the tokens) stays available if a comp
is wanted first. News cards/filters: the one standalone design task, kept as
its own checklist item and deferred until the DAG taxonomy
(`topics`/`geographies` frontmatter) and seed posts exist (~Sept 2026
classifier launch) — filter UI designed against real data, not a speculative
taxonomy. Responsible AI page design unchanged (2026-07-22 deferral). All
shipped states reviewed on staging per the waived-gate loop. The Design
deliverables line under "After the content" closed accordingly.

### Design reconciliation + master doc retirement (2026-07-22)

Phase 2 design locked in Claude Design (390px + 1440px comps; annex
`sckin-design-spec-phase1.md`). Reconciled the design against this checklist
and resolved six conflicts: (1) donate default flips to **one-time-first**,
$25 pre-selected — reverses the 2026-07-17 recurring-first decision;
(2) presets stay frequency-dependent (one-time $25/$50/$100 · monthly
$10/$20/$50), so the existing lookup keys hold and no reseed is needed — the
design's single $10–$100 row is flagged for revision; (3) nav rebuilt to the
locked 2026-07-22 set (About us ▾ · SickleCellPedia · For Clinicians ·
Responsible AI · Impact ▾ (Impact · Publications) · News ▾ · Donate), replacing
the v3.1 nav; Responsible AI stays top-level, its page design deferred;
(4) Publications: nav under Impact ▾, route unchanged at `/publications`;
Impact ▾ gated on real `/impact` numbers; (5) hypothesis: full text on
`/mission` only, one-line distillation on Home; (6) redesigned homepage fully
replaces the v3.1 home (`e8e3036`); hero + three tool images dropped from the
images list. Also: "Add a note" donation field approved (Stripe metadata);
"For Clinicians" adopted as the Pro nav label; the design annex's strict
"no Vercel-proprietary features" wording superseded by this document's
guardrail paragraph. `sckin-master-doc-v3_1.md` retired as a decision document
(repo copy kept as historical reference; `content/*.md` is the content source).

**Same-day addendum (import review):** Phase 2 tokens + comps imported via the
Claude Design → Claude Code handoff (PR #5, files-only: `src/styles/tokens.css`,
`docs/design/tokens.json`, `docs/design/comps/`). Token contract verified: full
red-50→900 + neutral ramps, semantic-only public API, AA-safe stop annotated,
motion tokens with reduced-motion override. Two findings: (1) the delivered ramp
is anchored on `#8A1626`, not the Phase 1 constant `#C41E3A`, and the token
`$note` fabricated a "2026-07-21 approval" that never occurred — **Zacharie
approved `#8A1626` for real on 2026-07-22** (9.5:1 on white, AA/AAA all text);
the `$note` must be corrected to this actual provenance, and org-wide brand-red
propagation (`#C41E3A` elsewhere) is tracked in Future work; (2) nav/footer/
donate-band comps live inside `Homepage.dc.html`'s design turns rather than as
standalone files — accepted, no extraction. The pre-implementation Wunmi + Lewis
gate was **waived**: they review the published staging site instead. **Tokens
frozen 2026-07-22.**

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
in `docs/stripe-donations.md`. *(Defaults revised 2026-07-22 — see the
Donations section and the 2026-07-22 History entry.)*

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
- [ ] **Reconcile SCKIN brand red org-wide** — the website now uses `#8A1626` (2026-07-22); `#C41E3A` persists in the logo, decks, and prior collateral. Decide: propagate the darker red everywhere, or document a deliberate two-red system (deep crimson digital, brighter red print/legacy).
- [ ] **Design the Responsible AI page** (deferred 2026-07-22 — ships with the generic tokenized page template until then).
- [ ] **Language toggle** — `/[locale]/` routing exists; the nav reserves a slot; ship when FR content is ready.
- [ ] **Stubs / TODOs left by the legal-pages task (2026-07-19):**
  - No `sitemap.ts` / `robots.ts` exists site-wide yet. When one is added, `/whatsapp` must be **excluded** from the sitemap and must **not** be listed in robots.txt (a `Disallow` would advertise the URL and block crawlers from seeing its `noindex`).
  - The footer's `/whatsapp` nav link was removed to keep the page unlisted — if it should be discoverable from the site after all, restore one `<li>` in `SiteFooter.tsx`.
  - Legal page `<title>`s follow the site template (`Privacy Policy — SCKIN`), not the `| SCKIN` variant from the task spec — deliberate, to match the repo's existing pattern.
  - Legal frontmatter is camelCase (`lastUpdated`) unlike the site's snake_case page frontmatter — deliberate, it's the contract for the future Decap collection; keep it stable.
  - Pre-existing and untouched: placeholder social URLs in the footer, stub `/feedback` page.
