import type { Locale } from "@/data/types";

const INTL_LOCALE: Record<Locale, string> = { en: "en-IN", kn: "kn-IN" };

const MONTHS: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  kn: [
    "ಜನವರಿ",
    "ಫೆಬ್ರುವರಿ",
    "ಮಾರ್ಚ್",
    "ಏಪ್ರಿಲ್",
    "ಮೇ",
    "ಜೂನ್",
    "ಜುಲೈ",
    "ಆಗಸ್ಟ್",
    "ಸೆಪ್ಟೆಂಬರ್",
    "ಅಕ್ಟೋಬರ್",
    "ನವೆಂಬರ್",
    "ಡಿಸೆಂಬರ್",
  ],
};

/**
 * Dates are formatted from a small table rather than Intl: the Kannada month
 * names are missing from some ICU builds, which silently produced "22, 2024".
 */
export function formatDate(iso: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const name = MONTHS[locale][Number(month) - 1];
  return name ? `${Number(day)} ${name} ${year}` : iso;
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
