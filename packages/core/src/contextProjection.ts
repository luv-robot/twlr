import type {
  CharacterStateFile,
  ContextProjectionPacket,
  ContextProjectionTask,
  NarrativeEvent,
  OpenLoopStateFile,
} from "@twlr/schema";
import { countWords } from "./chapter";

export interface BuildChapterContextProjectionInput {
  task: ContextProjectionTask;
  chapter: {
    chapter_id: string;
    title: string;
    body: string;
    file_path: string | null;
    metadata?: Record<string, unknown>;
  };
  characterState: CharacterStateFile;
  openLoopState: OpenLoopStateFile;
  events: NarrativeEvent[];
  selectedText?: string | null;
  maxChapterChars?: number;
  maxEvents?: number;
  now?: string;
}

export function buildChapterContextProjection(input: BuildChapterContextProjectionInput): ContextProjectionPacket {
  const aliases = makeChapterAliases(input.chapter.chapter_id, input.chapter.file_path);
  const referencedCharacters = input.characterState.characters.filter((character) =>
    character.referenced_chapters.some((chapterId) => aliases.has(chapterId)),
  );
  const referencedOpenLoops = input.openLoopState.open_loops.filter((openLoop) =>
    openLoop.related_chapters.some((chapterId) => aliases.has(chapterId)),
  );
  const referencedCharacterIds = new Set(referencedCharacters.map((character) => character.character_id));
  const referencedOpenLoopIds = new Set(referencedOpenLoops.map((openLoop) => openLoop.open_loop_id));
  const recentEvents = input.events
    .filter(
      (event) =>
        event.references.chapters.some((chapterId) => aliases.has(chapterId)) ||
        event.references.characters.some((characterId) => referencedCharacterIds.has(characterId)) ||
        event.references.open_loops.some((openLoopId) => referencedOpenLoopIds.has(openLoopId)),
    )
    .slice(0, input.maxEvents ?? 8);

  return {
    projection_id: `projection_${Date.now()}`,
    created_at: input.now ?? new Date().toISOString(),
    task: input.task,
    full_manuscript_included: false,
    current_chapter: {
      chapter_id: input.chapter.chapter_id,
      title: input.chapter.title,
      file_path: input.chapter.file_path,
      word_count: countWords(input.chapter.body),
      body_excerpt: truncateText(input.chapter.body, input.maxChapterChars ?? 6000),
      metadata: input.chapter.metadata ?? {},
    },
    selected_text: input.selectedText ?? null,
    characters: referencedCharacters,
    open_loops: referencedOpenLoops,
    recent_events: recentEvents,
    state_counts: {
      total_characters: input.characterState.characters.length,
      total_open_loops: input.openLoopState.open_loops.length,
      total_events: input.events.length,
    },
  };
}

function makeChapterAliases(chapterId: string, filePath: string | null): Set<string> {
  const aliases = new Set<string>([chapterId]);
  const digits = chapterId.match(/\d+/)?.[0];

  if (digits) {
    const padded = digits.padStart(3, "0");
    aliases.add(`chapter_${digits}`);
    aliases.add(`chapter-${digits}`);
    aliases.add(`chapter_${padded}`);
    aliases.add(`chapter-${padded}`);
  }

  if (filePath) {
    aliases.add(filePath);
    aliases.add(filePath.replace(/^manuscript\//, "").replace(/\.md$/, ""));
  }

  return aliases;
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars).trimEnd()}\n[truncated]`;
}
