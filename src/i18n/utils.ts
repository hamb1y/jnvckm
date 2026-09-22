import type { Locale } from "@/data/types";
import { DEFAULT_LOCALE } from "@/data/types";
import { dictionaries, type UIKey } from "./ui";

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
  return dictionaries[locale]?.[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
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

/**
 * True when a field has no value in the requested locale but does have one in
 * the default — used to tell a Kannada reader that an archived record is being
 * shown in its original language rather than silently mixing languages.
 */
export function isFallback(value: unknown, locale: Locale): boolean {
  if (locale === DEFAULT_LOCALE) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const direct = record[locale];
    const fallback = record[DEFAULT_LOCALE];
    return (
      (typeof direct !== "string" || direct.trim() === "") &&
      typeof fallback === "string" &&
      fallback.trim() !== ""
    );
  }
  return false;
}
