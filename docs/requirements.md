# Requirements

The public website for **SCKIN (Sickle Cell Knowledge and Information Network)**,
a 501(c)(3) nonprofit making information about sickle cell disease universally
accessible. Migrating off Squarespace.

## Stack (locked)

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS v4, driven by CSS custom properties (see
  [tokens.md](./tokens.md))
- **Hosting:** AWS Amplify (auto-deploy on push to `main`)
- **Repo:** GitHub, `sckin-org/sckin-website`
- **Content:** Markdown files with YAML frontmatter in `content/`
- **Domain (later):** sckin.org — currently on GoDaddy, DNS cutover after launch

## Routes

| Route                  | Page                                                        |
| ---------------------- | ----------------------------------------------------------- |
| `/`                    | Home                                                        |
| `/mission`             | Mission (Mission, Vision, Hypothesis, Use cases)            |
| `/about`               | About — anchors: SCKIN, Board, Founder, Collaborators, Friends |
| `/sicklecellpedia`     | SickleCellPedia (Voiceflow chat embed)                      |
| `/sicklecellpedia-pro` | SickleCellPedia Pro (lead-capture form)                     |
| `/responsible-ai`      | Responsible AI — anchor: Human-in-the-Loop Surveys          |
| `/publications`        | Publications                                                |
| `/news`                | Sickle Cell News — filterable by topic + geography          |
| `/donate`              | Donations (custom Stripe checkout)                          |
| `/whatsapp`            | Utility route (preserved)                                   |
| `/feedback`            | Utility route (preserved)                                   |

## Navigation

- Logo → Home.
- Items: Mission, About ▾, SickleCellPedia, SickleCellPedia Pro,
  Responsible AI ▾, Publications, News.
- Right-side CTA: **Donate**.
- Site search is **out of scope** (phase 2).

## Content model

Every page is a Markdown file in `content/` with structured fields in YAML
frontmatter and prose in the body. See [../README.md](../README.md) for the
editing workflow and `src/lib/content.ts` for the typed shapes.

News posts (`content/news/*.md`) frontmatter: `title`, `date`, `summary`,
`source_url`, `topics: []`, `geographies: []`, `image`.
