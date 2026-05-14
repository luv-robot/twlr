export interface ChapterListItem {
  id: string;
  title: string;
  meta: string;
  state: "saved" | "active" | "review";
}

export interface CoordinatorStatusItem {
  count: string;
  label: string;
  tone: "proposal" | "warning" | "risk";
}

export const demoChapters: ChapterListItem[] = [
  { id: "01", title: "Rain at the South Gate", meta: "2.1k", state: "saved" },
  { id: "02", title: "The False Receipt", meta: "1.8k", state: "saved" },
  { id: "03", title: "A Name Removed", meta: "2.4k", state: "active" },
  { id: "04", title: "The Lantern Room", meta: "Draft", state: "review" },
];

export const demoCoordinatorItems: CoordinatorStatusItem[] = [
  { count: "3", label: "pending updates", tone: "proposal" },
  { count: "2", label: "unresolved threads", tone: "warning" },
  { count: "1", label: "possible timeline issue", tone: "risk" },
];

export const demoChapterBody = [
  "Mira noticed the receipt before anyone else did. The paper was old, but the ink had the faint wet shine of something written in a hurry.",
  "Outside the archive window, the south gate bells started again. Three slow notes, then silence. It was the kind of silence that made every drawer in the room feel watched.",
  "Shen Yao stood near the door with his hands folded behind his back. He did not ask what she had found. That was the first thing that made her afraid.",
  "The name had not been erased. It had been replaced. Whoever changed the record wanted the lie to look older than the truth.",
];

export function createMockCharacterProposal(now = new Date().toISOString()): StateProposal {
  return {
    proposal_id: `proposal_${Date.now()}`,
    created_at: now,
    status: "pending",
    source: {
      kind: "mock",
      name: "Character Sheet",
      llm_provider: "mock",
    },
    scope: {
      chapters: ["chapter_003"],
      selected_text_range: null,
    },
    affected: {
      chapters: ["chapter_003"],
      characters: ["char_mira_chen"],
      open_loops: ["loop_altered_archive_record"],
      timeline_events: [],
    },
    summary: "Mira now suspects that the archive record was changed after the trial.",
    evidence: ["The paper was old, but the ink had the faint wet shine of something written in a hurry."],
    proposed_events: [
      {
        event_type: "character_state_changed",
        payload: {
          target_type: "character",
          target_id: "char_mira_chen",
          field: "current_status",
          old_value: "investigating the archive",
          new_value: "suspects the archive record was changed",
        },
      },
    ],
    review: {
      reviewed_at: null,
      reviewed_by: null,
      decision: null,
      edited_summary: null,
    },
  };
}
import type { StateProposal } from "@twlr/schema";
