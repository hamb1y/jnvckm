import { media, num, recordsIn, str, text } from "./load";
import type { Program } from "./types";

function toProgram(record: Record<string, unknown>): Program | null {
  const id = str(record.id);
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  return {
    id,
    order: num(record.order) ?? 0,
    name: text(record.name),
    shortName: text(record.shortName),
    tagline: text(record.tagline),
    summary: text(record.summary),
    body: text(record.body),
    startNote: text(record.startNote),
    image: media(record.image),
  };
}

/** In the order editors set, then by id. */
export const programs: Program[] = recordsIn("programs")
  .map(toProgram)
  .filter((program): program is Program => program !== null)
  .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

export function programById(id: string): Program | undefined {
  return programs.find((program) => program.id === id);
}
