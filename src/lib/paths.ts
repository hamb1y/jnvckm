import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/data/types";

/**
 * The single way to build an internal URL. Non-default locales are prefixed
 * ("/kn/events"); the default locale is not.
 */
export function localePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const trimmed = clean !== "/" ? clean.replace(/\/+$/, "") : "/";
  if (locale === DEFAULT_LOCALE) return trimmed;
  return trimmed === "/" ? `/${locale}` : `/${locale}${trimmed}`;
}

/** The same page in another locale, for the language switcher. */
export function alternatePath(pathname: string, to: Locale): string {
  return localePath(stripLocale(pathname), to);
}

export function stripLocale(pathname: string): string {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname || "/";
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
