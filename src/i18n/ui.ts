import type { Locale } from "@/data/types";
import copy from "../../content/copy.json";

/**
 * UI strings live in content/copy.json so editors can change them in the CMS
 * ("Interface text"). The file keeps one block per locale; keys are the
 * dotted paths into it, e.g. "home.heroBody".
 *
 * Every key exists in every locale: `bun run verify` fails on a missing key.
 * The Kannada still needs a native reader (LAUNCH-CHECKLIST.md item 4).
 */
type Paths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type UIKey = Paths<(typeof copy)["en"]>;

function flatten(node: unknown, prefix = "", out: Record<string, string> = {}): Record<string, string> {
  if (typeof node === "string") out[prefix] = node;
  else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) flatten(value, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

export const dictionaries: Record<Locale, Record<string, string>> = {
  en: flatten(copy.en),
  kn: flatten(copy.kn),
};
