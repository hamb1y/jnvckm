export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/**
 * A translatable value. The CMS stores either a plain string (single-language
 * content) or one string per locale. `lx()` in i18n/utils resolves either.
 */
export type Localized = string | Partial<Record<Locale, string>>;

export const FOCAL_POSITIONS = ["center", "top", "bottom", "left", "right"] as const;
export type FocalPosition = (typeof FOCAL_POSITIONS)[number];

export interface Media {
  src: string;
  alt: Localized;
  caption?: Localized;
  /** Which part of the frame to keep when cropping. Never a numeric focal point. */
  position?: FocalPosition;
}

/** A program's id, which is also its address under /programs. */
export type ProgramId = string | null;

/** A contribution category, set in content/categories.json. */
export interface Category {
  id: string;
  label: Localized;
}

export interface EntryBase {
  slug: string;
  title: Localized;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  summary: Localized;
  /** Markdown. Empty when the record is redacted to a summary. */
  body: Localized;
  image: Media | null;
  documents: Media[];
  /** Where a migrated record came from. */
  source?: Localized;
}

export interface EventEntry extends EntryBase {
  program: ProgramId;
  /** Groups events that are not a program's editions, such as alumni meets. */
  series: string | null;
  location: Localized | null;
}

export interface ContributionEntry extends EntryBase {
  category: string;
  batch: Localized | null;
  /** Rupees, whole units. Null when the record does not state an amount. */
  amount: number | null;
  /** Shown to readers when a historical record has been redacted. */
  archiveNote: Localized | null;
}

export type PostKind = "news" | "report" | "story";

export interface PostEntry extends EntryBase {
  kind: PostKind;
  author?: Localized;
  batch?: Localized | null;
}

export interface Program {
  id: string;
  order: number;
  name: Localized;
  shortName?: Localized;
  tagline: Localized;
  summary: Localized;
  body: Localized;
  startNote: Localized;
  image: Media | null;
}

export interface Social {
  label: string;
  url: string;
  verified: boolean;
}

export interface SiteSettings {
  name: Localized;
  /** Header logo; null falls back to the site name set as text. */
  logo: { src: string; width: number; height: number } | null;
  /** Social card for pages without their own photograph. */
  socialImage: string | null;
  schoolName: Localized;
  formed: number;
  tagline: Localized;
  description: Localized;
  contact: {
    email: string | null;
    emailVerified: boolean;
    phone: string | null;
    phoneVerified: boolean;
    address: Localized;
  };
  socials: Social[];
  repository: string;
  credit: { label: string; url: string } | null;
  license: { label: string; url: string } | null;
  donations: {
    note: Localized;
  };
  nav: {
    header: string[];
    footer: string[];
  };
}
