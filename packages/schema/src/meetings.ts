export interface RoomMeeting {
  meeting_id: string;
  created_at: string;
  question: string;
  scope: {
    chapters: string[];
    characters: string[];
    open_loops: string[];
  };
  perspectives: Array<{
    agent_id: string;
    label: string;
    observation: string;
    risk: string;
    suggested_check: string;
  }>;
  studio_coordinator_summary: {
    summary: string;
    follow_up_actions: string[];
  };
  generated_proposals: string[];
  author_decision: {
    decision: "create_proposal_cards" | "keep_as_meeting_note" | "ask_follow_up" | "dismiss";
    decided_at: string;
  } | null;
}
