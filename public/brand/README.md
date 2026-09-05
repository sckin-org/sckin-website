# SCKIN brand assets

The SCKIN icon: a disc with five rounded bars (blue · yellow · green · yellow ·
red). Source: the Claude Design export "Website icon redesign" (2026-09-04),
cleaned to standalone, scalable SVGs (no fixed size, no editor metadata,
4-unit padding on a 108×108 viewBox).

| File | What it is | Use it for |
|---|---|---|
| `icon.svg` | **Master.** Dark disc (`#17150F`), bright bars. | The default icon anywhere: light or mid backgrounds, print, decks, social avatars. Source of every raster below. |
| `icon-light.svg` | Light disc (`#FAF8F5`), deeper bars. | Dark backgrounds, and the browser-tab favicon (a dark disc has no edge on dark tab bars). |
| `icon-512.png` · `icon-192.png` | Master at 512 / 192 px, transparent outside the disc. | Web manifest (home-screen / install icons), places that need a PNG. |
| `icon-32.png` | Master at 32 px. | Small inline uses where an SVG is not possible. |
| `../apple-touch-icon.png` | Master at 180 px on its own dark background, full-bleed. | iOS / iPadOS home-screen bookmark (iOS fills transparency with black, hence the solid square). |
| `../favicon.ico` | `icon-light.svg` at 16 / 32 / 48 px. | Browser tabs and bookmarks in browsers that ignore SVG favicons. |
| `../site.webmanifest` | Web app manifest pointing at `icon-192.png` and `icon-512.png`. | Linked from every page's `<head>`. |

There is no monochrome variant yet. The wordmark and any text logo are a
separate task; the header still uses the "SCKIN" text wordmark.

**All rasters are generated from `icon.svg` / `icon-light.svg`. Regenerate
them from the SVGs (svgo + sharp + png-to-ico, see the 2026-09-04 History entry
in `sckin-website-requirements.md`) rather than hand-editing a PNG.**
