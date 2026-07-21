/**
 * Site navigation model — the locked v3.1 nav:
 *   Mission · About ▾ · SickleCellPedia · SickleCellPedia Pro ·
 *   Responsible AI ▾ · Publications · News ▾ · [Donate]
 *
 * Logo links to Home (Home is not a nav item). Items with `children` are
 * dropdown menus. The Donate CTA is rendered separately on the right. Impact
 * and Contact are deliberately NOT nav items — the routes stay reachable
 * (contact email lives in the footer). Kept as data so the design handoff can
 * restyle without touching structure.
 */

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Mission", href: "/mission" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "SCKIN", href: "/about#sckin" },
      { label: "Our Board", href: "/about#board" },
      { label: "Our Founder", href: "/about#founder" },
      { label: "Our Collaborators", href: "/about#collaborators" },
      { label: "Friends of SCKIN", href: "/about#friends" },
    ],
  },
  { label: "SickleCellPedia", href: "/sicklecellpedia" },
  { label: "SickleCellPedia Pro", href: "/sicklecellpedia-pro" },
  {
    label: "Responsible AI",
    href: "/responsible-ai",
    children: [
      { label: "Our approach", href: "/responsible-ai#approach" },
      {
        label: "Human-in-the-Loop Surveys",
        href: "/responsible-ai#surveys",
      },
    ],
  },
  { label: "Publications", href: "/publications" },
  {
    label: "News",
    href: "/news",
    children: [
      { label: "Latest News", href: "/news" },
      { label: "Blog", href: "/news/blog" },
    ],
  },
];

export const DONATE_CTA: NavChild = { label: "Donate", href: "/donate" };
