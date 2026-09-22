import { media, recordsIn, str, text } from "./load";
import type { Program } from "./types";

function toProgram(record: Record<string, unknown>): Program | null {
  const id = str(record.id);
  if (id !== "ignite" && id !== "ncl") return null;
  return {
    id,
    name: text(record.name),
    shortName: text(record.shortName),
    tagline: text(record.tagline),
    summary: text(record.summary),
    body: text(record.body),
    startNote: text(record.startNote),
    image: media(record.image),
  };
}

export const programs: Program[] = recordsIn("programs")
  .map(toProgram)
  .filter((program): program is Program => program !== null);

export function programById(id: "ignite" | "ncl"): Program | undefined {
  return programs.find((program) => program.id === id);
}
