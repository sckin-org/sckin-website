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

- [ ] Intro *(have it)*
- [ ] Web access copy + Voiceflow embed *(Project ID `684db2d2921b2a3ad5910594`)*
- [ ] WhatsApp access copy *(have it)*
- [ ] Facebook Messenger copy *(have it)*
- [ ] QR code image → `public/images/`
- [ ] EN/FR note *(have it)*
- [ ] → Paste to Claude Code

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
*Prioritize — revenue page.*

- [ ] Why donations matter / what they fund
- [ ] Suggested amounts (e.g. $25 / $50 / $100 / custom)
- [ ] Recurring giving — offer monthly? yes/no
- [ ] Tax note *(have it)*
- [ ] 2–3 condensed impact stats + link to `/impact`
- [ ] 1 patient testimonial
- [ ] Confirmation / thank-you copy
- [ ] → Paste to Claude Code

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

- [ ] `/whatsapp` — migrate from existing site
- [ ] `/feedback` — migrate + add testimonial consent language
- [ ] Footer — contact · socials · links
- [ ] → Paste to Claude Code

---

## Images

Originals (full resolution) → `Products > website > Images`. Name by page and role.
Destination: `public/images/` *(currently empty)*.

- [ ] `home-hero.jpg`
- [ ] `home-tool-pedia.jpg`
- [ ] `home-tool-pro.jpg`
- [ ] `home-tool-news.jpg`
- [ ] `sicklecellpedia-qr.png`
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
