import { useEffect, useMemo, useState } from "react";
import {
  applyCharacterEvents,
  applyOpenLoopEvents,
  applyTimelineEvents,
  buildChapterContextProjection,
  countWords,
  createEmptyCharacterStateFile,
  createEmptyOpenLoopStateFile,
  createEmptyTimelineStateFile,
  editProposalDraft,
  proposalToNarrativeEvents,
  reviewStateProposal,
} from "@twlr/core";
import {
  createMockWritersRoomMeeting,
  createWritersRoomProposalCards,
  type ProductionSkillId,
} from "@twlr/ai";
import type {
  CharacterStateFile,
  NarrativeEvent,
  OpenLoopStateFile,
  RoomMeeting,
  StateProposal,
  TimelineStateFile,
} from "@twlr/schema";
import { demoChapters } from "../data/demoWorkspace";
import { getAiProviderStatus, runProductionSkill } from "../services/aiSkillRunner";
import {
  persistAcceptedProposal,
  persistCharacterState,
  persistOpenLoopState,
  persistPendingProposals,
  persistReviewedProposal,
  persistRoomMeeting,
  persistTimelineState,
} from "../services/projectPersistence";
import {
  createLocalWorkspace,
  createWorkspaceChapter,
  getWorkspaceSnapshotStatus,
  loadLocalWorkspace,
  saveWorkspaceChapter,
  saveWorkspaceSnapshot,
} from "../services/workspaceAdapter";
import { AppRail } from "./AppRail";
import { ManuscriptEditor } from "./ManuscriptEditor";
import { ProjectNavigator, type WorkspaceAction } from "./ProjectNavigator";
import { StudioCoordinatorPanel } from "./StudioCoordinatorPanel";
import { TopBar } from "./TopBar";
import { WritersRoomWorkspace } from "./WritersRoomWorkspace";

type ProposalReviewAction = {
  action: "accept" | "reject";
  proposalId: string;
} | null;

type RoomAction = "creating_cards" | "opening" | null;

