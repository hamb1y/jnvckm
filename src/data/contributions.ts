import { isoDate, media, mediaList, num, optionalStr, recordsIn, str, text } from "./load";
import { CONTRIBUTION_CATEGORIES, type ContributionCategory, type ContributionEntry } from "./types";

function asCategory(value: unknown): ContributionCategory {
  return typeof value === "string" && (CONTRIBUTION_CATEGORIES as readonly string[]).includes(value)
    ? (value as ContributionCategory)
    : "infrastructure";
}

function toContribution(record: Record<string, unknown>): ContributionEntry {
  const batch = text(record.batch);
  const archiveNote = text(record.archiveNote);
  return {
    slug: str(record.slug),
    title: text(record.title),
    date: isoDate(record.date),
    summary: text(record.summary),
    body: text(record.body),
    image: media(record.image),
    documents: mediaList(record.documents),
    source: optionalStr(record.source) ?? undefined,
    category: asCategory(record.category),
    batch: batch === "" ? null : batch,
    amount: num(record.amount),
    archiveNote: archiveNote === "" ? null : archiveNote,
  };
}

export const contributions: ContributionEntry[] = recordsIn("contributions")
  .map(toContribution)
  .filter((entry) => entry.slug !== "" && entry.title !== "")
  .sort((a, b) => (b.date || "0000-00-00").localeCompare(a.date || "0000-00-00"));

export function contributionBySlug(slug: string): ContributionEntry | undefined {
  return contributions.find((entry) => entry.slug === slug);
}

/** Only the categories that actually have records, in canonical order. */
export function usedCategories(): ContributionCategory[] {
  return CONTRIBUTION_CATEGORIES.filter((category) =>
    contributions.some((entry) => entry.category === category),
  );
}
