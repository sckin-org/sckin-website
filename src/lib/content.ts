import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Content loader for SCKIN.
 *
 * Every page is a Markdown file in `content/` with YAML frontmatter:
 * structured fields go in the frontmatter, prose goes in the body. This module
 * reads those files, parses the frontmatter, and renders the body to HTML.
 *
 * Frontmatter shapes below are the contract between the Markdown files and the
 * page components. When you add a field to a `content/*.md` file, add it here.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

/* -------------------------------------------------------------------------- */
/* Shared / primitive shapes                                                  */
/* -------------------------------------------------------------------------- */

export interface Cta {
  label: string;
  href: string;
}

interface FrontmatterBase {
  title: string;
  nav_label?: string;
  meta_description?: string;
}

/** A parsed content file: typed frontmatter + raw body + rendered HTML. */
export interface Doc<T extends FrontmatterBase> {
  slug: string;
  frontmatter: T;
  body: string;
  html: string;
}

/* -------------------------------------------------------------------------- */
/* Page-specific frontmatter shapes                                           */
/* -------------------------------------------------------------------------- */

export interface HomeFrontmatter extends FrontmatterBase {
  hero: {
    headline: string;
    subhead: string;
    image?: string;
    cta?: Cta;
    secondary_cta?: Cta;
  };
  stats?: Array<{ figure: string; caption: string }>;
  statement?: string;
  hypothesis?: { heading: string; body: string };
  tools?: {
    heading: string;
    intro?: string;
    items: Array<{
      name: string;
      description: string;
      /** Status badge, e.g. "In development — expected Q4 2026". */
      status?: string;
      cta?: Cta;
      /** WhatsApp deep link (rendered new-tab) — SickleCellPedia only. */
      whatsapp?: Cta;
      /** WhatsApp QR code — SickleCellPedia only. */
      qr?: { src: string; alt: string };
      image?: string;
    }>;
  };
  get_involved?: {
    heading: string;
    ctas: Array<Cta & { external?: boolean }>;
  };
  signup?: {
    heading: string;
    subtext?: string;
    field_label: string;
    submit_label: string;
    confirmation?: string;
  };
}

export interface Testimonial {
  quote: string;
  name: string;
  role?: string;
  institution?: string;
  country?: string;
  image?: string;
}

export interface ImpactFrontmatter extends FrontmatterBase {
  hero: {
    headline: string;
    subhead: string;
  };
  stats?: Array<{ figure: string; caption: string }>;
  testimonials_community?: Testimonial[];
  testimonials_clinical?: Testimonial[];
}

export interface MissionFrontmatter extends FrontmatterBase {
  vision?: string;
  mission?: string;
  hypothesis?: string;
  /** "What this looks like in practice" — narrative scenarios. */
  practice?: {
    heading: string;
    intro?: string;
    cases: Array<{ title: string; description: string }>;
    note?: string;
  };
  /** Closing statement + calls to action. */
  closing?: {
    statement: string;
    ctas?: Cta[];
  };
}

export interface AboutSection {
  id: string;
  heading: string;
  body?: string;
  members?: Array<{ name: string; role?: string; bio?: string }>;
  items?: Array<{ name: string; url?: string; note?: string }>;
}

export interface AboutFrontmatter extends FrontmatterBase {
  sections: AboutSection[];
}

/**
 * One way to reach SickleCellPedia (web / WhatsApp / Messenger). `body` is
 * Markdown so the copy can carry its links inline — see renderAccessBody.
 */
export interface AccessChannel {
  id: string;
  heading: string;
  body: string;
  image?: string;
  image_alt?: string;
}

export interface SicklecellpediaFrontmatter extends FrontmatterBase {
  intro?: string;
  /** Heading over the non-web channels ("Other ways to reach SickleCellPedia"). */
  access_heading?: string;
  access?: AccessChannel[];
  /** Bilingual note — SickleCellPedia (English) / DrepanoPedia (French). */
  note?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  /** Optional link rendered after the label (e.g. consent → Privacy Policy). */
  link?: { label: string; href: string };
}

export interface SicklecellpediaProFrontmatter extends FrontmatterBase {
  /** One-line value prop for HCPs — empty until supplied (TODO in content). */
  tagline?: string;
  intro?: string;
  status?: string;
  features?: Array<{ name: string; description: string }>;
  /** "Register your interest" — rendered at the #register anchor. */
  register?: {
    heading: string;
    subtext?: string;
  };
  form?: {
    submit_label?: string;
    confirmation?: string;
    fields: FormField[];
  };
}