export function AppShell() {
  const [chapters, setChapters] = useState(demoChapters);
  const [activeChapterId, setActiveChapterId] = useState("03");
  const [projectTitle, setProjectTitle] = useState("The Glass City");
  const [proposals, setProposals] = useState<StateProposal[]>([]);
  const [autosaveLabel, setAutosaveLabel] = useState("Autosaved locally");
  const [changedChapterIds, setChangedChapterIds] = useState<Set<string>>(() => new Set());
  const [changedProjectFileCount, setChangedProjectFileCount] = useState(0);
  const [acceptedEvents, setAcceptedEvents] = useState<NarrativeEvent[]>([]);
  const [characterState, setCharacterState] = useState<CharacterStateFile>(() => createEmptyCharacterStateFile());
  const [openLoopState, setOpenLoopState] = useState<OpenLoopStateFile>(() => createEmptyOpenLoopStateFile());
  const [timelineState, setTimelineState] = useState<TimelineStateFile>(() => createEmptyTimelineStateFile());
  const [roomMeeting, setRoomMeeting] = useState<RoomMeeting | null>(null);
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [projectPathInput, setProjectPathInput] = useState("/private/tmp/twlr-glass-city");
  const [storageStatus, setStorageStatus] = useState("Demo session");
  const [workspaceStatus, setWorkspaceStatus] = useState("Demo workspace");
  const [snapshotStatus, setSnapshotStatus] = useState("No revision check yet.");
  const [contextProjectionStatus, setContextProjectionStatus] = useState("No context packet built in this session.");
  const [isCheckingImpact, setIsCheckingImpact] = useState(false);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [proposalReviewAction, setProposalReviewAction] = useState<ProposalReviewAction>(null);
  const [roomAction, setRoomAction] = useState<RoomAction>(null);
  const [runningSkillId, setRunningSkillId] = useState<ProductionSkillId | null>(null);
  const [workspaceAction, setWorkspaceAction] = useState<WorkspaceAction>(null);
  const [isWritersRoomVisible, setIsWritersRoomVisible] = useState(false);

  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0];
  const wordCount = countWords(activeChapter.body);
  const changedChapterCount = changedChapterIds.size;
  const changedItemCount = projectPath ? changedProjectFileCount : changedChapterCount;
  const acceptedEventCount = acceptedEvents.length;
  const timelineIssueCount = timelineState.timeline_events.filter(
    (event) => event.certainty === "needs_review" || event.certainty === "contradicted",
  ).length;

  const coordinatorItems = useMemo(
    () => [
      { count: String(proposals.length), label: "pending updates", tone: "proposal" as const },
      { count: String(changedChapterCount), label: "changed chapters", tone: "warning" as const },
      { count: String(openLoopState.open_loops.length), label: "unresolved threads", tone: "warning" as const },
      { count: String(timelineIssueCount), label: formatTimelineIssueLabel(timelineIssueCount), tone: "risk" as const },
    ],
    [changedChapterCount, openLoopState.open_loops.length, proposals.length, timelineIssueCount],
  );

  useEffect(() => {
    void getAiProviderStatus()
      .then(setStorageStatus)
      .catch((error) => setStorageStatus(error instanceof Error ? error.message : "AI provider status unavailable."));
  }, []);

  useEffect(() => {
    if (autosaveLabel !== "Saving locally...") {
      return;
    }

    const saveTimer = window.setTimeout(async () => {
      if (projectPath && activeChapter.filePath) {
        try {
          await saveWorkspaceChapter(projectPath, activeChapter);
          setAutosaveLabel("Autosaved to project folder");
          refreshSnapshotStatus(projectPath);
        } catch (error) {
          setAutosaveLabel(error instanceof Error ? error.message : "Autosave failed");
        }
        return;
      }

      setAutosaveLabel("Autosaved locally");
    }, 500);
    return () => window.clearTimeout(saveTimer);
  }, [activeChapter, autosaveLabel, projectPath]);

  function updateActiveChapter(body: string) {
    setAutosaveLabel("Saving locally...");
    setChangedChapterIds((current) => {
      const next = new Set(current);
      next.add(activeChapterId);
      return next;
    });
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === activeChapterId
          ? {
              ...chapter,
              body,
              meta: formatCompactWordCount(countWords(body)),
            }
          : chapter,
      ),
    );
  }

  function selectChapter(chapterId: string) {
    setActiveChapterId(chapterId);
    setIsWritersRoomVisible(false);
  }

  async function saveSnapshot() {
    if (isSavingSnapshot) {
      return;
    }

    setIsSavingSnapshot(true);
    if (!projectPath) {
      setChangedChapterIds(new Set());
      setChangedProjectFileCount(0);
      setAutosaveLabel("Snapshot saved locally");
      setIsSavingSnapshot(false);
      return;
    }

    setAutosaveLabel("Saving snapshot...");
    try {
      const snapshot = await saveWorkspaceSnapshot(projectPath, `TWLR snapshot - ${new Date().toISOString()}`);
      setChangedChapterIds(new Set());
      setAutosaveLabel(
        snapshot.snapshot_id === "none"
          ? "No changes to snapshot"
          : `Snapshot saved ${snapshot.snapshot_id}`,
      );
      refreshSnapshotStatus(projectPath);
    } catch (error) {
      setAutosaveLabel(error instanceof Error ? error.message : "Snapshot failed");
    } finally {
      setIsSavingSnapshot(false);
    }
  }

  async function openLocalProject() {
    if (workspaceAction) {
      return;
    }

    const nextProjectPath = projectPathInput.trim();
    if (!nextProjectPath) {
      setWorkspaceStatus("Enter a local project path.");
      return;
    }

    setWorkspaceAction("opening");
    setWorkspaceStatus("Opening local project...");
    try {
      const workspace = await loadLocalWorkspace(nextProjectPath);
      setProjectPath(nextProjectPath);
      setProjectTitle(workspace.project.title);
      setChapters(workspace.chapters);
      setCharacterState(workspace.characterState);
      setOpenLoopState(workspace.openLoopState);
      setTimelineState(workspace.timelineState);
      setProposals(workspace.proposals);
      setRoomMeeting(null);
      setAcceptedEvents(workspace.events);
      setActiveChapterId(workspace.chapters[0]?.id ?? "01");
      setChangedChapterIds(new Set());
      setChangedProjectFileCount(0);
      setWorkspaceStatus(`Opened ${workspace.project.title}`);
      setStorageStatus("Local project logs enabled.");
      refreshSnapshotStatus(nextProjectPath);
    } catch (error) {
      setWorkspaceStatus(error instanceof Error ? error.message : "Failed to open local project.");
    } finally {
      setWorkspaceAction(null);
    }
  }

  async function createProjectAtPath() {
    if (workspaceAction) {
      return;
    }

    const nextProjectPath = projectPathInput.trim();
    if (!nextProjectPath) {
      setWorkspaceStatus("Enter a local project path.");
      return;
    }

    setWorkspaceAction("creating");
    setWorkspaceStatus("Creating local project...");
    try {
      const workspace = await createLocalWorkspace(nextProjectPath, projectTitle);
      setProjectPath(nextProjectPath);
      setProjectTitle(workspace.project.title);
      setChapters(workspace.chapters);
      setCharacterState(workspace.characterState);
      setOpenLoopState(workspace.openLoopState);
      setTimelineState(workspace.timelineState);
      setProposals(workspace.proposals);
      setRoomMeeting(null);
      setAcceptedEvents(workspace.events);
      setActiveChapterId(workspace.chapters[0]?.id ?? "01");
      setChangedChapterIds(new Set());
      setChangedProjectFileCount(0);
      setWorkspaceStatus(`Created ${workspace.project.title}`);
      setStorageStatus("Local project logs enabled.");
      refreshSnapshotStatus(nextProjectPath);
    } catch (error) {
      setWorkspaceStatus(error instanceof Error ? error.message : "Failed to create local project.");
    } finally {
      setWorkspaceAction(null);
    }
  }

  async function createChapter() {
    if (workspaceAction) {
      return;
    }

    setWorkspaceAction("creating_chapter");
    const nextIndex = chapters.length + 1;
    const title = `Untitled Chapter ${nextIndex}`;

    if (!projectPath) {
      const id = String(nextIndex).padStart(2, "0");
      setChapters((current) => [
        ...current,
        {
          id,
          title,
          meta: "Draft",
          state: "active",
          body: `# ${title}\n\n`,
          content: "",
          filePath: null,
        },
      ]);
      setActiveChapterId(id);
      setWorkspaceStatus("Created demo chapter.");
      setWorkspaceAction(null);
      return;
    }

    setWorkspaceStatus("Creating chapter...");
    try {
      const chapter = await createWorkspaceChapter(projectPath, title, nextIndex - 1);
      setChapters((current) => [...current, { ...chapter, state: "active" }]);
      setActiveChapterId(chapter.id);
      setWorkspaceStatus(`Created ${chapter.title}`);
      refreshSnapshotStatus(projectPath);
    } catch (error) {
      setWorkspaceStatus(error instanceof Error ? error.message : "Failed to create chapter.");
    } finally {
      setWorkspaceAction(null);
    }
  }

  async function refreshSnapshotStatus(nextProjectPath: string) {
    try {
      const status = await getWorkspaceSnapshotStatus(nextProjectPath);
      setChangedProjectFileCount(status.changed_files);
      setSnapshotStatus(
        formatRevisionCheck(status.changed_files, status.changed_chapters, status.changed_state_files, status.changed_areas),
      );
    } catch (error) {
      setSnapshotStatus(error instanceof Error ? error.message : "Snapshot status unavailable.");
    }
  }

  async function checkAffectedChapters() {
    if (isCheckingImpact) {
      return;
    }

    setIsCheckingImpact(true);
    if (!projectPath) {
      setSnapshotStatus(`${changedChapterCount} changed chapters in this demo session.`);
      setStorageStatus("Affected chapter check is local to this demo session.");
      setIsCheckingImpact(false);
      return;
    }

    setSnapshotStatus("Checking affected chapters...");
    try {
      await refreshSnapshotStatus(projectPath);
      setStorageStatus("Affected chapter check refreshed.");
    } finally {
      setIsCheckingImpact(false);
    }
  }

  function createMockProposal() {
    void createSkillProposal("character_sheet");
  }

  function createOutlineProposal() {
    void createSkillProposal("outline_builder");
  }

  function createTimelineProposal() {
    void createSkillProposal("timeline_compiler");
  }

  function createForeshadowProposal() {
    void createSkillProposal("foreshadow_tracker");
  }

  async function createSkillProposal(skillId: ProductionSkillId) {
    if (runningSkillId) {
      return;
    }

    setRunningSkillId(skillId);
    const selectedText = activeChapter.body.split("\n\n")[0];
    const contextPacket = buildActiveChapterContextProjection("production_skill", selectedText);
    setContextProjectionStatus(
      `Projected ${contextPacket.current_chapter.word_count} words, ${contextPacket.characters.length} characters, ${contextPacket.open_loops.length} open loops, ${contextPacket.recent_events.length} events.`,
    );

    try {
      const result = await runProductionSkill(skillId, {
        chapter_id: activeChapter.filePath?.replace("manuscript/", "").replace(".md", "") ?? `chapter_${activeChapter.id}`,
        chapter_title: activeChapter.title,
        selected_text: selectedText,
        context_packet: contextPacket,
      });
      const proposal = result.proposal;
      setStorageStatus(result.message);

      if (!proposal) {
        return;
      }

      const isOpenAiFallback = proposal.source.llm_provider === "mock" && result.message.includes("OpenAI");

      setProposals((current) => {
        const existingSameSkill = current.find(
          (item) =>
            item.status === "pending" &&
            item.source.kind === proposal.source.kind &&
            item.source.name === proposal.source.name,
        );

        if (existingSameSkill && proposal.source.llm_provider !== "remote") {
          return current;
        }

        void savePendingProposalCards([proposal], { silent: isOpenAiFallback });
        if (existingSameSkill) {
          return current.map((item) => (item.proposal_id === existingSameSkill.proposal_id ? proposal : item));
        }

        return [proposal, ...current];
      });

      if (isOpenAiFallback) {
        setStorageStatus(result.message);
      }
    } finally {
      setRunningSkillId(null);
    }
  }

  async function acceptProposal(proposalId: string) {
    if (proposalReviewAction) {
      return;
    }

    const proposal = proposals.find((item) => item.proposal_id === proposalId);
    if (!proposal) {
      return;
    }

    setProposalReviewAction({ action: "accept", proposalId });
    const reviewedProposal = reviewStateProposal({ proposal, decision: "accepted" });
    const events = proposalToNarrativeEvents(reviewedProposal);
    const nextCharacterState = applyCharacterEvents(characterState, events);
    const nextOpenLoopState = applyOpenLoopEvents(openLoopState, events);
    const nextTimelineState = applyTimelineEvents(timelineState, events);
    setAcceptedEvents((currentEvents) => [...events, ...currentEvents]);
    setCharacterState(nextCharacterState);
    setOpenLoopState(nextOpenLoopState);
    setTimelineState(nextTimelineState);
    setProposals((current) => current.filter((item) => item.proposal_id !== proposalId));
    setStorageStatus("Saving event log...");

    try {
      const result = await persistAcceptedProposal({
        events,
        projectPath,
        proposal: reviewedProposal,
      });
      const stateResult = await persistCharacterState(projectPath, nextCharacterState);
      const openLoopResult = await persistOpenLoopState(projectPath, nextOpenLoopState);
      const timelineResult = await persistTimelineState(projectPath, nextTimelineState);
      setStorageStatus(
        timelineResult.status === "persisted" ||
          openLoopResult.status === "persisted" ||
          stateResult.status === "persisted"
          ? `Accepted proposal: ${events.length} event(s) committed; projected state updated.`
          : result.message,
      );
      if (projectPath) {
        await refreshSnapshotStatus(projectPath);
      }
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : "Failed to persist event log.");
    } finally {
      setProposalReviewAction(null);
    }
  }

  async function rejectProposal(proposalId: string) {
    if (proposalReviewAction) {
      return;
    }

    const proposal = proposals.find((item) => item.proposal_id === proposalId);
    if (!proposal) {
      return;
    }

    setProposalReviewAction({ action: "reject", proposalId });
    const reviewedProposal = reviewStateProposal({ proposal, decision: "rejected" });
    setProposals((current) => current.filter((item) => item.proposal_id !== proposalId));
    try {
      await saveReviewedProposal(reviewedProposal);
    } finally {
      setProposalReviewAction(null);
    }
  }

  function editProposal(proposalId: string, draft: { evidence: string; summary: string }) {
    const proposal = proposals.find((item) => item.proposal_id === proposalId);
    if (!proposal) {
      return;
    }

    const editedProposal = editProposalDraft({
      proposal,
      summary: draft.summary,
      evidence: draft.evidence,
    });
    setProposals((current) => current.map((item) => (item.proposal_id === proposalId ? editedProposal : item)));
    setStorageStatus("Proposal edit saved locally.");
    void savePendingProposalCards([editedProposal]);
  }

  async function openWritersRoom() {
    if (roomAction) {
      return;
    }

    if (roomMeeting) {
      setIsWritersRoomVisible(true);
      return;
    }

    setRoomAction("opening");
    const contextPacket = buildActiveChapterContextProjection("writers_room", null);
    const meeting = createMockWritersRoomMeeting();
    setRoomMeeting(meeting);
    setIsWritersRoomVisible(true);
    setContextProjectionStatus(
      `Projected Writers' Room packet: ${contextPacket.current_chapter.word_count} words, ${contextPacket.characters.length} characters, ${contextPacket.open_loops.length} open loops.`,
    );
    setStorageStatus("Recording Writers' Room meeting...");

    try {
      const result = await persistRoomMeeting(projectPath, meeting);
      setStorageStatus(result.message);
      if (projectPath && result.status === "persisted") {
        await refreshSnapshotStatus(projectPath);
      }
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : "Failed to record Writers' Room.");
    } finally {
      setRoomAction(null);
    }
  }

  function buildActiveChapterContextProjection(
    task: "production_skill" | "writers_room",
    selectedText: string | null,
  ) {
    return buildChapterContextProjection({
      task,
      chapter: {
        chapter_id: activeChapter.filePath?.replace("manuscript/", "").replace(".md", "") ?? `chapter_${activeChapter.id}`,
        title: activeChapter.title,
        body: activeChapter.body,
        file_path: activeChapter.filePath,
        metadata: {
          id: activeChapter.id,
          status: activeChapter.state,
        },
      },
      characterState,
      openLoopState,
      events: acceptedEvents,
      selectedText,
    });
  }

  async function saveSelectedRoomNotes() {
    if (!roomMeeting || roomAction) {
      return;
    }

    setRoomAction("creating_cards");
    const generatedProposals = createWritersRoomProposalCards(roomMeeting);
    const generatedProposalIds = generatedProposals.map((proposal) => proposal.proposal_id);
    let proposalsToPersist: StateProposal[] = [];
    setProposals((current) => {
      proposalsToPersist = generatedProposals.filter(
        (proposal) => !current.some((existingProposal) => existingProposal.proposal_id === proposal.proposal_id),
      );
      return [...proposalsToPersist, ...current];
    });
    setRoomMeeting({
      ...roomMeeting,
      generated_proposals: Array.from(new Set([...roomMeeting.generated_proposals, ...generatedProposalIds])),
      author_decision: {
        decision: "save_selected_notes",
        decided_at: new Date().toISOString(),
      },
    });
    try {
      await savePendingProposalCards(proposalsToPersist);
      setStorageStatus(`${generatedProposalIds.length} Writers' Room note(s) saved for review.`);
    } finally {
      setRoomAction(null);
    }
  }

  async function savePendingProposalCards(nextProposals: StateProposal[], options?: { silent?: boolean }) {
    try {
      const result = await persistPendingProposals(projectPath, nextProposals);
      if (result.status === "persisted" && !options?.silent) {
        setStorageStatus(result.message);
      }
      if (result.status === "persisted" && projectPath) {
        await refreshSnapshotStatus(projectPath);
      }
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : "Failed to persist pending review items.");
    }
  }

  async function saveReviewedProposal(proposal: StateProposal) {
    try {
      const result = await persistReviewedProposal(projectPath, proposal);
      setStorageStatus(result.message);
      if (result.status === "persisted" && projectPath) {
        await refreshSnapshotStatus(projectPath);
      }
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : "Failed to persist reviewed proposal.");
    }
  }

  const activeChapterTitle = `Chapter ${activeChapter.id} - ${activeChapter.title}`;

  return (
    <div className="app-shell">
      <TopBar
        autosaveLabel={autosaveLabel}
        changedItemCount={changedItemCount}
        chapterTitle={isWritersRoomVisible ? `Writers' Room - ${activeChapterTitle}` : activeChapterTitle}
        isSavingSnapshot={isSavingSnapshot}
        onSaveSnapshot={saveSnapshot}
        projectTitle={projectTitle}
      />
      <AppRail />
      <ProjectNavigator
        activeChapterId={activeChapter.id}
        chapters={chapters}
        onCreateChapter={createChapter}
        onCreateLocalProject={createProjectAtPath}
        onOpenLocalProject={openLocalProject}
        onProjectPathInput={setProjectPathInput}
        onSelectChapter={selectChapter}
        projectPathInput={projectPathInput}
        projectTitle={projectTitle}
        workspaceAction={workspaceAction}
        workspaceStatus={workspaceStatus}
      />
      {isWritersRoomVisible && roomMeeting ? (
        <WritersRoomWorkspace
          chapterTitle={activeChapterTitle}
          meeting={roomMeeting}
          onBackToManuscript={() => setIsWritersRoomVisible(false)}
          onSaveSelectedNotes={saveSelectedRoomNotes}
          roomAction={roomAction}
        />
      ) : (
        <ManuscriptEditor
          metadata={`${wordCount.toLocaleString()} words · Draft`}
          onChange={updateActiveChapter}
          title={activeChapterTitle}
          value={activeChapter.body}
        />
      )}
      <StudioCoordinatorPanel
        acceptedEventCount={acceptedEventCount}
        characterState={characterState}
        contextProjectionStatus={contextProjectionStatus}
        isCheckingImpact={isCheckingImpact}
        items={coordinatorItems}
        latestAcceptedEvent={acceptedEvents[0]}
        openLoopState={openLoopState}
        proposalReviewAction={proposalReviewAction}
        timelineState={timelineState}
        runningSkillId={runningSkillId}
        roomAction={roomAction}
        onAcceptProposal={acceptProposal}
        onCheckAffectedChapters={checkAffectedChapters}
        onCreateForeshadowProposal={createForeshadowProposal}
        onCreateMockProposal={createMockProposal}
        onCreateOutlineProposal={createOutlineProposal}
        onCreateTimelineProposal={createTimelineProposal}
        onEditProposal={editProposal}
        onOpenWritersRoom={openWritersRoom}
        onRejectProposal={rejectProposal}
        onSaveRoomNotes={saveSelectedRoomNotes}
        proposals={proposals}
        roomMeeting={roomMeeting}
        snapshotStatus={snapshotStatus}
        storageStatus={storageStatus}
      />
    </div>
  );
}

function formatCompactWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }

  return String(count);
}

function formatRevisionCheck(
  changedFiles: number,
  changedChapters: number,
  changedStateAreas: number,
  changedAreas: string[] = [],
): string {
  if (changedFiles === 0) {
    return "No project changes since the last snapshot.";
  }

  const chapterLabel = changedChapters === 1 ? "chapter" : "chapters";
  const stateLabel = changedStateAreas === 1 ? "state area" : "state areas";
  const areaSummary = changedAreas.length > 0 ? ` Review: ${changedAreas.slice(0, 4).join(", ")}.` : "";

  return `${changedFiles} project file(s) changed; ${changedChapters} ${chapterLabel} changed; ${changedStateAreas} ${stateLabel} may need review.${areaSummary}`;
}

function formatTimelineIssueLabel(count: number): string {
  return count === 1 ? "possible timeline issue" : "possible timeline issues";
}
