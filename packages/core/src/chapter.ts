import type { ChapterMetadata } from "@twlr/schema";

export interface ParsedChapter {
  metadata: Partial<ChapterMetadata>;
  body: string;
}

export function countWords(text: string): number {
  const matches = text.trim().match(/[\p{L}\p{N}'-]+/gu);
  return matches ? matches.length : 0;
}

export function parseChapterMarkdown(markdown: string): ParsedChapter {
  if (!markdown.startsWith("---\n")) {
    return { metadata: {}, body: markdown };
  }

  const end = markdown.indexOf("\n---", 4);
  if (end === -1) {
    return { metadata: {}, body: markdown };
  }

  const frontmatter = markdown.slice(4, end).trim();
  const body = markdown.slice(end + 4).replace(/^\n/, "");
  const metadata: Record<string, string | number> = {};

  for (const line of frontmatter.split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    metadata[key] = /^\d+$/.test(rawValue) ? Number(rawValue) : rawValue;
  }

  return { metadata: metadata as Partial<ChapterMetadata>, body };
}
