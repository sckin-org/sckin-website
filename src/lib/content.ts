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
  };
  stats?: Array<{ figure: string; caption: string }>;
  statement?: string;
  tools?: Array<{
    name: string;
    description: string;
    status?: string;
    cta?: Cta;
  }>;
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
  mission?: string;
  vision?: string;
  hypothesis?: string;
  use_cases?: Array<{ title: string; description: string }>;
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

export interface SicklecellpediaFrontmatter extends FrontmatterBase {
  intro?: string;
  voiceflow?: {
    project_id?: string;
    embed_url?: string;
  };
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
}

export interface SicklecellpediaProFrontmatter extends FrontmatterBase {
  intro?: string;
  status?: string;
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

/* -------------------------------------------------------------------------- */
/* Loader                                                                     */
/* -------------------------------------------------------------------------- */

function render(body: string): string {
  return marked.parse(body, { async: false }) as string;
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
