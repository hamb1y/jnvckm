import { contributions } from "./contributions";
import { events } from "./events";
import { posts } from "./posts";
import type { Localized, Media } from "./types";

export type ActivityKind = "event" | "contribution" | "news" | "report" | "story";

export interface ActivityItem {
  kind: ActivityKind;
  slug: string;
  /** Locale-free path; run it through localePath(). */
  path: string;
  title: Localized;
  date: string;
  summary: Localized;
  image: Media | null;
  batch: Localized | null;
  amount: number | null;
}

/**
 * A single dated feed across collections. The site is about what the
 * association is doing, so the home page leads with the newest records from
 * every kind rather than one section per collection.
 */
export function recentActivity(limit = 5): ActivityItem[] {
  const items: ActivityItem[] = [
    ...posts.map((entry) => ({
      kind: entry.kind,
      slug: entry.slug,
      path: `/stories/${entry.slug}`,
      title: entry.title,
      date: entry.date,
      summary: entry.summary,
      image: entry.image,
      batch: entry.batch ?? null,
      amount: null,
    })),
    ...events.map((entry) => ({
      kind: "event" as const,
      slug: entry.slug,
      path: `/events/${entry.slug}`,
      title: entry.title,
      date: entry.date,
      summary: entry.summary,
      image: entry.image,
      batch: null,
      amount: null,
    })),
    ...contributions.map((entry) => ({
      kind: "contribution" as const,
      slug: entry.slug,
      path: `/contributions/${entry.slug}`,
      title: entry.title,
      date: entry.date,
      summary: entry.summary,
      image: entry.image,
      batch: entry.batch,
      amount: entry.amount,
    })),
  ];

  return items
    .filter((item) => item.date !== "")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
