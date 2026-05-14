import type { NarrativeEvent, ProposalStatus, StateProposal } from "@twlr/schema";
import { canonicalCharacterId } from "./ids";

export interface ReviewProposalInput {
  proposal: StateProposal;
  decision: ProposalStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  editedSummary?: string | null;
}

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
