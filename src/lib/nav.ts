/**
 * Site navigation model.
 *
 * Logo links to Home. Items with `children` are dropdown menus (About ▾,
 * Responsible AI ▾). The Donate CTA is rendered separately on the right.
 * Kept as data so the design handoff can restyle without touching structure.
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
  { label: "News", href: "/news" },
  {
    label: "Responsible AI",
    href: "/responsible-ai",
    children: [
      { label: "Overview", href: "/responsible-ai" },
      {
        label: "Human-in-the-Loop Surveys",
        href: "/responsible-ai#human-in-the-loop",
      },
    ],
  },
  {
    label: "Impact",
    href: "/impact",
    children: [
      { label: "Overview", href: "/impact" },
      { label: "Publications", href: "/impact/publications" },
    ],
  },
];

export const DONATE_CTA: NavChild = { label: "Donate", href: "/donate" };
