import { isoDate, media, mediaList, recordsIn, str, text } from "./load";
import type { PostEntry, PostKind } from "./types";

const KINDS: PostKind[] = ["news", "report", "story"];

function asKind(value: unknown): PostKind {
  return typeof value === "string" && (KINDS as string[]).includes(value)
    ? (value as PostKind)
    : "news";
}

function toPost(record: Record<string, unknown>): PostEntry {
  const batch = text(record.batch);
  return {
    slug: str(record.slug),
    title: text(record.title),
    date: isoDate(record.date),
    summary: text(record.summary),
    body: text(record.body),
    image: media(record.image),
    documents: mediaList(record.documents),
    source: text(record.source),
    kind: asKind(record.kind),
    author: text(record.author),
    batch: batch === "" ? null : batch,
  };
}

export const posts: PostEntry[] = recordsIn("posts")
  .map(toPost)
  .filter((entry) => entry.slug !== "" && entry.title !== "")
  .sort((a, b) => (b.date || "0000-00-00").localeCompare(a.date || "0000-00-00"));

export function postBySlug(slug: string): PostEntry | undefined {
  return posts.find((entry) => entry.slug === slug);
}
