import { t } from "@twlr/ui";
import type { CoordinatorStatusItem } from "../data/demoWorkspace";
import type {
  CharacterStateFile,
  NarrativeEvent,
  OpenLoopStateFile,
  RoomMeeting,
  StateProposal,
  TimelineStateFile,
} from "@twlr/schema";
import { ProposalCard } from "./ProposalCard";

interface StudioCoordinatorPanelProps {
  items: CoordinatorStatusItem[];
  proposals: StateProposal[];
  acceptedEventCount: number;
  characterState: CharacterStateFile;
  contextProjectionStatus: string;
  openLoopState: OpenLoopStateFile;
  timelineState: TimelineStateFile;
  latestAcceptedEvent: NarrativeEvent | undefined;
  storageStatus: string;
  onAcceptProposal: (proposalId: string) => void;
  onCheckAffectedChapters: () => void;
  onCreateForeshadowProposal: () => void;
  onCreateRoomProposalCards: () => void;
  onRejectProposal: (proposalId: string) => void;
  onCreateMockProposal: () => void;
  onCreateTimelineProposal: () => void;
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
  timelineState,
  onAcceptProposal,
  onCheckAffectedChapters,
  onCreateForeshadowProposal,
  onCreateRoomProposalCards,
  onCreateMockProposal,
  onCreateTimelineProposal,
  onOpenWritersRoom,
  onRejectProposal,
  storageStatus,
  roomMeeting,
  snapshotStatus,
}: StudioCoordinatorPanelProps) {
  const recentCharacters = [...characterState.characters]
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .slice(0, 3);
  const recentOpenLoops = [...openLoopState.open_loops]
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .slice(0, 3);

  return (
    <aside className="context-panel">
      <div className="panel-header">
        <h2>{t("studioCoordinator.title")}</h2>
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
        <div className="section-label">{t("studioCoordinator.nextUsefulActions")}</div>
        <button className="primary-button" onClick={onCreateMockProposal}>
          Character Sheet
        </button>
        <button className="secondary-button wide" onClick={onCreateTimelineProposal}>
          Timeline Compiler
        </button>
        <button className="secondary-button wide" onClick={onCreateForeshadowProposal}>
          Foreshadow Tracker
        </button>
        <button className="secondary-button wide" onClick={onCheckAffectedChapters}>
          Check affected chapters
        </button>
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
        <p>{acceptedEventCount} accepted narrative events available.</p>
        <p className="event-note">{storageStatus}</p>
        {latestAcceptedEvent ? (
          <p className="event-note">
            Latest: {latestAcceptedEvent.event_type} on {latestAcceptedEvent.payload.target_type}.
          </p>
        ) : null}
      </section>

      <section className="coordinator-card quiet-card">
        <div className="section-label">Revision check</div>
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
        <p>{timelineState.timeline_events.length} timeline event records in this session.</p>
        {recentCharacters.length > 0 ? (
          <div className="state-list">
            {recentCharacters.map((character) => (
              <p className="event-note state-line" key={character.character_id}>
                <strong>{character.name}</strong>
                <span>{character.current_status}</span>
              </p>
            ))}
          </div>
        ) : null}
        {recentOpenLoops.length > 0 ? (
          <div className="state-list">
            {recentOpenLoops.map((openLoop) => (
              <p className="state-line" key={openLoop.open_loop_id}>
                <strong>{openLoop.title}</strong>
                <span>{openLoop.status}</span>
              </p>
            ))}
          </div>
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
      <div className="section-label">{t("writersRoom.title")}</div>
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
