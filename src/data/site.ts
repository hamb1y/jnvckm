import { bool, num, optionalStr, singleton, text } from "./load";
import type { SiteSettings, Social } from "./types";

const raw = singleton("site");

const contact = (raw.contact ?? {}) as Record<string, unknown>;

function socials(value: unknown): Social[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const label = optionalStr(record.label);
      const url = optionalStr(record.url);
      if (!label || !url) return null;
      return { label, url, verified: bool(record.verified) };
    })
    .filter((item): item is Social => item !== null);
}

const donations = (raw.donations ?? {}) as Record<string, unknown>;

function credit(value: unknown): { label: string; url: string } | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const label = optionalStr(record.label);
  const url = optionalStr(record.url);
  return label && url ? { label, url } : null;
}
export const site: SiteSettings = {
  name: text(raw.name),
  schoolName: text(raw.schoolName),
  formed: num(raw.formed) ?? 1993,
  tagline: text(raw.tagline),
  description: text(raw.description),
  contact: {
    email: optionalStr(contact.email),
    emailVerified: bool(contact.emailVerified),
    phone: optionalStr(contact.phone),
    phoneVerified: bool(contact.phoneVerified),
    address: text(contact.address),
  },
  socials: socials(raw.socials),
  repository: optionalStr(raw.repository) ?? "https://github.com/hamb1y/jnvckm",
  credit: credit(raw.credit),
  license: credit(raw.license),
  donations: {
    enabled: bool(donations.enabled),
    note: text(donations.note),
  },
};
