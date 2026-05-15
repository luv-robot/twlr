import { t } from "@twlr/ui";
import type { RoomMeeting } from "@twlr/schema";

interface WritersRoomWorkspaceProps {
  chapterTitle: string;
  meeting: RoomMeeting;
  roomAction: "creating_cards" | "opening" | null;
  onBackToManuscript: () => void;
  onSaveSelectedNotes: () => void;
}

export function WritersRoomWorkspace({
  chapterTitle,
  meeting,
  roomAction,
  onBackToManuscript,
  onSaveSelectedNotes,
}: WritersRoomWorkspaceProps) {
  const hasSavedNotes = meeting.generated_proposals.length > 0;
  const isSavingNotes = roomAction === "creating_cards";
  const participants = [
    { agent_id: "author", label: "Author", role: "Chair" },
    { agent_id: "assistant", label: "Assistant", role: "Meeting record" },
    ...meeting.perspectives.map((perspective) => ({
      agent_id: perspective.agent_id,
      label: perspective.label,
      role: "Invited perspective",
    })),
  ].slice(0, 8);

  return (
    <main className="writers-room-workspace">
      <header className="writers-room-topline">
        <div>
          <p>{chapterTitle}</p>
          <h1>{t("writersRoom.title")}</h1>
        </div>
        <button className="secondary-button" onClick={onBackToManuscript}>
          {t("writersRoom.backToManuscript")}
        </button>
      </header>

      <section className="meeting-shell">
        <div className="meeting-main">
          <div className="meeting-main-header">
            <div>
              <span className="meeting-state">{t("writersRoom.meetingCompleted")}</span>
              <h2>{meeting.question}</h2>
            </div>
            <span className="meeting-count">
              {participants.length} {t("writersRoom.participants")}
            </span>
          </div>

          <div className="meeting-participant-row" aria-label="Meeting participants">
            {participants.map((participant) => (
              <span
                className={participant.agent_id === "assistant" ? "meeting-person assistant" : "meeting-person"}
                key={participant.agent_id}
              >
                <strong>{participant.label}</strong>
                <small>{participant.role}</small>
              </span>
            ))}
          </div>

          <div className="meeting-thread" aria-label="Writers' Room transcript">
            <article className="meeting-bubble author">
              <div className="meeting-speaker">Author</div>
              <p>{meeting.question}</p>
            </article>
            <article className="meeting-bubble assistant">
              <div className="meeting-speaker">Assistant</div>
              <p>
                I will keep this focused on the active chapter, Mira's agency, and any continuity notes worth saving.
              </p>
            </article>
            {meeting.perspectives.map((perspective) => (
              <article className="meeting-bubble agent" key={perspective.agent_id}>
                <div className="meeting-speaker">{perspective.label}</div>
                <p>{perspective.observation}</p>
                <small>{perspective.suggested_check}</small>
              </article>
            ))}
          </div>
        </div>

        <aside className="meeting-notes-panel">
          <div className="meeting-notes-header">
            <span>{t("writersRoom.meetingRecord")}</span>
            <strong>
              {meeting.scope.chapters.length} {t("writersRoom.linkedChapter")}
            </strong>
          </div>
          <p>{meeting.studio_coordinator_summary.summary}</p>
          <div className="meeting-note-options">
            {meeting.studio_coordinator_summary.follow_up_actions.map((action) => (
              <label className="meeting-note-option" key={action}>
                <input defaultChecked disabled type="checkbox" />
                <span>{action}</span>
              </label>
            ))}
          </div>
          <div className="meeting-note-actions">
            <button className="secondary-button" disabled>
              {t("writersRoom.keepAsRecord")}
            </button>
            <button
              className="primary-button compact"
              disabled={hasSavedNotes || isSavingNotes}
              onClick={onSaveSelectedNotes}
            >
              {isSavingNotes
                ? t("writersRoom.savingSelectedNotes")
                : hasSavedNotes
                  ? t("writersRoom.notesSaved")
                  : t("writersRoom.saveSelectedNotes")}
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