export interface ContactFrontmatter extends FrontmatterBase {
  hero: {
    headline: string;
    subhead: string;
  };
  /** Deflection block, rendered above the form: steers disease questions to
   * the chatbot rather than the inbox. */
  deflect?: {
    heading: string;
    body: string;
    cta: Cta;
  };
  form: {
    heading?: string;
    submit_label?: string;
    confirmation?: string;
    fields: FormField[];
  };
  schedule?: {
    heading: string;
    body: string;
    cta: Cta;
  };
  direct?: {
    email?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface ResponsibleAiFrontmatter extends FrontmatterBase {
  sections: AboutSection[];
}

export interface PublicationsFrontmatter extends FrontmatterBase {
  publications?: Array<{
    title: string;
    authors?: string;
    venue?: string;
    year?: number;
    url?: string;
  }>;
}

export interface NewsFrontmatter extends FrontmatterBase {
  date: string;
  summary: string;
  source_url?: string;
  topics: string[];
  geographies: string[];
  image?: string;
}

/**
 * Legal policies (Privacy Policy, User Agreement) live in `content/legal/` so
 * a CMS collection can later be pointed at just that folder. Fields are
 * camelCase (unlike the snake_case page frontmatter) because they are the
 * contract for that planned Decap collection — keep them stable.
 */
export interface LegalFrontmatter extends FrontmatterBase {
  subtitle: string;
  /** ISO date (`YYYY-MM-DD`), rendered as "December 2, 2025". */
  lastUpdated: string;
}

/* -------------------------------------------------------------------------- */
/* Loader                                                                     */
/* -------------------------------------------------------------------------- */

function render(body: string): string {
  return marked.parse(body, { async: false }) as string;
}

/**
 * Render a single frontmatter string as *inline* Markdown — links and emphasis,
 * no wrapping <p>. Used for the SickleCellPedia access channels, whose copy
 * carries its links mid-sentence ("Start a chat at wa.me/...").
 *
 * Links to other sites open in a new tab so a visitor mid-question does not
 * lose the page. Scoped to these short strings on purpose: page bodies keep the
 * default same-tab behaviour.
 */
export function renderAccessBody(md: string): string {
  const html = marked.parseInline(md, { async: false }) as string;
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );
}

/**
 * Resolve the on-disk Markdown file for a page slug in a given locale.
 *
 * Today every page ships English-only at `content/<slug>.md`, so the `locale`
 * argument is accepted but does not yet change the path. This is deliberate:
 * callers and pages can thread a locale through now, and when the first
 * non-English content lands, this is the single place that grows a
 * `content/<slug>.<locale>.md` lookup with fallback to the English file —
 * nothing else has to change. (Fallback intentionally not built yet.)
 */
function resolveContentPath(slug: string, _locale?: string): string {
  return path.join(CONTENT_DIR, `${slug}.md`);
}

/**
 * Load a single top-level page, e.g. getDoc("home") reads content/home.md.
 * The caller supplies the expected frontmatter type. An optional `locale` is
 * accepted for forward-compatibility (see resolveContentPath).
 */
export function getDoc<T extends FrontmatterBase>(
  slug: string,
  locale?: string
): Doc<T> {
  const filePath = resolveContentPath(slug, locale);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as T,
    body: content,
    html: render(content),
  };
}

/* Convenience typed accessors for each page. */
export const getHome = () => getDoc<HomeFrontmatter>("home");
export const getImpact = () => getDoc<ImpactFrontmatter>("impact");
export const getMission = () => getDoc<MissionFrontmatter>("mission");
export const getAbout = () => getDoc<AboutFrontmatter>("about");
export const getSicklecellpedia = () =>
  getDoc<SicklecellpediaFrontmatter>("sicklecellpedia");
export const getSicklecellpediaPro = () =>
  getDoc<SicklecellpediaProFrontmatter>("sicklecellpedia-pro");
export const getContact = () => getDoc<ContactFrontmatter>("contact");
export const getResponsibleAi = () =>
  getDoc<ResponsibleAiFrontmatter>("responsible-ai");
export const getPublications = () =>
  getDoc<PublicationsFrontmatter>("publications");
export const getPrivacy = () => getDoc<LegalFrontmatter>("legal/privacy");
export const getTerms = () => getDoc<LegalFrontmatter>("legal/terms");

/* -------------------------------------------------------------------------- */
/* News collection                                                            */
/* -------------------------------------------------------------------------- */

const NEWS_DIR = path.join(CONTENT_DIR, "news");

/** All news posts, newest first. Ignores non-Markdown files (e.g. .gitkeep). */
export function getAllNews(): Doc<NewsFrontmatter>[] {
  if (!fs.existsSync(NEWS_DIR)) return [];
  return fs
    .readdirSync(NEWS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(NEWS_DIR, f), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        frontmatter: data as NewsFrontmatter,
        body: content,
        html: render(content),
      };
    })
    .sort((a, b) =>
      (b.frontmatter.date ?? "").localeCompare(a.frontmatter.date ?? "")
    );
}

/** Sorted, de-duplicated facet values across all news posts. */
export function getNewsFacets(): { topics: string[]; geographies: string[] } {
  const topics = new Set<string>();
  const geographies = new Set<string>();
  for (const post of getAllNews()) {
    post.frontmatter.topics?.forEach((t) => topics.add(t));
    post.frontmatter.geographies?.forEach((g) => geographies.add(g));
  }
  return {
    topics: [...topics].sort(),
    geographies: [...geographies].sort(),
  };
}
