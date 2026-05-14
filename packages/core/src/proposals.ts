import type { NarrativeEvent, ProposalStatus, StateProposal } from "@twlr/schema";

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
  return proposal.proposed_events.map((event, index) => ({
    event_id: makeProposalEventId(proposal.proposal_id, index),
    event_type: event.event_type,
    created_at: now,
    source: {
      kind: "accepted_proposal",
      proposal_id: proposal.proposal_id,
    },
    references: {
      chapters: proposal.affected.chapters,
      characters: proposal.affected.characters,
      open_loops: proposal.affected.open_loops,
      timeline_events: proposal.affected.timeline_events,
    },
    payload: event.payload,
  }));
}

export function serializeJsonlRecord(record: unknown): string {
  return `${JSON.stringify(record)}\n`;
}

function makeProposalEventId(proposalId: string, index: number): string {
  return `event_${proposalId}_${String(index + 1).padStart(3, "0")}`;
}
