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

/** Home — the locked 2026-07-22 design: Hero → Mission → Products → Impact
 * band → News → Donate band. The newsletter signup lives in the footer. */
export interface HomeFrontmatter extends FrontmatterBase {
  hero: {
    overline: string;
    headline: string;
    /** Second headline line, rendered in brand red. */
    headline_accent: string;
    subhead: string;
    cta: Cta;
    secondary_cta: Cta;
  };
  mission: {
    eyebrow: string;
    /** Verbatim mission statement — must match /mission. */
    statement: string;
    body: string;
    /** One-line hypothesis distillation (full text lives on /mission). */
    hypothesis: string;
    pillars: Array<{ title: string; body: string }>;
    cta: Cta;
  };
  products: {
    eyebrow: string;
    items: Array<{
      name: string;
      /** Status pill, e.g. "In development" — Pro only. */
      tag?: string;
      description: string;
      cta: Cta;
    }>;
  };
  impact: {
    eyebrow: string;
    stats: Array<{ figure: string; caption: string }>;
    goal: { tag: string; figure: string; caption: string };
    source: string;
  };
  news: {
    eyebrow: string;
    name: string;
    intro: string;
    badge?: string;
    items: Array<{ date: string; headline: string }>;
    all: Cta;
  };
  donate: {
    headline: string;
    body: string;
    closing: string;
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

/** A sub-block inside an anchor section (e.g. Our vision / Our mission). */
export interface AboutSubsection {
  heading: string;
  /** Markdown — rendered via renderSectionBody. */
  body?: string;
}

export interface BoardMember {
  name: string;
  role?: string;
  linkedin?: string;
  /** Path under public/, e.g. /images/team/team-….jpg. May not exist yet —
   * pages fall back to an initials placeholder (see publicFileExists). */
  photo?: string;
  /** Markdown. Absent = intentionally blank — render nothing, no placeholder. */
  bio?: string;
  /** Extra external links (e.g. Google Scholar), rendered after LinkedIn. */
  links?: Cta[];
  /** Renders instead of a bio; points the card at the Our Founder section. */
  founder_link?: Cta;
}

export interface Collaborator {
  name: string;
  url?: string;
  /** Path under public/images/logos/ — may not exist yet (name-only fallback). */
  logo?: string;
  /** Markdown; RED carries FR then EN "(Translated by AI)" paragraphs. */
  description?: string;
  status?: string;
  collaboration?: string;
}

export interface AboutSection {
  id: string;
  heading: string;
  /** Markdown — rendered via renderSectionBody. */
  body?: string;
  subsections?: AboutSubsection[];
  members?: BoardMember[];
  collaborators?: Collaborator[];
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

/** One entry: Title · Authors/Presenter · Venue · Date · Link (+ optionals). */
export interface PublicationEntry {
  title: string;
  people?: string;
  venue?: string;
  date?: string;
  description?: string;
  /** e.g. "Accepted as Oral (forthcoming)". */
  status?: string;
  /** External link — rendered new-tab. */
  link?: Cta;
  /** Optional thumbnail under public/ — may not exist yet (skipped if so). */
  image?: string;
  image_alt?: string;
}

export interface PublicationsFrontmatter extends FrontmatterBase {
  intro?: string;
  /** Four sections: Presentations · Publications · Abstracts · Other Contributions. */
  sections?: Array<{
    id: string;
    heading: string;
    /** Markdown note under the heading (e.g. the Globinoscope source line). */
    note?: string;
    entries: PublicationEntry[];
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

/** /news landing copy (content/news.md — sits beside the content/news/ posts). */
export interface NewsLandingFrontmatter extends FrontmatterBase {
  /** "In development — expected September 2026" badge. */
  status?: string;
  intro?: string;
  /** Teaser linking the Blog subpage. */
  blog?: { heading: string; body?: string; cta: Cta };
  /** Empty-state line when no posts exist yet. */
  empty?: string;
}

/** /news/blog landing copy (content/blog.md). */
export interface BlogLandingFrontmatter extends FrontmatterBase {
  intro?: string;
  empty?: string;
}

/**
 * A Blog post (content/blog/*.md) — SCKIN's own voice, authored later in the
 * /admin CMS. Entry format per master doc v3.1: title · author · date · body ·
 * optional image · optional tag (Announcement / Product / Impact).
 */
export interface BlogPostFrontmatter extends FrontmatterBase {
  date: string;
  author?: string;
  summary?: string;
  tag?: string;
  /** Featured image — path under public/, e.g. /images/blog/….png. Skipped at
   * render time if the file is missing (see publicFileExists). */
  image?: string;
  image_alt?: string;
  /** Where the featured image links (e.g. the full flyer PDF) — new tab. */
  image_href?: string;
  /** Primary call to action (e.g. "Register on Zoom") — pill button, new tab. */
  cta?: Cta;
  /** Secondary links beside the CTA (e.g. "Download the flyer (PDF)") — new tab. */
  links?: Cta[];
}

export type EventFormat = "online" | "in-person" | "hybrid";

/**
 * A community event (content/events/*.md) — third-party webinars, symposia,
 * awareness days and patient-association meetings relayed by SCKIN (News ▾ →
 * Events, added 2026-09-04). Attributed to the organizer and `sourceNote`,
 * never to a SCKIN author: no author/tag fields by design. Slug = filename,
 * as for news/blog. Fields are camelCase like the legal collection — they are
 * the contract for a future CMS collection, keep them stable.
 */
export interface EventFrontmatter extends FrontmatterBase {
  summary: string;
  /** ISO 8601 with UTC offset, e.g. 2026-09-24T10:00:00-05:00. The wall-clock
   * part is what visitors see; the offset makes upcoming/past and .ics exact. */
  eventStart: string;
  eventEnd: string;
  /** Human label shown after the time, e.g. "Central Time". */
  timeZone: string;
  format: EventFormat;
  location?: string;
  /** e.g. "Zoom". */
  platform?: string;
  organizer: string;
  speakers?: string[];
  /** e.g. "Free". */
  cost?: string;
  /** Rendered as the Register button (new tab) until the event is past. */
  registrationUrl?: string;
  /** Paths under public/: the flyer PDF (documents/) and its page-1 image
   * (images/events/). Image is skipped at render time if the file is missing. */
  flyerPdf?: string;
  flyerImage?: string;
  flyerImageAlt?: string;
  /** Who shared it with SCKIN, e.g. "Shared with SCKIN by board member …". */
  sourceNote?: string;
  /** ISO date (YYYY-MM-DD) the listing went up; also the .ics DTSTAMP. */
  publishedAt: string;
}

/** /events landing copy + every UI label the Events pages render
 * (content/events.md — a content/events.<locale>.md localizes the section). */
export interface EventsLandingFrontmatter extends FrontmatterBase {
  intro?: string;
  /** "A listing here does not mean SCKIN organizes or endorses the event." */
  disclaimer: string;
  upcoming_heading: string;
  past_heading: string;
  /** Empty-state line when nothing is upcoming. */
  empty: string;
  labels: {
    register: string;
    flyer: string;
    calendar: string;
    past: string;
    details: string;
    back: string;
    when: string;
    where: string;
    format: string;
    organizer: string;
    speakers: string;
    cost: string;
  };
  formats: Record<EventFormat, string>;
}

export interface FriendSection {
  heading: string;
  /** Markdown — rendered via renderSectionBody. */
  body: string;
}

export interface FriendVideo {
  /** YouTube video id (works for unlisted videos). */
  youtube_id: string;
  caption: string;
  /** Duration / language line, e.g. "3 min 10 s · in Hausa with English subtitles". */
  note?: string;
}

export interface FriendContact {
  label: string;
  /** Published with the owner's permission; rendered obfuscated. */
  email: string;
}

/** The translatable part of a friend's story — the `fr` block mirrors it. */
export interface FriendStory {
  /** Full page title, e.g. "Turning the ordeal into commitment: …". */
  title: string;
  role: string;
  organization?: string;
  location: string;
  /** Featured quote (without surrounding quotation marks). */
  quote: string;
  /** Two-sentence card intro; doubles as the page's meta description. */
  intro?: string;
  /** "Read Leyla's story" — the card's link label. */
  story_link_label?: string;
  sections?: FriendSection[];
  videos_heading?: string;
  contact_heading?: string;
  /** Label of the link back to /about#friends. */
  back_label?: string;
}

/**
 * A Friend of SCKIN (content/friends/*.md, added 2026-09-04) — someone in the
 * sickle cell community who uses SCKIN's tools in their own work: a card on
 * /about#friends and a story page at /friends/<slug> (slug = filename).
 */
export interface FriendFrontmatter extends FrontmatterBase, FriendStory {
  name: string;
  /** Exact <title> / og:title, e.g. "Leyla Hamidou, ONG DES — Friends of SCKIN". */
  seo_title?: string;
  /** Path under public/images/friends/ — square, ≥480px. Initials placeholder
   * of the same size until the file exists (see publicFileExists). */
  photo?: string;
  photo_alt?: string;
  /** ISO date (YYYY-MM-DD) the friend was added; newest first on /about. */
  publishedAt: string;
  videos?: FriendVideo[];
  contacts?: FriendContact[];
  /** French version, stored for a future locale — not rendered while the
   * site is English-only. */
  fr?: Partial<FriendStory> & { contacts_line?: string };
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
 * Render a frontmatter Markdown *block* (paragraphs allowed, unlike
 * renderAccessBody's inline mode) with external links opening in a new tab.
 * Used for About/Responsible AI section bodies, board bios, and collaborator
 * descriptions — e.g. the 501(c)(3) → IRS-letter link.
 */
export function renderSectionBody(md: string): string {
  const html = marked.parse(md, { async: false }) as string;
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );
}

/**
 * Does a file exist under public/? Team photos and org logos are referenced by
 * their documented paths before the files land — pages check here at render
 * time (build time for static pages) and fall back to a neutral placeholder,
 * so a missing image never breaks the build. Drop the file in and rebuild:
 * the real image appears with no code change.
 */
export function publicFileExists(publicPath: string): boolean {
  return fs.existsSync(
    path.join(process.cwd(), "public", publicPath.replace(/^\//, ""))
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
export const getNewsLanding = () => getDoc<NewsLandingFrontmatter>("news");
export const getBlogLanding = () => getDoc<BlogLandingFrontmatter>("blog");
export const getEventsLanding = (locale?: string) =>
  getDoc<EventsLandingFrontmatter>("events", locale);
export const getPrivacy = () => getDoc<LegalFrontmatter>("legal/privacy");
export const getTerms = () => getDoc<LegalFrontmatter>("legal/terms");

/* -------------------------------------------------------------------------- */
/* Post collections (News, Blog, Events)                                      */
/* -------------------------------------------------------------------------- */

/**
 * All posts in a content subdirectory, newest first by the date `dateOf`
 * picks from the frontmatter (`date` for news/blog, `eventStart` for events).
 * Ignores non-Markdown files (e.g. .gitkeep); an absent directory is an empty
 * collection, not an error. `locale` is accepted for forward-compatibility
 * exactly as in resolveContentPath: per-locale post files land there first.
 */
function getCollection<T extends FrontmatterBase>(
  dirName: string,
  dateOf: (frontmatter: T) => string | undefined,
  _locale?: string
): Doc<T>[] {
  const dir = path.join(CONTENT_DIR, dirName);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        frontmatter: data as T,
        body: content,
        html: render(content),
      };
    })
    .sort((a, b) =>
      (dateOf(b.frontmatter) ?? "").localeCompare(dateOf(a.frontmatter) ?? "")
    );
}

/** All news posts, newest first. */
export function getAllNews(): Doc<NewsFrontmatter>[] {
  return getCollection<NewsFrontmatter>("news", (fm) => fm.date);
}

/** All SCKIN blog posts, newest first. */
export function getAllBlogPosts(): Doc<BlogPostFrontmatter>[] {
  return getCollection<BlogPostFrontmatter>("blog", (fm) => fm.date);
}

/** All community events, latest start first (pages re-split into upcoming /
 * past — see src/lib/events.ts). */
export function getAllEvents(locale?: string): Doc<EventFrontmatter>[] {
  return getCollection<EventFrontmatter>(
    "events",
    (fm) => fm.eventStart,
    locale
  );
}

/** One event by slug (= filename), or null. Looked up through the collection
 * so a crafted slug can never read outside content/events/. */
export function getEvent(
  slug: string,
  locale?: string
): Doc<EventFrontmatter> | null {
  return getAllEvents(locale).find((event) => event.slug === slug) ?? null;
}

/** All Friends of SCKIN, newest first. */
export function getAllFriends(locale?: string): Doc<FriendFrontmatter>[] {
  return getCollection<FriendFrontmatter>(
    "friends",
    (fm) => fm.publishedAt,
    locale
  );
}

/** One friend by slug (= filename), or null — via the collection, so a
 * crafted slug can never read outside content/friends/. */
export function getFriend(
  slug: string,
  locale?: string
): Doc<FriendFrontmatter> | null {
  return getAllFriends(locale).find((friend) => friend.slug === slug) ?? null;
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
