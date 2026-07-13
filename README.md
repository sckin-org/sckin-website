# sckin-website

Source for [sckin.org](https://sckin.org) — the public website of **SCKIN**
(Sickle Cell Knowledge and Information Network), a 501(c)(3) nonprofit making
information about sickle cell disease universally accessible.

## Stack

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS v4**, driven by CSS custom properties — see
  [`docs/tokens.md`](docs/tokens.md)
- **Content:** Markdown + YAML frontmatter in [`content/`](content/)
- **Hosting:** AWS Amplify — auto-deploys on push to `main` (see
  [`amplify.yml`](amplify.yml))

> **Design status:** the visual design ships separately as a Claude Design
> handoff. Components are currently unstyled placeholders. See
> [`docs/design-spec.md`](docs/design-spec.md).

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Requires **Node 20**.

## Content workflow

**All page copy lives in Markdown, not in code.** To change what the site says,
edit a file under `content/` and push — Amplify rebuilds and redeploys `main`
automatically.

```
edit content/*.md  →  git push origin main  →  Amplify rebuilds  →  live
```

### How content maps to pages

| File                              | Page / route           |
| --------------------------------- | ---------------------- |
| `content/home.md`                 | `/`                    |
| `content/mission.md`              | `/mission`             |
| `content/about.md`                | `/about`               |
| `content/sicklecellpedia.md`      | `/sicklecellpedia`     |
| `content/sicklecellpedia-pro.md`  | `/sicklecellpedia-pro` |
| `content/responsible-ai.md`       | `/responsible-ai`      |
| `content/publications.md`         | `/publications`        |
| `content/news/*.md`               | `/news` (one file per post) |

Each file has **structured fields in YAML frontmatter** (the part between the
`---` fences) and **prose in the body** below. Keep the frontmatter field names
as they are — they are typed in [`src/lib/content.ts`](src/lib/content.ts) and
consumed by the page components. Placeholder values are marked `[PLACEHOLDER]`.

Routes `/donate`, `/whatsapp`, and `/feedback` are not content-driven — their
copy lives in the page components under `src/app/`.

### Adding a news post

Create `content/news/<slug>.md` with this frontmatter:

```markdown
---
title: "Headline"
date: "2026-06-01"        # YYYY-MM-DD; controls sort order (newest first)
summary: "One-sentence summary."
source_url: "https://…"    # link to the original coverage
topics: ["Newborn screening", "Policy"]
geographies: ["Nigeria", "Global South"]
image: "my-post.jpg"       # optional; lives in public/images/
---

Body prose (optional).
```

`topics` and `geographies` automatically populate the filters on `/news`.
There is a `content/news/example-post.md` you can copy or delete.

## Project layout

```
content/            Markdown page + news content (edit this to change copy)
docs/               requirements, design spec, design tokens
public/images/      images referenced from content
src/app/            routes (App Router)
src/components/     shared components (header, footer, news browser)
src/lib/content.ts  typed Markdown/frontmatter loader
src/lib/nav.ts      navigation model
amplify.yml         AWS Amplify build spec (Node 20, Next.js SSR)
```

## Deployment

Pushing to `main` triggers an AWS Amplify build using [`amplify.yml`](amplify.yml)
(Node 20, `npm ci && npm run build`, artifacts from `.next`). The domain cutover
to `sckin.org` (currently on GoDaddy) happens after launch.
