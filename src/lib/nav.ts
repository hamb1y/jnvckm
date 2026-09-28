import { site } from "@/data/site";
import type { UIKey } from "@/i18n/ui";

/**
 * Every page the header and footer can link to. Which ones appear, and in what
 * order, is set in the CMS (Site settings → Navigation). Paths are locale-free;
 * `localePath()` prefixes the non-default locale.
 */
export const PAGES = {
  home: { key: "nav.home", path: "/" },
  about: { key: "nav.about", path: "/about" },
  programs: { key: "nav.programs", path: "/programs" },
  contributions: { key: "nav.impact", path: "/contributions" },
  events: { key: "nav.events", path: "/events" },
  stories: { key: "nav.stories", path: "/stories" },
  connect: { key: "nav.connect", path: "/connect" },
  vidyalaya: { key: "nav.vidyalaya", path: "/vidyalaya" },
} satisfies Record<string, { key: UIKey; path: string }>;

export interface NavItem {
  key: UIKey;
  path: string;
}

function items(ids: string[]): NavItem[] {
  return ids.filter((id): id is keyof typeof PAGES => id in PAGES).map((id) => PAGES[id]);
}

export const NAV: NavItem[] = items(site.nav.header);
export const FOOTER_NAV: NavItem[] = items(site.nav.footer);

/** Nested routes such as /events/ncl-5 keep their section marked. */
export function isActive(item: NavItem, pathname: string): boolean {
  if (item.path === "/") return pathname === "/" || pathname === "";
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
