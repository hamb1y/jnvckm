import { isoDate, media, mediaList, optionalStr, recordsIn, str, text } from "./load";
import type { EventEntry, ProgramId } from "./types";

const PROGRAM_IDS = ["ignite", "ncl", "meet", "workshop"] as const;

function asProgram(value: unknown): ProgramId {
  return typeof value === "string" && (PROGRAM_IDS as readonly string[]).includes(value)
    ? (value as ProgramId)
    : null;
}

function asLocation(value: unknown) {
  const location = text(value);
  return location === "" ? null : location;
}

function toEvent(record: Record<string, unknown>): EventEntry {
  return {
    slug: str(record.slug),
    title: text(record.title),
    date: isoDate(record.date),
    summary: text(record.summary),
    body: text(record.body),
    image: media(record.image),
    documents: mediaList(record.documents),
    source: optionalStr(record.source) ?? undefined,
    program: asProgram(record.program),
    location: asLocation(record.location),
  };
}

/** Newest first. Undated records sort last rather than first. */
export const events: EventEntry[] = recordsIn("events")
  .map(toEvent)
  .filter((entry) => entry.slug !== "" && entry.title !== "")
  .sort((a, b) => (b.date || "0000-00-00").localeCompare(a.date || "0000-00-00"));

export function eventBySlug(slug: string): EventEntry | undefined {
  return events.find((entry) => entry.slug === slug);
}

export function eventsForProgram(id: ProgramId): EventEntry[] {
  return events.filter((entry) => entry.program === id);
}
