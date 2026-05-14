import type { StateProposal } from "@twlr/schema";

interface ProposalCardProps {
  proposal: StateProposal;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
}

export function ProposalCard({ proposal, onAccept, onReject }: ProposalCardProps) {
  const kicker = proposal.affected.timeline_events.length > 0 ? "Timeline Update" : "Character State Update";

  return (
    <section className="proposal-card">
      <div className="proposal-kicker">{kicker}</div>
      <h3>{proposal.summary}</h3>
      <div className="proposal-scope">
        <span>{proposal.affected.chapters.length} chapter</span>
        <span>{proposal.affected.characters.length} character</span>
        <span>{proposal.affected.open_loops.length} unresolved thread</span>
        {proposal.affected.timeline_events.length > 0 ? (
          <span>{proposal.affected.timeline_events.length} timeline event</span>
        ) : null}
      </div>
      <div className="proposal-evidence">
        <strong>Evidence</strong>
        <p>{proposal.evidence[0]}</p>
      </div>
      <div className="proposal-actions">
        <button className="secondary-button" onClick={() => onReject(proposal.proposal_id)}>
          Reject
        </button>
        <button className="secondary-button">Edit</button>
        <button className="primary-button compact" onClick={() => onAccept(proposal.proposal_id)}>
          Accept
        </button>
      </div>
    </section>
  );
}
