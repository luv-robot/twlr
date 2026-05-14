import type { StateProposal } from "@twlr/schema";

export type ProductionSkillId =
  | "character_sheet"
  | "outline_builder"
  | "timeline_compiler"
  | "foreshadow_tracker";

export interface ProductionSkillDefinition {
  skill_id: ProductionSkillId;
  label: string;
  output_kind: "state_proposal" | "structured_note";
  description: string;
}

export interface ProductionSkillContext {
  chapter_id: string;
  chapter_title: string;
  selected_text?: string;
}

export const productionSkills: ProductionSkillDefinition[] = [
  {
    skill_id: "character_sheet",
    label: "Character Sheet",
    output_kind: "state_proposal",
    description: "Extracts or updates character state from the current chapter.",
  },
  {
    skill_id: "outline_builder",
    label: "Outline Builder",
    output_kind: "structured_note",
    description: "Turns chapter material into outline beats.",
  },
  {
    skill_id: "timeline_compiler",
    label: "Timeline Compiler",
    output_kind: "state_proposal",
    description: "Identifies story events that should enter the timeline.",
  },
  {
    skill_id: "foreshadow_tracker",
    label: "Foreshadow Tracker",
    output_kind: "state_proposal",
    description: "Tracks setup, unresolved threads, and payoff candidates.",
  },
];

export function runMockProductionSkill(
  skillId: ProductionSkillId,
  context: ProductionSkillContext,
  now = new Date().toISOString(),
): StateProposal | null {
  if (skillId !== "character_sheet") {
    return null;
  }

  return createMockCharacterSheetProposal(context, now);
}

function createMockCharacterSheetProposal(context: ProductionSkillContext, now: string): StateProposal {
  return {
    proposal_id: `proposal_${Date.now()}`,
    created_at: now,
    status: "pending",
    source: {
      kind: "skill",
      name: "Character Sheet",
      llm_provider: "mock",
    },
    scope: {
      chapters: [context.chapter_id],
      selected_text_range: null,
    },
    affected: {
      chapters: [context.chapter_id],
      characters: ["char_mira_chen"],
      open_loops: ["loop_altered_archive_record"],
      timeline_events: [],
    },
    summary: "Mira now suspects that the archive record was changed after the trial.",
    evidence: [
      context.selected_text ??
        "The paper was old, but the ink had the faint wet shine of something written in a hurry.",
    ],
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
      {
        event_type: "open_loop_created",
        payload: {
          target_type: "open_loop",
          target_id: "loop_altered_archive_record",
          field: "title",
          new_value: "Altered archive record",
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
