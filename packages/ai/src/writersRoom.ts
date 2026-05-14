import type { RoomMeeting, StateProposal } from "@twlr/schema";
import { getOfficialAgent } from "./agents";

export function createMockWritersRoomMeeting(now = new Date().toISOString()): RoomMeeting {
  const developmentEditor = getOfficialAgent("development_editor");
  const readerAgent = getOfficialAgent("reader_agent");
  const continuityEditor = getOfficialAgent("continuity_editor");

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
        agent_id: developmentEditor.agent_id,
        label: developmentEditor.label,
        observation: "The clue is strong, but the scene needs one visible decision after Mira notices it.",
        risk: "The chapter may feel like setup without movement.",
        suggested_check: "Give Mira one small irreversible action.",
      },
      {
        agent_id: readerAgent.agent_id,
        label: readerAgent.label,
        observation: "The altered record creates curiosity. A private decision would help readers trust her as active.",
        risk: "Readers may read her caution as passivity.",
        suggested_check: "Show the cost of acting now.",
      },
      {
        agent_id: continuityEditor.agent_id,
        label: continuityEditor.label,
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

export function createWritersRoomProposalCards(
  meeting: RoomMeeting,
  now = new Date().toISOString(),
): StateProposal[] {
  return [
    {
      proposal_id: `proposal_${meeting.meeting_id}_open_loop`,
      created_at: now,
      status: "pending",
      source: {
        kind: "writers_room",
        name: "Writers' Room",
        llm_provider: "mock",
      },
      scope: {
        chapters: meeting.scope.chapters,
        selected_text_range: null,
      },
      affected: {
        chapters: meeting.scope.chapters,
        characters: meeting.scope.characters,
        open_loops: meeting.scope.open_loops,
        timeline_events: [],
      },
      summary: "Track the altered archive record as an active unresolved thread.",
      evidence: [
        meeting.studio_coordinator_summary.summary,
        ...meeting.perspectives.map((perspective) => `${perspective.label}: ${perspective.suggested_check}`),
      ],
      proposed_events: [
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
    },
  ];
}
