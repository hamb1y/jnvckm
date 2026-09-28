import { isoDate, media, mediaList, num, recordsIn, singleton, str, text } from "./load";
import type { Category, ContributionEntry } from "./types";

/** The categories editors can file a contribution under, in display order. */
export const categories: Category[] = (
  Array.isArray(singleton("categories").categories) ? (singleton("categories").categories as Record<string, unknown>[]) : []
)
  .map((record) => ({ id: str(record.id), label: text(record.label) }))
  .filter((category) => category.id !== "");

export function categoryLabel(id: string): Category["label"] {
  return categories.find((category) => category.id === id)?.label ?? id;
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
    source: text(record.source),
    category: str(record.category),
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

/** Only the categories that actually have records, in the configured order. */
export function usedCategories(): Category[] {
  return categories.filter((category) => contributions.some((entry) => entry.category === category.id));
}
