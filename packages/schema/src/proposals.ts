import type { NarrativeEventType } from "./events";

export type ProposalStatus = "pending" | "accepted" | "edited" | "rejected";

export interface StateProposal {
  proposal_id: string;
  created_at: string;
  status: ProposalStatus;
  source: {
    kind: "skill" | "writers_room" | "studio_coordinator" | "mock";
    name: string;
    llm_provider?: "remote" | "mock";
  };
  scope: {
    chapters: string[];
    selected_text_range: {
      chapter_id: string;
      start: number;
      end: number;
    } | null;
  };
  affected: {
    chapters: string[];
    characters: string[];
    open_loops: string[];
    timeline_events: string[];
  };
  summary: string;
  evidence: string[];
  proposed_events: Array<{
    event_type: NarrativeEventType;
    payload: {
      target_type: string;
      target_id: string;
      field?: string;
      old_value?: unknown;
      new_value?: unknown;
    };
  }>;
  review: {
    reviewed_at: string | null;
    reviewed_by: string | null;
    decision: ProposalStatus | null;
    edited_summary: string | null;
  };
}
