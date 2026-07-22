# sckin.org redesign — Phase 1 design spec

Status: Locked (2026-07-21); amended 2026-07-22 after reconciliation against the SCKIN Website Requirements & Content Checklist, which is the **single source of truth** — this document is its design annex, and the Checklist wins on any conflict. Amendments: merged hero (product-first CTAs), verbatim mission statement in the Mission section, one-time-first donate defaults with frequency-dependent presets, expanded nav (Responsible AI top-level, Impact ▾ with Publications), Vercel guardrail softened.

## Design thesis

Red Cross structure, Apple execution. The site borrows the American Red Cross's information architecture and mission-forward confidence (bold red bands, prominent donate path, trust signals) but expresses it in Apple's visual language: generous whitespace, large restrained typography, one typeface, near-monochrome pages punctuated by deliberate full-bleed red sections, no photography clutter, subtle motion.

One-line test for any future design decision: "Would this look at home on apple.com if the accent were red and the subject were a nonprofit?"

## Reference decomposition

From redcross.org (structure):
- Mission-forward hero
- Persistent Donate CTA in the navigation
- Programs/services presented as a first-class homepage section
- Impact statistics as trust signals
- News/updates section
- Nonprofit credentials (501(c)(3), EIN) in the footer

From apple.com (aesthetic):
- Slim single-row sticky navigation
- Large, spare typography carrying the page; type is the imagery
- One type family, hierarchy through size and weight only
- Generous vertical whitespace between sections
- Minimal chrome; few borders; flat surfaces
- Subtle scroll-triggered reveals

Explicitly excluded for now: sign-in, language toggle. The nav layout must leave room to absorb a language switcher later without redesign (reserve the far-right slot before the Donate button, or plan for it in the mobile menu header).

## Brand constants

- Accent red: `#C41E3A` (SCKIN brand red)
- Typeface: Inter (single family, all roles)
- Organization: SCKIN — Sickle Cell Knowledge and Information Network, 501(c)(3), EIN 33-1763512

## Locked decisions

### Homepage purpose
Primary job: make a first-time visitor understand SCKIN's mission. Product trial, donation, and disease education are secondary paths, all reachable from the homepage but subordinate to the mission narrative.

### Red intensity
Bold — Red Cross-level confidence, expressed the Apple way. Red appears as full-bleed section bands and key CTAs, not as scattered decoration. The rhythm down the homepage is white → white → white → RED → white → RED. Within white sections, red is limited to headlines, CTAs, and small accents. Within the nav, the Donate button is the only red element.

### Imagery
Minimal and typographic. No stock photography, no photo collages. The "imagery" is large type, big statistics (e.g. the +5 years life-expectancy goal), and generous space. Product UI screenshots may appear on product pages if needed, framed simply. Illustration/iconography only where functionally required (e.g. small icons in cards), never decorative scenes.

### Navigation (amended 2026-07-22)
- Slim single-row nav, sticky, white/translucent background, monochrome except the red Donate button
- Items: About us ▾ (SCKIN · Our Founder · Board · Collaborators · Friends) · SickleCellPedia · For Clinicians · Responsible AI · Impact ▾ (Impact · Publications) · News ▾ (Latest News · Blog) · Donate (red button)
- "For Clinicians" is the nav label for SickleCellPedia Pro; the full product name lives on the page itself
- Publications routes to top-level `/publications` (only the nav placement is under Impact ▾); the Impact ▾ item goes live only once `/impact` carries real numbers
- Reserved space for a future language toggle; mobile hamburger retained
- Note: six items + Donate is at the ceiling for a slim nav — if desktop spacing gets tight, tracking/size adjustments before any structural change

### Hero (merged — amended 2026-07-22)
White background, left-aligned, no imagery. Overline: "SCKIN — A 501(c)(3) NONPROFIT". Two-tone stacked headline: "Reliable sickle cell knowledge," in near-black, "universally accessible." in brand red. Supporting line in neutral gray. Primary CTA: red filled button **"Try SickleCellPedia"**; secondary: red text link **"Our mission →"** (routes to `/mission`). Desktop headline capped at 72px.

Deliberate amendment to the round-1 decision: the page stays mission-first in *narrative* (headline, overline, section order), while the primary *action* is product trial — trying SickleCellPedia demonstrates the mission better than reading about it. The hero button should visually dominate the nav's red Donate button at mobile widths so the two red elements don't compete.

The Mission section (section 2) carries the verbatim mission statement as its headline: "Our mission is to make useful and reliable information about sickle cell disease universally accessible." — matching `/mission`. It also carries a one-line hypothesis distillation (full hypothesis text lives on `/mission` only) and ends with the "Our mission →" link.

### Homepage section order (Option 1)
1. Hero — mission statement (white, red headline)
2. Mission — what SCKIN does, expanded (white)
3. Products — SickleCellPedia and SickleCellPedia Pro (white)
4. Impact stats — full-bleed red band, white type, large numbers
5. News — latest updates (white)
6. Donate — full-bleed red band with the case for giving and Stripe-backed CTA
7. Footer

