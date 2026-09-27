import { bool, media, num, singleton, text } from "./load";
import type { Localized, Media } from "./types";

/** Photographs and facts set on individual pages, from content/pages.json. */
export interface Fact {
  label: Localized;
  value: Localized;
  note: Localized;
  wide: boolean;
}

const raw = singleton("pages");
const section = (name: string) => (raw[name] ?? {}) as Record<string, unknown>;
const list = (value: unknown) => (Array.isArray(value) ? (value as Record<string, unknown>[]) : []);

const home = section("home");
const about = section("about");
const vidyalaya = section("vidyalaya");

export const pages = {
  home: {
    hero: media(home.hero),
    lab: media(home.lab),
    campus: media(home.campus),
  },
  about: {
    photo: media(about.photo),
    work: list(about.work)
      .map((entry) => text(entry.item))
      .filter((item) => item !== ""),
  },
  vidyalaya: {
    founded: num(vidyalaya.founded),
    photo: media(vidyalaya.photo),
    facts: list(vidyalaya.facts)
      .map((fact): Fact => ({
        label: text(fact.label),
        value: text(fact.value),
        note: text(fact.note),
        wide: bool(fact.wide),
      }))
      .filter((fact) => fact.label !== "" && fact.value !== ""),
  },
} satisfies Record<string, Record<string, Media | Localized[] | Fact[] | number | null>>;
