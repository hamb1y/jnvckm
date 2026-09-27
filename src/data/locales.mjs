/**
 * Sveltia CMS stores a translated entry as one file with a block per locale:
 *
 *   { "en": { "title": "…", "date": "…" }, "kn": { "title": "…" } }
 *
 * The site reads one value per field instead, `title: { en, kn }`. This turns
 * the first shape into the second. A value that is the same in both locales,
 * or present only in English, stays a plain value, so dates, numbers and slugs
 * come through unchanged and a missing Kannada text falls back to English.
 *
 * Plain JavaScript so the verifier and the CMS check can share it.
 */

const LOCALES = ["en", "kn"];

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** True for a file in the per-locale shape. */
export function isLocaleFile(value) {
  return (
    isRecord(value) &&
    isRecord(value.en) &&
    Object.keys(value).every((key) => LOCALES.includes(key))
  );
}

function merge(en, kn) {
  if (kn === undefined || kn === null) return en;
  if (en === undefined || en === null) return typeof kn === "string" ? { en: "", kn } : kn;
  if (typeof en === "string" && typeof kn === "string") {
    return en === kn ? en : { en, kn };
  }
  if (Array.isArray(en)) {
    return en.map((item, index) => merge(item, Array.isArray(kn) ? kn[index] : undefined));
  }
  if (isRecord(en) && isRecord(kn)) {
    const out = {};
    for (const key of new Set([...Object.keys(en), ...Object.keys(kn)])) out[key] = merge(en[key], kn[key]);
    return out;
  }
  return en;
}

/** A content file in the site's per-field shape, whichever shape it was saved in. */
export function mergeLocales(value) {
  return isLocaleFile(value) ? merge(value.en, value.kn) : value;
}
