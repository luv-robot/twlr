import { t } from "@twlr/ui";
import type { ProductionSkillId } from "@twlr/ai";
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
  isCheckingImpact: boolean;
  openLoopState: OpenLoopStateFile;
  proposalReviewAction: {
    action: "accept" | "reject";
    proposalId: string;
  } | null;
  timelineState: TimelineStateFile;
  latestAcceptedEvent: NarrativeEvent | undefined;
  roomAction: "creating_cards" | "opening" | null;
  storageStatus: string;
  onAcceptProposal: (proposalId: string) => void;
  onCheckAffectedChapters: () => void;
  onCreateForeshadowProposal: () => void;
  onSaveRoomNotes: () => void;
  onEditProposal: (proposalId: string, draft: { evidence: string; summary: string }) => void;
  onRejectProposal: (proposalId: string) => void;
  onCreateMockProposal: () => void;
  onCreateOutlineProposal: () => void;
  onCreateTimelineProposal: () => void;
  onOpenWritersRoom: () => void;
  roomMeeting: RoomMeeting | null;
  runningSkillId: ProductionSkillId | null;
  snapshotStatus: string;
}

export function StudioCoordinatorPanel({
  items,
  latestAcceptedEvent,
  proposals,
  acceptedEventCount,
  characterState,
  contextProjectionStatus,
  isCheckingImpact,
  openLoopState,
  proposalReviewAction,
  timelineState,
  onAcceptProposal,
  onCheckAffectedChapters,
  onCreateForeshadowProposal,
  onSaveRoomNotes,
  onEditProposal,
  onCreateMockProposal,
  onCreateOutlineProposal,
  onCreateTimelineProposal,
  onOpenWritersRoom,
  onRejectProposal,
  storageStatus,
  roomAction,
  roomMeeting,
  runningSkillId,
  snapshotStatus,
}: StudioCoordinatorPanelProps) {
  const recentCharacters = [...characterState.characters]
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .slice(0, 3);
  const recentOpenLoops = [...openLoopState.open_loops]
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .slice(0, 3);
  const recentTimelineEvents = [...timelineState.timeline_events]
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
    .slice(0, 3);

  return (
    <aside className="context-panel">
      <div className="panel-header">
        <h2>{t("studioCoordinator.title")}</h2>
        <div className="tabs">
          <button className="tab active">Room</button>
          <button className="tab" disabled>
            State
          </button>
          <button className="tab" disabled>
            Impact
          </button>
        </div>
      </div>

      <section className="coordinator-card">
        <div className="section-label">{t("studioCoordinator.projectStatus")}</div>
        {items.map((item) => (
          <div className="status-row" key={item.label}>
            <strong className={item.tone}>{item.count}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="coordinator-card">
        <div className="section-label">{t("studioCoordinator.nextUsefulActions")}</div>
        <button className="primary-button" disabled={Boolean(runningSkillId)} onClick={onCreateMockProposal}>
          {runningSkillId === "character_sheet" ? t("skill.runningCharacterSheet") : t("skill.characterSheet")}
        </button>
        <button className="secondary-button wide" disabled={Boolean(runningSkillId)} onClick={onCreateOutlineProposal}>
          {runningSkillId === "outline_builder" ? t("skill.runningOutlineBuilder") : t("skill.outlineBuilder")}
        </button>
        <button className="secondary-button wide" disabled={Boolean(runningSkillId)} onClick={onCreateTimelineProposal}>
          {runningSkillId === "timeline_compiler" ? t("skill.runningTimelineCompiler") : t("skill.timelineCompiler")}
        </button>
        <button className="secondary-button wide" disabled={Boolean(runningSkillId)} onClick={onCreateForeshadowProposal}>
          {runningSkillId === "foreshadow_tracker" ? t("skill.runningForeshadowTracker") : t("skill.foreshadowTracker")}
        </button>
        <button className="secondary-button wide" disabled={isCheckingImpact} onClick={onCheckAffectedChapters}>
          {isCheckingImpact ? t("studioCoordinator.checkingAffectedChapters") : t("studioCoordinator.checkAffectedChapters")}
        </button>
        <button className="secondary-button wide" disabled={Boolean(roomAction)} onClick={onOpenWritersRoom}>
          {roomAction === "opening" ? t("studioCoordinator.openingWritersRoom") : t("studioCoordinator.openWritersRoom")}
        </button>
      </section>

      {roomMeeting ? (
        <WritersRoomCard
          meeting={roomMeeting}
          roomAction={roomAction}
          onSaveSelectedNotes={onSaveRoomNotes}
        />
      ) : null}

      {proposals.length > 0 ? (
        <section className="coordinator-card">
          <div className="section-label">{t("studioCoordinator.pendingUpdates")}</div>
          {proposals.map((proposal) => (
            <ProposalCard
              busyAction={
                proposalReviewAction?.proposalId === proposal.proposal_id ? proposalReviewAction.action : null
              }
              key={proposal.proposal_id}
              onAccept={onAcceptProposal}
              onEdit={onEditProposal}
              onReject={onRejectProposal}
              proposal={proposal}
            />
          ))}
        </section>
      ) : (
        <section className="coordinator-card quiet-card">
          <div className="section-label">{t("studioCoordinator.pendingUpdates")}</div>
          <p>No pending state updates.</p>
        </section>
      )}

      <section className="coordinator-card quiet-card">
        <div className="section-label">{t("studioCoordinator.durableEvents")}</div>
        <p>{acceptedEventCount} accepted narrative events available.</p>
        <p className="event-note">{storageStatus}</p>
        {latestAcceptedEvent ? (
          <p className="event-note">
            Latest: {latestAcceptedEvent.event_type} on {latestAcceptedEvent.payload.target_type}.
          </p>
        ) : null}
      </section>

      <section className="coordinator-card quiet-card">
        <div className="section-label">{t("studioCoordinator.revisionCheck")}</div>
        <p>{snapshotStatus}</p>
      </section>

      <section className="coordinator-card quiet-card">
        <div className="section-label">{t("studioCoordinator.contextProjection")}</div>
        <p>{contextProjectionStatus}</p>
      </section>

      <section className="coordinator-card quiet-card">
        <div className="section-label">{t("studioCoordinator.projectedState")}</div>
        <p>{characterState.characters.length} character state records in this session.</p>
        <p>{openLoopState.open_loops.length} open loop records in this session.</p>
        <p>{timelineState.timeline_events.length} timeline event records in this session.</p>
        {recentCharacters.length > 0 ? (
          <div className="state-list" aria-label="Recent character state">
            <div className="state-list-heading">Characters</div>
            {recentCharacters.map((character) => (
              <p className="event-note state-line" key={character.character_id}>
                <strong>{character.name}</strong>
                <span>{character.current_status}</span>
              </p>
            ))}
          </div>
        ) : null}
        {recentOpenLoops.length > 0 ? (
          <div className="state-list" aria-label="Recent open loop state">
            <div className="state-list-heading">Open loops</div>
            {recentOpenLoops.map((openLoop) => (
              <p className="state-line" key={openLoop.open_loop_id}>
                <strong>{openLoop.title}</strong>
                <span>{openLoop.status}</span>
              </p>
            ))}
          </div>
        ) : null}
        {recentTimelineEvents.length > 0 ? (
          <div className="state-list" aria-label="Recent timeline state">
            <div className="state-list-heading">Timeline</div>
            {recentTimelineEvents.map((timelineEvent) => (
              <p className="state-line" key={timelineEvent.timeline_event_id}>
                <strong>{timelineEvent.label}</strong>
                <span>{timelineEvent.summary}</span>
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
  roomAction,
  onSaveSelectedNotes,
}: {
  meeting: RoomMeeting;
  roomAction: "creating_cards" | "opening" | null;
  onSaveSelectedNotes: () => void;
}) {
  const hasSavedNotes = meeting.generated_proposals.length > 0;
  const isSavingNotes = roomAction === "creating_cards";
  const visibleParticipants = [
    { agent_id: "author", label: "Author", role: "Chair" },
    { agent_id: "assistant", label: "Assistant", role: "Meeting record" },
    ...meeting.perspectives.map((perspective) => ({
      agent_id: perspective.agent_id,
      label: perspective.label,
      role: "Invited perspective",
    })),
  ].slice(0, 8);

  return (
    <section className="coordinator-card room-card" aria-busy={isSavingNotes}>
      <div className="room-card-header">
        <div>
          <div className="section-label">{t("writersRoom.title")}</div>
          <h3>{meeting.question}</h3>
        </div>
        <span className="room-state-pill">
          {hasSavedNotes ? t("writersRoom.notesSaved") : t("writersRoom.meetingCompleted")}
        </span>
      </div>

      <div className="room-participants" aria-label="Meeting participants">
        {visibleParticipants.map((participant) => (
          <span className={participant.agent_id === "assistant" ? "participant-pill assistant" : "participant-pill"} key={participant.agent_id}>
            <span>{participant.label}</span>
            <small>{participant.role}</small>
          </span>
        ))}
      </div>

      <div className="room-transcript" aria-label="Meeting transcript">
        <article className="room-message author-message">
          <strong>Author</strong>
          <p>{meeting.question}</p>
        </article>
        <article className="room-message assistant-message">
          <strong>Assistant</strong>
          <p>
            I will keep this focused on the active chapter, Mira's agency, and any continuity notes worth saving.
          </p>
        </article>
        {meeting.perspectives.map((perspective) => (
          <article className="room-message agent-message" key={perspective.agent_id}>
            <strong>{perspective.label}</strong>
            <p>{perspective.observation}</p>
            <small>{perspective.suggested_check}</small>
          </article>
        ))}
      </div>

      <div className="meeting-record">
        <div className="meeting-record-header">
          <strong>{t("writersRoom.meetingRecord")}</strong>
          <span>{meeting.scope.chapters.length} linked chapter</span>
        </div>
        <p>{meeting.studio_coordinator_summary.summary}</p>
        <div className="record-note-list">
          {meeting.studio_coordinator_summary.follow_up_actions.map((action) => (
            <label className="record-note" key={action}>
              <input defaultChecked disabled type="checkbox" />
              <span>{action}</span>
            </label>
          ))}
        </div>
        <div className="meeting-record-actions">
          <button className="secondary-button" disabled>
            {t("writersRoom.keepAsRecord")}
          </button>
          <button className="primary-button compact" disabled={hasSavedNotes || isSavingNotes} onClick={onSaveSelectedNotes}>
            {isSavingNotes
              ? t("writersRoom.savingSelectedNotes")
              : hasSavedNotes
                ? t("writersRoom.notesSaved")
                : t("writersRoom.saveSelectedNotes")}
          </button>
        </div>
      </div>
    </section>
  );
}
