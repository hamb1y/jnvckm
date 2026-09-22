import type { UIKey } from "@/i18n/ui";

/**
 * Navigation is locale-free. `localePath()` prefixes the non-default locale,
 * so these paths are never written with a `/kn` prefix by hand.
 */
export interface NavItem {
  key: UIKey;
  path: string;
  /** Matches nested routes such as /events/ncl-5. */
  match?: (pathname: string) => boolean;
}

export const NAV: NavItem[] = [
  { key: "nav.home", path: "/" },
  { key: "nav.about", path: "/about", match: (p) => p.startsWith("/about") },
  { key: "nav.programs", path: "/programs", match: (p) => p.startsWith("/programs") },
  { key: "nav.impact", path: "/contributions", match: (p) => p.startsWith("/contributions") },
  { key: "nav.events", path: "/events", match: (p) => p.startsWith("/events") },
  { key: "nav.stories", path: "/stories", match: (p) => p.startsWith("/stories") },
  { key: "nav.connect", path: "/connect", match: (p) => p.startsWith("/connect") },
];

/** Linked in the footer and from About, not the primary bar. */
export const SECONDARY_NAV: NavItem[] = [
  { key: "nav.vidyalaya", path: "/vidyalaya", match: (p) => p.startsWith("/vidyalaya") },
];

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.path === "/") return pathname === "/" || pathname === "";
  return item.match ? item.match(pathname) : pathname === item.path;
}
