export const LOCALES = ["en", "kn"] as const;
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

export type ProgramId = "ignite" | "ncl" | "meet" | "workshop" | null;

export const CONTRIBUTION_CATEGORIES = [
  "infrastructure",
  "technology",
  "student-support",
  "sports",
  "culture",
  "staff-community",
] as const;
export type ContributionCategory = (typeof CONTRIBUTION_CATEGORIES)[number];

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
  location: Localized | null;
}

export interface ContributionEntry extends EntryBase {
  category: ContributionCategory;
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
  id: "ignite" | "ncl";
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
}
