# Design Spec

> **Status: awaiting handoff.** The visual design is being produced separately
> by Claude Design and will be delivered as a handoff bundle. This file is the
> landing spot for that spec. Until then, the site ships with intentionally
> **unstyled placeholder** components so every route resolves and renders its
> content.

## Direction

A blend of **apple.com** and **redcross.org**:

- **From Apple:** generous whitespace, large but restrained typography, one idea
  per screen, calm pacing.
- **From Red Cross:** mission-red trust, unambiguous calls to action, clarity
  over cleverness.

## What is already in place (scaffold)

- Design tokens as CSS custom properties — see [tokens.md](./tokens.md).
- Structural, unstyled components:
  - `src/components/SiteHeader.tsx` — logo, nav (with `About ▾` and
    `Responsible AI ▾` dropdowns), Donate CTA. Nav model in `src/lib/nav.ts`.
  - `src/components/SiteFooter.tsx`
  - `src/components/NewsBrowser.tsx` — topic + geography filter.
- Page components render structured frontmatter from `content/*.md`. They use
  `data-*` attributes (`data-page`, `data-section`, `data-role`, `data-embed`)
  as stable styling hooks for the design handoff.

## When the handoff arrives

1. Drop the concrete typeface into `--font-sans` in `globals.css`.
2. Restyle components against the `data-*` hooks and Tailwind token utilities.
3. Keep the content model and route structure unchanged unless coordinated.
