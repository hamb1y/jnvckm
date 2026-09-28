import sharp from "sharp";
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
/** Pages the header and footer can link to, in the order editors list them. */
function pageList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "object" && item !== null ? optionalStr((item as Record<string, unknown>).page) : null))
    .filter((page): page is string => page !== null);
}

const nav = (raw.nav ?? {}) as Record<string, unknown>;

/** The logo's own dimensions, so the header reserves the right space. */
async function logo(value: unknown): Promise<SiteSettings["logo"]> {
  const src = optionalStr(value);
  if (!src || !src.startsWith("/")) return null;
  try {
    const { width, height } = await sharp(`public${src}`).metadata();
    return width && height ? { src, width, height } : null;
  } catch {
    return null;
  }
}

export const site: SiteSettings = {
  name: text(raw.name),
  logo: await logo(raw.logo),
  socialImage: optionalStr(raw.socialImage),
  schoolName: text(raw.schoolName),
  formed: num(raw.formed) ?? 1994,
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
    note: text(donations.note),
  },
  nav: {
    header: pageList(nav.header),
    footer: pageList(nav.footer),
  },
};
