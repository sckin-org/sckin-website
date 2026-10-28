import type { MetadataRoute } from "next";
import { getAllEvents, getAllFriends } from "@/lib/content";

/**
 * /sitemap.xml — the public, linked pages plus /evaluations. Served outside
 * the [locale] tree: the middleware skips paths with a file extension.
 *
 * Deliberately left out:
 *   /whatsapp        — must stay unlisted (noindex; see CLAUDE.md)
 *   /ascat, /scdaa   — conference QR landing pages, kept out by design
 *   /feedback        — not yet migrated
 *   /donate/success  — post-checkout page
 * There is no robots.ts on purpose: a Disallow would advertise /whatsapp.
 */

const SITE_URL = "https://sckin.org";

const STATIC_PATHS = [
  "/",
  "/mission",
  "/about",
  "/sicklecellpedia",
  "/sicklecellpedia-pro",
  "/responsible-ai",
  "/impact",
  "/publications",
  "/news",
  "/news/blog",
  "/events",
  "/resources",
  "/resources/books",
  "/donate",
  "/contact",
  "/evaluations",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...getAllEvents().map((event) => `/events/${event.slug}`),
    ...getAllFriends().map((friend) => `/friends/${friend.slug}`),
  ];
  return paths.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
  }));
}
