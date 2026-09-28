import type { Locale } from "@/data/types";

const INTL_LOCALE: Record<Locale, string> = { en: "en-IN" };

const MONTHS: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** Dates are formatted from a small table rather than Intl, so they read the same everywhere. */
export function formatDate(iso: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const name = MONTHS[locale][Number(month) - 1];
  return name ? `${Number(day)} ${name} ${year}` : iso;
}

/** Day and month only, for records already grouped under their year. */
export function formatDayMonth(iso: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, , month, day] = match;
  const name = MONTHS[locale][Number(month) - 1];
  return name ? `${Number(day)} ${name}` : iso;
}

/** Whole rupees. Amounts in the archive are never fractional. */
export function formatAmount(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCount(n: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale]).format(n);
}
