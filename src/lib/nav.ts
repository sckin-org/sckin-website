/**
 * Site navigation model — the locked 2026-07-22 set (design annex, Navigation):
 *   About us ▾ · SickleCellPedia · For Clinicians · Responsible AI ·
 *   Impact ▾ (Impact · Publications) · News ▾ (Latest News · Blog) · [Donate]
 *
 * Logo links to Home (Home is not a nav item). "For Clinicians" is the nav
 * label for SickleCellPedia Pro — the full product name lives on the page.
 * The Donate CTA renders separately on the right, after the reserved
 * language-toggle slot. Contact and /feedback are deliberately out of the nav.
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

/**
 * The Impact ▾ item goes live only once /impact carries real numbers
 * (requirements checklist, 2026-07-22). While gated, /publications stays
 * reachable from the footer's Explore group.
 */
export const IMPACT_NAV_LIVE = false;

const IMPACT_ITEM: NavItem = {
  label: "Impact",
  href: "/impact",
  children: [
    { label: "Impact", href: "/impact" },
    { label: "Publications", href: "/publications" },
  ],
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "About us",
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
  { label: "For Clinicians", href: "/sicklecellpedia-pro" },
  { label: "Responsible AI", href: "/responsible-ai" },
  ...(IMPACT_NAV_LIVE ? [IMPACT_ITEM] : []),
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
