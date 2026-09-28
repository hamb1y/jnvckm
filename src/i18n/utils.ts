import type { Locale } from "@/data/types";
import { DEFAULT_LOCALE } from "@/data/types";
import { pages } from "@/data/pages";
import { site } from "@/data/site";
import { dictionaries, type UIKey } from "./ui";

/** Years editors set once in the CMS, available in any interface text. */
const GLOBALS: Record<string, string> = {
  "{formed}": String(site.formed),
  "{founded}": pages.vidyalaya.founded === null ? "" : String(pages.vidyalaya.founded),
};

/**
 * UI translation. Falls back: requested locale -> default locale -> the key
 * itself, so a gap is visible in review rather than rendering an empty label.
 */
export function t(locale: Locale, key: UIKey): string {
  return tDynamic(locale, key);
}

/**
 * For keys built at runtime (e.g. `categories.${category}`). The lookup still
 * falls back through the default locale, and an unknown key returns itself so
 * a gap is obvious in review.
 */
export function tDynamic(locale: Locale, key: string): string {
  const value = dictionaries[locale]?.[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
  return value.replace(/\{formed\}|\{founded\}/g, (token) => GLOBALS[token]);
}

/**
 * Resolve a content field. Content may be a plain string (single-language) or
 * one string per locale. Falls back to the default locale, then to "".
 */
export function lx(value: unknown, locale: Locale): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const direct = record[locale];
    if (typeof direct === "string" && direct.trim() !== "") return direct;
    const fallback = record[DEFAULT_LOCALE];
    if (typeof fallback === "string" && fallback.trim() !== "") return fallback;
  }
  return "";
}
