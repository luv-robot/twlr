import type { NarrativeEvent, ProposalStatus, StateProposal } from "@twlr/schema";
import { canonicalCharacterId } from "./ids";

export interface ReviewProposalInput {
  proposal: StateProposal;
  decision: ProposalStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  editedSummary?: string | null;
}

export interface EditProposalDraftInput {
  proposal: StateProposal;
  summary: string;
  evidence: string;
}

const characterStatusFields = new Set(["current_status", "status", "summary", "description"]);
const timelineSummaryFields = new Set(["label", "summary"]);
const openLoopSummaryFields = new Set(["title", "notes", "summary", "description", "expected_payoff"]);
const chapterSummaryFields = new Set(["outline", "outline_beats", "summary", "description"]);

export function reviewStateProposal(input: ReviewProposalInput): StateProposal {
  const reviewedAt = input.reviewedAt ?? new Date().toISOString();

  return {
    ...input.proposal,
    status: input.decision,
    review: {
      reviewed_at: reviewedAt,
      reviewed_by: input.reviewedBy ?? "author",
      decision: input.decision,
      edited_summary: input.editedSummary ?? input.proposal.review.edited_summary,
    },
  };
}

export function editProposalDraft(input: EditProposalDraftInput): StateProposal {
  const summary = input.summary.trim() || input.proposal.summary;
  const evidence = input.evidence.trim();

  return {
    ...input.proposal,
    summary,
    evidence: evidence ? [evidence, ...input.proposal.evidence.slice(1)] : input.proposal.evidence,
    proposed_events: input.proposal.proposed_events.map((event) => {
      if (event.payload.target_type === "character" && characterStatusFields.has(event.payload.field ?? "")) {
        return updateProposalEventValue(event, summary);
      }

      if (event.payload.target_type === "timeline_event" && timelineSummaryFields.has(event.payload.field ?? "")) {
        return updateProposalEventValue(event, summary);
      }

      if (event.payload.target_type === "open_loop" && openLoopSummaryFields.has(event.payload.field ?? "")) {
        return updateProposalEventValue(event, summary);
      }

      if (event.payload.target_type === "chapter" && chapterSummaryFields.has(event.payload.field ?? "")) {
        return updateProposalEventValue(event, summary);
      }

      return event;
    }),
    review: {
      ...input.proposal.review,
      edited_summary: summary,
    },
  };
}

export function proposalToNarrativeEvents(proposal: StateProposal, now = new Date().toISOString()): NarrativeEvent[] {
  return proposalEventsForCommit(proposal).map((event, index) => ({
    event_id: makeProposalEventId(proposal.proposal_id, index),
    event_type: event.event_type,
    created_at: now,
    source: {
      kind: "accepted_proposal",
      proposal_id: proposal.proposal_id,
    },
    references: {
      chapters: proposal.affected.chapters,
      characters: proposal.affected.characters.map(canonicalCharacterId),
      open_loops: proposal.affected.open_loops,
      timeline_events: proposal.affected.timeline_events,
    },
    payload:
      event.payload.target_type === "character"
        ? {
            ...event.payload,
            target_id: canonicalCharacterId(event.payload.target_id),
          }
        : event.payload,
  }));
}

function updateProposalEventValue(
  event: StateProposal["proposed_events"][number],
  summary: string,
): StateProposal["proposed_events"][number] {
  return {
    ...event,
    payload: {
      ...event.payload,
      new_value: summary,
    },
  };
}

export function serializeJsonlRecord(record: unknown): string {
  return `${JSON.stringify(record)}\n`;
}

function makeProposalEventId(proposalId: string, index: number): string {
  return `event_${proposalId}_${String(index + 1).padStart(3, "0")}`;
}

function proposalEventsForCommit(proposal: StateProposal): StateProposal["proposed_events"] {
  if (
    proposal.source.name !== "Character Sheet" ||
    proposal.proposed_events.some(
      (event) => event.payload.target_type === "character" && event.payload.field === "current_status",
    )
  ) {
    return proposal.proposed_events;
  }

  const rawCharacterId =
    proposal.affected.characters[0] ??
    proposal.proposed_events.find((event) => event.payload.target_type === "character")?.payload.target_id;
  if (!rawCharacterId) {
    return proposal.proposed_events;
  }
  const characterId = canonicalCharacterId(rawCharacterId);

  return [
    {
      event_type: "character_state_changed",
      payload: {
        target_type: "character",
        target_id: characterId,
        field: "current_status",
        old_value: null,
        new_value: proposal.summary,
      },
    },
    ...proposal.proposed_events,
  ];
}
