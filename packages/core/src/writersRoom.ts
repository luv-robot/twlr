import type { RoomMeeting } from "@twlr/schema";

export function createMockWritersRoomMeeting(now = new Date().toISOString()): RoomMeeting {
  return {
    meeting_id: `meeting_${Date.now()}`,
    created_at: now,
    question: "Does this chapter give Mira enough agency?",
    scope: {
      chapters: ["chapter_003"],
      characters: ["char_mira_chen"],
      open_loops: ["loop_altered_archive_record"],
    },
    perspectives: [
      {
        agent_id: "development_editor",
        label: "Development Editor",
        observation: "The clue is strong, but the scene needs one visible decision after Mira notices it.",
        risk: "The chapter may feel like setup without movement.",
        suggested_check: "Give Mira one small irreversible action.",
      },
      {
        agent_id: "reader_agent",
        label: "Reader Agent",
        observation: "The altered record creates curiosity. A private decision would help readers trust her as active.",
        risk: "Readers may read her caution as passivity.",
        suggested_check: "Show the cost of acting now.",
      },
      {
        agent_id: "continuity_editor",
        label: "Continuity Editor",
        observation: "If the record is already altered, this becomes an active unresolved thread.",
        risk: "The payoff timing may move earlier than planned.",
        suggested_check: "Track the altered archive record as an open loop.",
      },
    ],
    studio_coordinator_summary: {
      summary: "Mira can remain cautious, but the scene needs one visible choice and one tracked open loop.",
      follow_up_actions: ["Create proposal card for altered archive record", "Review Chapter 18 payoff timing"],
    },
    generated_proposals: [],
    author_decision: null,
  };
}
