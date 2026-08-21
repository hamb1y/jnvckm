import type { MarkdownInstance } from "astro";

export type EventFrontmatter = {
  title: string;
  date: string | number;
  summary?: string;
  location?: string;
  tags?: string[];
  featured?: boolean;
  thumbnail?: string;
};

export type ContributionFrontmatter = {
  title: string;
  date: string | number;
  summary?: string;
  type?: string;
  initiated_by?: string;
  tags?: string[];
  thumbnail?: string;
};

export type SiteSettings = {
  title: string;
  description: string;
  logo: string;
  logo_alt: string;
  hero: {
    eyebrow: string;
    title: string;
    tagline: string;
    primary_label: string;
    primary_href: string;
    secondary_label: string;
    secondary_href: string;
    slides: Array<{ image: string; alt: string }>;
  };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ title: string; description: string }>;
  };
  events_section: { eyebrow: string; title: string; description: string; link_label: string };
  contributions_section: { eyebrow: string; title: string; description: string; link_label: string };
  faq_section: { eyebrow: string; title: string; description: string };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    email: string;
    subject: string;
    name_label: string;
    email_label: string;
    relation_label: string;
    message_label: string;
    submit_label: string;
    help_text: string;
    relation_options: string[];
  };
  navigation: Array<{ label: string; href: string }>;
  footer: { copyright: string; credit_label: string; credit_url: string; repository_label: string; repository_url: string };
  pages: {
    events: { eyebrow: string; title: string; description: string; empty_text: string; back_label: string; type_label: string };
    contributions: { eyebrow: string; title: string; description: string; empty_text: string; back_label: string; type_label: string; initiated_label: string };
    not_found: { title: string; description: string; home_label: string };
  };
};

type MarkdownModules<T> = Record<string, MarkdownInstance<T>>;

export type EventEntry = EventFrontmatter & {
  slug: string;
  summary: string;
  Content: MarkdownInstance<EventFrontmatter>["Content"];
};

export type ContributionEntry = ContributionFrontmatter & {
  slug: string;
  summary: string;
  Content: MarkdownInstance<ContributionFrontmatter>["Content"];
};

const eventModules = import.meta.glob<MarkdownInstance<EventFrontmatter>>("../../content/events/*.md", {
  eager: true,
});
const contributionModules = import.meta.glob<MarkdownInstance<ContributionFrontmatter>>(
  "../../content/contributions/*.md",
  { eager: true }
);
const siteModules = import.meta.glob<MarkdownInstance<SiteSettings>>("../../content/site.md", {
  eager: true,
});

function toPlainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
    .replace(/[*_>#-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSummary(explicit: string | undefined, raw: string) {
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim();
  }
  const plain = toPlainText(raw);
  if (!plain) return "";
  return plain.length > 220 ? `${plain.slice(0, 220).trim()}…` : plain;
}

function normalizeCollection<T extends { title: string; date: string | number; summary?: string }>(
  modules: MarkdownModules<T>
): Array<
  T & {
    slug: string;
    summary: string;
    Content: MarkdownInstance<T>["Content"];
  }
> {
  return Object.entries(modules)
    .map(([path, entry]) => {
      const slug = path.split("/").pop()?.replace(".md", "") ?? "";
      const rawContent = entry.rawContent();
      return {
        slug,
        ...entry.frontmatter,
        summary: buildSummary(entry.frontmatter.summary, rawContent),
        Content: entry.Content,
      };
    })
    .filter((item) => Boolean(item.title) && Boolean(item.date) && !Number.isNaN(new Date(item.date).getTime()))
    .sort(
      (a, b) =>
        Number(Boolean((b as { featured?: boolean }).featured)) -
          Number(Boolean((a as { featured?: boolean }).featured)) ||
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

const eventsCache: EventEntry[] = normalizeCollection<EventFrontmatter>(eventModules);
const contributionsCache: ContributionEntry[] =
  normalizeCollection<ContributionFrontmatter>(contributionModules);

const siteSettings = Object.values(siteModules)[0]?.frontmatter;

export function getSiteSettings(): SiteSettings {
  if (!siteSettings) {
    throw new Error("Missing required content/site.md site settings file");
  }
  return siteSettings;
}

export function getEvents(): EventEntry[] {
  return eventsCache;
}

export function getEvent(slug: string): EventEntry | undefined {
  return eventsCache.find((event) => event.slug === slug);
}

export function getContributions(): ContributionEntry[] {
  return contributionsCache;
}

export function getContribution(slug: string): ContributionEntry | undefined {
  return contributionsCache.find((item) => item.slug === slug);
}
