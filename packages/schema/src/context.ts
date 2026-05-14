import type { ChapterMetadata } from "./chapter";
import type { NarrativeEvent } from "./events";
import type { CharacterState, OpenLoop } from "./state";

export type ContextProjectionTask = "production_skill" | "writers_room" | "studio_coordinator" | "rewrite_impact";

export interface ContextProjectionChapter {
  chapter_id: string;
  title: string;
  file_path: string | null;
  word_count: number;
  body_excerpt: string;
  metadata: Partial<ChapterMetadata>;
}

export interface ContextProjectionPacket {
  projection_id: string;
  created_at: string;
  task: ContextProjectionTask;
  full_manuscript_included: false;
  current_chapter: ContextProjectionChapter;
  selected_text: string | null;
  characters: CharacterState[];
  open_loops: OpenLoop[];
  recent_events: NarrativeEvent[];
  state_counts: {
    total_characters: number;
    total_open_loops: number;
    total_events: number;
  };
}
