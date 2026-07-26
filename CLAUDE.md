# SCKIN Website

Next.js (App Router) site for SCKIN, a 501(c)(3) sickle-cell nonprofit. Hosted on
Vercel (team SCKIN, project sckin-website); merges to `main` auto-deploy to the
production `.vercel.app` URL, which serves as staging until the sckin.org domain
cutover.

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
- Domain/DNS changes (the sckin.org cutover), registrar moves
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
