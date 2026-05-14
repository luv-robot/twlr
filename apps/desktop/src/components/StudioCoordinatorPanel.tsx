import type { CoordinatorStatusItem } from "../data/demoWorkspace";
import type { NarrativeEvent, StateProposal } from "@twlr/schema";
import { ProposalCard } from "./ProposalCard";

interface StudioCoordinatorPanelProps {
  items: CoordinatorStatusItem[];
  proposals: StateProposal[];
  acceptedEventCount: number;
  latestAcceptedEvent: NarrativeEvent | undefined;
  storageStatus: string;
  onAcceptProposal: (proposalId: string) => void;
  onRejectProposal: (proposalId: string) => void;
  onCreateMockProposal: () => void;
}

export function StudioCoordinatorPanel({
  items,
  latestAcceptedEvent,
  proposals,
  acceptedEventCount,
  onAcceptProposal,
  onCreateMockProposal,
  onRejectProposal,
  storageStatus,
}: StudioCoordinatorPanelProps) {
  return (
    <aside className="context-panel">
      <div className="panel-header">
        <h2>Studio Coordinator</h2>
        <div className="tabs">
          <button className="tab active">Room</button>
          <button className="tab">State</button>
          <button className="tab">Impact</button>
        </div>
      </div>

      <section className="coordinator-card">
        <div className="section-label">Project status</div>
        {items.map((item) => (
          <div className="status-row" key={item.label}>
            <strong className={item.tone}>{item.count}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="coordinator-card">
        <div className="section-label">Next useful actions</div>
        <button className="primary-button" onClick={onCreateMockProposal}>
          Mock Character Sheet
        </button>
        <button className="secondary-button wide">Check affected chapters</button>
        <button className="secondary-button wide">Open Writers' Room</button>
      </section>

      {proposals.length > 0 ? (
        <section className="coordinator-card">
          <div className="section-label">Pending updates</div>
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.proposal_id}
              onAccept={onAcceptProposal}
              onReject={onRejectProposal}
              proposal={proposal}
            />
          ))}
        </section>
      ) : (
        <section className="coordinator-card quiet-card">
          <div className="section-label">Pending updates</div>
          <p>No pending state updates.</p>
        </section>
      )}

      <section className="coordinator-card quiet-card">
        <div className="section-label">Durable events</div>
        <p>{acceptedEventCount} accepted narrative events in this session.</p>
        <p className="event-note">{storageStatus}</p>
        {latestAcceptedEvent ? (
          <p className="event-note">
            Latest: {latestAcceptedEvent.event_type} on {latestAcceptedEvent.payload.target_type}.
          </p>
        ) : null}
      </section>
    </aside>
  );
}
