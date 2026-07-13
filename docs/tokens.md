# Design Tokens

SCKIN's visual system is driven by **CSS custom properties**. This is the
contract between the codebase and the incoming Claude Design handoff.

## How tokens are wired (read this before adding styles)

- **Framework:** Tailwind CSS **v4** (CSS-first — there is **no**
  `tailwind.config.js` and **no** `@tailwind base/components/utilities`
  directives). Tailwind is pulled in with a single `@import "tailwindcss";` at
  the top of `src/app/globals.css`.
- The **raw token values live in a plain `:root` block** in
  `src/app/globals.css`, so they are emitted verbatim as CSS custom properties.
  Consume them anywhere with `var(--token)`:

  ```css
  .cta {
    background: var(--color-primary);
    border-radius: var(--radius);
  }
  ```

- A `@theme inline { ... }` block maps those same tokens onto Tailwind's utility
  layer **without** re-emitting duplicate variables. That gives you utilities:

  | Token             | Utilities                              |
  | ----------------- | -------------------------------------- |
  | `--color-primary` | `bg-primary`, `text-primary`, `border-primary` |
  | `--color-ink`     | `text-ink`, `bg-ink`                   |
  | `--color-bg`      | `bg-bg`                                |
  | `--color-surface` | `bg-surface`                           |
  | `--color-muted`   | `text-muted`, `bg-muted`               |
  | `--radius`        | `rounded-token` — or use `var(--radius)` directly |

> Radius note: Tailwind v4's built-in `rounded` utility is hardcoded to
> `0.25rem` and is **not** driven by our token. Use `rounded-token`
> (= `var(--radius)` = 12px) or `border-radius: var(--radius)` /
> `rounded-[var(--radius)]`. Do not assume bare `rounded` picks up the token.

> If the design bundle assumes Tailwind v3 (a `tailwind.config` file, `@tailwind`
> directives, `theme.extend.colors`), port it to the v4 CSS-first form above.
> Define new tokens in `:root`, then expose them via `@theme inline`.

## Tokens

```css
--color-primary: #c41e3a;  /* SCKIN red */
--color-ink:     #16161a;
--color-bg:      #ffffff;
--color-surface: #fafaf8;
--color-muted:   #5c5c56;
--radius:        12px;
```

## Type & spacing intent

- **Typeface:** humanist sans (Inter or similar). The stack currently falls back
  to system sans via `--font-sans`; swap in the concrete family during the
  design handoff.
- **Headings:** large, tight tracking.
- **Body:** 16–18px, line-height ~1.6.
- **Tap targets:** ≥ 44px.

## Direction

A blend of **apple.com** and **redcross.org**: Apple's whitespace, large
restrained type, and one-idea-per-screen pacing; Red Cross's mission-red trust
and unambiguous calls to action.