Rationale kept for the record: fullest narrative arc (who we are → what we built → proof → what's new → the ask) and even spacing of the two red bands.

Section 3 (Products) stays two cards — Sickle Cell News is deliberately *not* a third card (2026-07-22): it's a content service, not an interactive tool, and a three-card row with two "in development"/"expected" badges would read as an organization of promises. Section 5 (News) instead opens with the product framing — an intro line presenting Sickle Cell News as the AI-curated service, with its status badge where relevant — so each section keeps one job: Products = what you can use, News = what's happening.

### Footer (medium)
Dark charcoal footer, three zones:
- Brand + newsletter signup (Kit/ConvertKit-backed) in the leading column — "Get sickle cell news in your inbox"
- Two link groups: Explore (About us, SickleCellPedia, For clinicians, News and blog) and Support (Donate, Contact, Partner with us)
- Legal bar: © SCKIN · 501(c)(3), Privacy, Terms
No full sitemap — the site is ~10 pages and the nav already covers it. Revisit if the sitemap grows substantially.

### Typography
Inter throughout, loaded as a variable font or two weights maximum (400, 600/700). Hierarchy comes from size and weight, never from a second family. Rationale: screen-native at all sizes, single-family Apple approach, smallest font payload for low-bandwidth mobile users (a primary audience in Sub-Saharan Africa).

### Motion
Subtle scroll-triggered reveals (fade + 20–30px rise) on section entry, Apple-style. Constraints:
- IntersectionObserver + CSS transitions only; no animation libraries, no scroll-jacking
- Durations 300–500ms
- `prefers-reduced-motion: reduce` must degrade everything to static
- Hover states on all interactive elements

### Impact stats (red band content)
Framing: the band presents the scale of the problem building to SCKIN's commitment — three world facts, one organizational goal. It is not an organizational-traction band (traction numbers are too early; swap them in later as usage milestones mature, replacing the 80% stat first).

1. **7.7M** — people living with sickle cell disease worldwide
2. **500K+** — babies born with SCD every year
3. **~80%** — of those births are in Sub-Saharan Africa
4. **+5 yrs** — our goal: five more years of life expectancy in the most affected countries, within five years

Design notes:
- Stat 4 is the signature: give it distinct treatment (e.g. the only one labeled "our goal") so the band reads as facts building to a commitment
- Small footnote citation under the band: Global Burden of Disease 2021 (The Lancet Haematology) for stats 1–3; verify exact figures against the source before ship
- White type on the `#C41E3A` band; numbers large, labels small (minimal-typographic imagery doing its job)

## Constraints for Phase 2 (token definition)

1. Accessibility, WCAG 2.1 AA. `#C41E3A` on white passes AA for large text and UI components but check every body-text use; body-size red text on white needs a darker red token (define a `red-700`-style stop) or should be avoided. White text on `#C41E3A` passes AA. Define contrast-verified pairs as semantic tokens, not per-page decisions.
2. Token-first, vendor-neutral. Tokens ship as CSS custom properties (with a `tokens.json` source), consumable by vanilla Next.js/Tailwind theme config. *(Amended 2026-07-22: the Checklist's guardrail supersedes the earlier blanket "no Vercel-proprietary features" wording — hosting is committed to Vercel Pro; avoid Vercel-proprietary primitives only where a standard Next.js equivalent exists. The tokens themselves remain vendor-neutral regardless.)*
3. Red ramp needed. Build a full ramp around `#C41E3A` (tints for backgrounds/hover, shades for text/pressed states), not just the single brand hex.
4. Performance budget. Audiences include low-bandwidth mobile users; keep font weights ≤2 files, no decorative images, no JS animation libraries.
5. Semantic layer required. Components reference semantic tokens (`--color-cta`, `--surface-band`, `--text-heading`), never raw hex — this is what keeps future changes to a token swap.
6. Decap CMS compatibility. Page templates must keep the existing markdown/frontmatter structure so CMS wiring stays seamless; existing pages (/privacy, /terms, /whatsapp) adopt the new tokens without content restructuring.

## Open questions deferred to Phase 2

- Exact red ramp stops and the neutral gray scale
- Spacing/radius/shadow scales
- Whether the site ships a dark mode (recommendation: no for v1; the brand expression is white + red, and dark mode doubles the QA surface)
### Donate band (locked 2026-07-22 — supersedes the deferred item)
Copy: lead with the under-five mortality fact for children born with SCD in parts of Sub-Saharan Africa (held back from the impact band deliberately — it earns the ask), then the knowledge-saves-lives thesis, then "Your gift keeps SickleCellPedia free…". Trust line: "Secure payment via Stripe · SCKIN is a 501(c)(3) nonprofit."

Mechanics (must match `/donate` — one shared component):
- Default frequency: **One-time**, $25 pre-selected; button reads "Donate $25"
- Presets are **frequency-dependent**: One-time $25 / $50 / $100 · Monthly $10 / $20 / $50 ($20 pre-selected when toggled) — the preset row swaps with the toggle. Matches the existing Stripe lookup keys (`once_25/50/100`, `monthly_10/20/50`); no catalog reseed
- Monthly carries a "most impactful" tag but is never pre-selected
- "Add a note (optional)" — collapsed single-line field; value → Stripe metadata
- Impact-equivalence copy ("$25 provides…") stays as clearly-marked placeholders until real unit costs exist
- ⚠️ Design revision outstanding: the current comp shows a single $10–$100 preset row — replace with the frequency-dependent rows above
