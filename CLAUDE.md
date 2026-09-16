# SCKIN Website

Next.js (App Router) site for SCKIN, a 501(c)(3) sickle-cell nonprofit. Hosted on
Vercel (team SCKIN, project sckin-website). The sckin.org domain cutover completed
in August 2026 — DNS on Route 53, registration transferred to AWS — so **merges to
`main` auto-deploy to the live, public site at sckin.org**. There is no staging
environment: a PR's preview deployment is the only pre-production check.

**Source of truth:** `sckin-website-requirements.md` — the requirements & content
checklist. `docs/sckin-design-spec-phase1.md` is its design annex; the checklist
wins on any conflict. Record every decision as a dated History entry in the
checklist, in the same PR that implements it.

## Working agreement (autonomy)

Proceed without pausing for approval through the established flow:

- branch → commit → push → `gh pr create` → wait for checks →
  `gh pr merge --squash --delete-branch --admin` → fast-forward local `main`.
  (Branch protection requires 1 review; the solo-author `--admin` bypass is the
  accepted pattern — all PRs land this way.)
- Builds, typechecks, restyling, content/doc edits, scratch scripts, test-mode
  Stripe verification, and branch cleanup.

Stop and ask before any one-way door:

- Switching Stripe from test to live mode (keys, live webhook, live catalog
  seed), or issuing refunds
- Domain/DNS or registrar changes (the cutover completed Aug 2026 — Route 53 DNS,
  AWS registration)
- Anything that spends money or changes billing/plans
- Sending real communications: Kit/newsletter emails, social posts, anything
  user-facing off-site
- GitHub org/repo settings, secrets, or collaborator access
- Force-push, history rewrites, deleting the repo or unmerged work
- Reversing or waiving a decision locked in the requirements checklist

## Conventions

- Squash-merge only; one commit per PR; subject in `type: ...` style
  (`docs:` / `feat:` / `fix:`)
- Page copy lives in `content/*.md` (gray-matter frontmatter) — keep frontmatter
  contracts stable; Decap CMS consumes them later
- Components reference semantic design tokens from `src/styles/tokens.css` only
  — never raw hex (brand red is `#8A1626` via `--red-500`)
- `/whatsapp` is deliberately unlisted: no sitemap entry, no footer link, keep
  its `noindex` — do not re-link it anywhere

## Analytics

Two measurement systems, both mounted in `src/app/[locale]/layout.tsx` and both
gated on `analyticsEnabled` from `src/lib/analytics.ts`
(`VERCEL_ENV === "production"`), so `next dev` and preview deploys emit nothing:

- **Google Analytics 4** (`G-343BSR99X0`), via `src/components/GoogleAnalytics.tsx`.
  The measurement ID is committed rather than an env var — gtag ships it in the
  page source, so it is public by design. Google Signals and ad-personalization
  signals are disabled at the tag; do not re-enable them without a deliberate
  decision. Google treats health as a sensitive interest category and bars
  advertiser-curated audiences for it.
- **Vercel Web Analytics**, via `<Analytics />` from `@vercel/analytics/next`.
  Cookieless. This is the source the Impact page quotes.

Do not add a third analytics package or a second GA property. Keep condition and
symptom names out of URLs and page titles — gtag sends page path and title as
event parameters.

**Open gap:** GA4 sets cookies and there is no consent banner. Google Consent Mode
is required before driving UK or EU traffic to the site.
