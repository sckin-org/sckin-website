# SCKIN Website — Requirements & Remaining Steps

> Living document. Status values: ☐ Not started · ◐ In progress · ✅ Done
> Each step gets its own "Requirements" section below as we reach it.

## Remaining steps, in order

1. ✅ Connect Vercel to the GitHub repo — deploys `main` to a *.vercel.app staging URL on every push, plus automatic preview URLs for every PR. (~15 min)
2. ☐ Paste remaining page content into `content/*.md` — Mission, About, SickleCellPedia, Pro, Responsible AI, Publications, Donate. Home is done.
3. ☐ Collect images → `public/images/` with alt text.
4. ☐ Design in Claude Design — Home first, plus Publications entries and News cards/filters so the component set is complete. Export the handoff bundle.
5. ☐ Claude Code builds the components from the handoff bundle and wires them to the content files.
6. ☐ Integrations — Voiceflow embed, Pro lead-capture form (Next.js API route), Stripe donations, embed/licensing form link.
7. ☐ News filters + taxonomy — needs fixed topic and geography lists.
8. ☐ QA — design-review skill against the staging URL, accessibility (WCAG AA — #C41E3A red needs contrast checks against light backgrounds), mobile, performance.
9. ☐ Domain cutover — lower TTL a few days ahead, point sckin.org DNS at Vercel, keep Squarespace live until it resolves. Vercel provisions SSL automatically once DNS verifies.
10. ☐ Post-launch — Decap CMS at /admin for the team (needs a GitHub OAuth app + one-file OAuth handler API route), news auto-repost to FB/LinkedIn, registrar move to Cloudflare, then the MCP server on AWS.

**Guardrail:** keep everything vanilla Next.js — no Vercel-proprietary storage, cron, or middleware — so the hosting decision stays a two-way door.

---

## Step 1 — Requirements: Connect Vercel to the GitHub repo

**Prerequisites**
- [x] Repo lives in the `sckin-org` GitHub organization and `npm run build` passes locally with no errors.
- [x] Vercel account created — sign up with GitHub using zacharie.liman.tinguiri@sckin.org's GitHub identity so org access carries over.
- [x] Plan decision: Hobby tier is personal/non-commercial only; SCKIN needs Pro ($20/mo, one deployer seat). SCKIN team on Pro.

**Connection steps**
- [x] In the Vercel dashboard: Add New → Project → Import Git Repository.
- [x] Authorize the Vercel GitHub App on `sckin-org` — grant access to this repo only (least privilege), not all org repos.
- [x] Confirm Vercel auto-detects the framework preset as Next.js; accept default build command (`next build`) and output settings.
- [x] Environment variables: skipped as planned — none required yet (Kit and Stripe keys come in Step 6).
- [x] Deploy and confirm the production URL (https://<project>.vercel.app) renders the Home page.

**Verification**
- [x] Push a trivial commit to `main` → confirm auto-deploy triggers and completes.
- [x] Open a test PR → confirm Vercel posts a preview URL on the PR, then close it.
- [x] Do NOT attach the sckin.org custom domain yet — that is Step 9.

**Done when:** every push to `main` auto-deploys to the staging URL and PRs generate preview links.

**Status log**
- 2026-07-14 — Deployed to Vercel (team: SCKIN, project: sckin-website, plan: Pro). Staging URL live, content rendering unstyled as expected pre-design. Vercel plugin installed in Claude Code.
