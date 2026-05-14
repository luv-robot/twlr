import type { CoordinatorStatusItem } from "../data/demoWorkspace";
import type { CharacterStateFile, NarrativeEvent, OpenLoopStateFile, RoomMeeting, StateProposal } from "@twlr/schema";
import { ProposalCard } from "./ProposalCard";

interface StudioCoordinatorPanelProps {
  items: CoordinatorStatusItem[];
  proposals: StateProposal[];
  acceptedEventCount: number;
  characterState: CharacterStateFile;
  contextProjectionStatus: string;
  openLoopState: OpenLoopStateFile;
  latestAcceptedEvent: NarrativeEvent | undefined;
  storageStatus: string;
  onAcceptProposal: (proposalId: string) => void;
  onCreateRoomProposalCards: () => void;
  onRejectProposal: (proposalId: string) => void;
  onCreateMockProposal: () => void;
  onOpenWritersRoom: () => void;
  roomMeeting: RoomMeeting | null;
  snapshotStatus: string;
}

export function StudioCoordinatorPanel({
  items,
  latestAcceptedEvent,
  proposals,
  acceptedEventCount,
  characterState,
  contextProjectionStatus,
  openLoopState,
  onAcceptProposal,
  onCreateRoomProposalCards,
  onCreateMockProposal,
  onOpenWritersRoom,
  onRejectProposal,
  storageStatus,
  roomMeeting,
  snapshotStatus,
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
        <button className="secondary-button wide" onClick={onOpenWritersRoom}>
          Open Writers' Room
        </button>
      </section>

      {roomMeeting ? <WritersRoomCard meeting={roomMeeting} onCreateProposalCards={onCreateRoomProposalCards} /> : null}

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

      <section className="coordinator-card quiet-card">
        <div className="section-label">Snapshot status</div>
        <p>{snapshotStatus}</p>
      </section>

      <section className="coordinator-card quiet-card">
        <div className="section-label">Context projection</div>
        <p>{contextProjectionStatus}</p>
      </section>

      <section className="coordinator-card quiet-card">
        <div className="section-label">Projected state</div>
        <p>{characterState.characters.length} character state records in this session.</p>
        <p>{openLoopState.open_loops.length} open loop records in this session.</p>
        {characterState.characters[0] ? (
          <p className="event-note">
            {characterState.characters[0].name}: {characterState.characters[0].current_status}
          </p>
        ) : null}
      </section>
    </aside>
  );
}

function WritersRoomCard({
  meeting,
  onCreateProposalCards,
}: {
  meeting: RoomMeeting;
  onCreateProposalCards: () => void;
}) {
  const hasProposalCards = meeting.generated_proposals.length > 0;

  return (
    <section className="coordinator-card room-card">
      <div className="section-label">Writers' Room</div>
      <h3>{meeting.question}</h3>
      <div className="room-observations">
        {meeting.perspectives.map((perspective) => (
          <article className="room-observation" key={perspective.agent_id}>
            <strong>{perspective.label}</strong>
            <p>{perspective.observation}</p>
            <small>{perspective.suggested_check}</small>
          </article>
        ))}
      </div>
      <div className="coordinator-summary">
        <strong>Coordinator summary</strong>
        <p>{meeting.studio_coordinator_summary.summary}</p>
      </div>
      <button className="primary-button" disabled={hasProposalCards} onClick={onCreateProposalCards}>
        {hasProposalCards ? "Proposal cards ready" : "Create proposal cards"}
      </button>
    </section>
  );
}
