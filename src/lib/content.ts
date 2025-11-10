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
    .filter((item) => Boolean(item.title) && Boolean(item.date))
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

const eventsCache: EventEntry[] = normalizeCollection<EventFrontmatter>(eventModules);
const contributionsCache: ContributionEntry[] =
  normalizeCollection<ContributionFrontmatter>(contributionModules);

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
