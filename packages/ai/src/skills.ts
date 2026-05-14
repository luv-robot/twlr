import type { ContextProjectionPacket, StateProposal } from "@twlr/schema";

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
  context_packet?: ContextProjectionPacket;
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
  if (skillId === "character_sheet") {
    return createMockCharacterSheetProposal(context, now);
  }

  if (skillId === "timeline_compiler") {
    return createMockTimelineCompilerProposal(context, now);
  }

  return null;
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

function createMockTimelineCompilerProposal(context: ProductionSkillContext, now: string): StateProposal {
  return {
    proposal_id: `proposal_${Date.now()}_timeline`,
    created_at: now,
    status: "pending",
    source: {
      kind: "skill",
      name: "Timeline Compiler",
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
      timeline_events: ["timeline_altered_archive_record"],
    },
    summary: "Chapter event: Mira discovers that the archive record was altered after the trial.",
    evidence: [
      context.selected_text ??
        context.context_packet?.current_chapter.body_excerpt ??
        "The name had not been erased. It had been replaced.",
    ],
    proposed_events: [
      {
        event_type: "timeline_event_created",
        payload: {
          target_type: "timeline_event",
          target_id: "timeline_altered_archive_record",
          field: "label",
          new_value: "Mira discovers the altered archive record",
        },
      },
      {
        event_type: "timeline_event_changed",
        payload: {
          target_type: "timeline_event",
          target_id: "timeline_altered_archive_record",
          field: "summary",
          new_value: "Mira sees evidence that the archive record was changed after the trial.",
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
