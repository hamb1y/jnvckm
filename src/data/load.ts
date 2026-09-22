import {
  FOCAL_POSITIONS,
  type FocalPosition,
  type Localized,
  type Media,
} from "./types";

/**
 * The only module that knows the on-disk shape of `content/`.
 * Everything downstream consumes typed models, never raw files.
 */

const files = import.meta.glob("/content/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Raw records for one content directory, keyed by slug (the filename). */
export function recordsIn(dir: string): Record<string, unknown>[] {
  const needle = `/content/${dir}/`;
  return Object.entries(files)
    .filter(([filePath]) => filePath.includes(needle) && !filePath.includes("/drafts/"))
    .map(([filePath, value]) => {
      const slug = filePath.split("/").pop()!.replace(/\.json$/, "");
      return { slug, ...(isRecord(value) ? value : {}) };
    });
}

export function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function optionalStr(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function bool(value: unknown): boolean {
  return value === true;
}

/** A translatable string; empty objects and whitespace collapse to "". */
export function text(value: unknown): Localized {
  if (typeof value === "string") return value;
  if (isRecord(value)) {
    const out: Partial<Record<string, string>> = {};
    for (const [locale, entry] of Object.entries(value)) {
      if (typeof entry === "string" && entry.trim() !== "") out[locale] = entry;
    }
    return Object.keys(out).length > 0 ? out : "";
  }
  return "";
}

/**
 * An image. Returns null unless there is a real source, so a half-filled CMS
 * object can never render a broken <img>. Alt text is required to be present
 * or the image is treated as decorative (empty alt).
 */
export function media(value: unknown): Media | null {
  if (!isRecord(value)) return null;
  const src = optionalStr(value.src);
  if (!src) return null;
  const position =
    typeof value.position === "string" && (FOCAL_POSITIONS as readonly string[]).includes(value.position)
      ? (value.position as FocalPosition)
      : undefined;
  return { src, alt: text(value.alt), caption: text(value.caption), position };
}

export function mediaList(value: unknown): Media[] {
  if (!Array.isArray(value)) return [];
  return value.map(media).filter((item): item is Media => item !== null);
}

export function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
}

/** A single record such as content/site.json. */
export function singleton(name: string): Record<string, unknown> {
  const found = files[`/content/${name}.json`];
  return isRecord(found) ? found : {};
}

/** ISO date, or a clearly invalid placeholder we can detect downstream. */
export function isoDate(value: unknown): string {
  const raw = optionalStr(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : raw.slice(0, 10);
}
