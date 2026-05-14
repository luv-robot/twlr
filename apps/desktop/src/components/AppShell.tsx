import { useEffect, useMemo, useState } from "react";
import {
  applyCharacterEvents,
  applyOpenLoopEvents,
  countWords,
  createEmptyCharacterStateFile,
  createEmptyOpenLoopStateFile,
  proposalToNarrativeEvents,
  reviewStateProposal,
} from "@twlr/core";
import { createMockWritersRoomMeeting, createWritersRoomProposalCards, runMockProductionSkill } from "@twlr/ai";
import type { CharacterStateFile, NarrativeEvent, OpenLoopStateFile, RoomMeeting, StateProposal } from "@twlr/schema";
import { demoChapters } from "../data/demoWorkspace";
import {
  persistAcceptedProposal,
  persistCharacterState,
  persistOpenLoopState,
  persistRoomMeeting,
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
import { ProjectNavigator } from "./ProjectNavigator";
import { StudioCoordinatorPanel } from "./StudioCoordinatorPanel";
import { TopBar } from "./TopBar";

export function AppShell() {
  const [chapters, setChapters] = useState(demoChapters);
  const [activeChapterId, setActiveChapterId] = useState("03");
  const [projectTitle, setProjectTitle] = useState("The Glass City");
  const [proposals, setProposals] = useState<StateProposal[]>([]);
  const [autosaveLabel, setAutosaveLabel] = useState("Autosaved locally");
  const [changedChapterIds, setChangedChapterIds] = useState<Set<string>>(() => new Set());
  const [acceptedEvents, setAcceptedEvents] = useState<NarrativeEvent[]>([]);
  const [characterState, setCharacterState] = useState<CharacterStateFile>(() => createEmptyCharacterStateFile());
  const [openLoopState, setOpenLoopState] = useState<OpenLoopStateFile>(() => createEmptyOpenLoopStateFile());
  const [roomMeeting, setRoomMeeting] = useState<RoomMeeting | null>(null);
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [projectPathInput, setProjectPathInput] = useState("/private/tmp/twlr-glass-city");
  const [storageStatus, setStorageStatus] = useState("Demo session");
  const [workspaceStatus, setWorkspaceStatus] = useState("Demo workspace");
  const [snapshotStatus, setSnapshotStatus] = useState("No local snapshot status.");

  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0];
  const wordCount = countWords(activeChapter.body);
  const changedChapterCount = changedChapterIds.size;
  const acceptedEventCount = acceptedEvents.length;

  const coordinatorItems = useMemo(
    () => [
      { count: String(proposals.length), label: "pending updates", tone: "proposal" as const },
      { count: String(changedChapterCount), label: "changed chapters", tone: "warning" as const },
      { count: String(openLoopState.open_loops.length), label: "unresolved threads", tone: "warning" as const },
      { count: "1", label: "possible timeline issue", tone: "risk" as const },
    ],
    [changedChapterCount, openLoopState.open_loops.length, proposals.length],
  );

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

  async function saveSnapshot() {
    if (!projectPath) {
      setChangedChapterIds(new Set());
      setAutosaveLabel("Snapshot saved locally");
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
    }
  }

  async function openLocalProject() {
    const nextProjectPath = projectPathInput.trim();
    if (!nextProjectPath) {
      setWorkspaceStatus("Enter a local project path.");
      return;
    }

    setWorkspaceStatus("Opening local project...");
    try {
      const workspace = await loadLocalWorkspace(nextProjectPath);
      setProjectPath(nextProjectPath);
      setProjectTitle(workspace.project.title);
      setChapters(workspace.chapters);
      setActiveChapterId(workspace.chapters[0]?.id ?? "01");
      setChangedChapterIds(new Set());
      setWorkspaceStatus(`Opened ${workspace.project.title}`);
      setStorageStatus("Local project logs enabled.");
      refreshSnapshotStatus(nextProjectPath);
    } catch (error) {
      setWorkspaceStatus(error instanceof Error ? error.message : "Failed to open local project.");
    }
  }

  async function createProjectAtPath() {
    const nextProjectPath = projectPathInput.trim();
    if (!nextProjectPath) {
      setWorkspaceStatus("Enter a local project path.");
      return;
    }

    setWorkspaceStatus("Creating local project...");
    try {
      const workspace = await createLocalWorkspace(nextProjectPath, projectTitle);
      setProjectPath(nextProjectPath);
      setProjectTitle(workspace.project.title);
      setChapters(workspace.chapters);
      setActiveChapterId(workspace.chapters[0]?.id ?? "01");
      setChangedChapterIds(new Set());
      setWorkspaceStatus(`Created ${workspace.project.title}`);
      setStorageStatus("Local project logs enabled.");
      refreshSnapshotStatus(nextProjectPath);
    } catch (error) {
      setWorkspaceStatus(error instanceof Error ? error.message : "Failed to create local project.");
    }
  }

  async function createChapter() {
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
    }
  }

  async function refreshSnapshotStatus(nextProjectPath: string) {
    try {
      const status = await getWorkspaceSnapshotStatus(nextProjectPath);
      setSnapshotStatus(
        `${status.changed_files} changed files, ${status.changed_chapters} chapter files, ${status.changed_state_files} state files.`,
      );
    } catch (error) {
      setSnapshotStatus(error instanceof Error ? error.message : "Snapshot status unavailable.");
    }
  }

  function createMockProposal() {
    setProposals((current) => {
      if (current.some((proposal) => proposal.status === "pending")) {
        return current;
      }

      const proposal = runMockProductionSkill("character_sheet", {
        chapter_id: activeChapter.filePath?.replace("manuscript/", "").replace(".md", "") ?? `chapter_${activeChapter.id}`,
        chapter_title: activeChapter.title,
        selected_text: activeChapter.body.split("\n\n")[0],
      });

      return proposal ? [proposal, ...current] : current;
    });
  }

  async function acceptProposal(proposalId: string) {
    const proposal = proposals.find((item) => item.proposal_id === proposalId);
    if (!proposal) {
      return;
    }

    const reviewedProposal = reviewStateProposal({ proposal, decision: "accepted" });
    const events = proposalToNarrativeEvents(reviewedProposal);
    const nextCharacterState = applyCharacterEvents(characterState, events);
    const nextOpenLoopState = applyOpenLoopEvents(openLoopState, events);
    setAcceptedEvents((currentEvents) => [...events, ...currentEvents]);
    setCharacterState(nextCharacterState);
    setOpenLoopState(nextOpenLoopState);
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
      setStorageStatus(
        openLoopResult.status === "persisted"
          ? openLoopResult.message
          : stateResult.status === "persisted"
            ? stateResult.message
            : result.message,
      );
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : "Failed to persist event log.");
    }
  }

  function rejectProposal(proposalId: string) {
    setProposals((current) => current.filter((proposal) => proposal.proposal_id !== proposalId));
  }

  async function openWritersRoom() {
    const meeting = createMockWritersRoomMeeting();
    setRoomMeeting(meeting);
    setStorageStatus("Recording Writers' Room...");

    try {
      const result = await persistRoomMeeting(projectPath, meeting);
      setStorageStatus(result.message);
    } catch (error) {
      setStorageStatus(error instanceof Error ? error.message : "Failed to record Writers' Room.");
    }
  }

  function createProposalCardsFromRoom() {
    if (!roomMeeting) {
      return;
    }

    const generatedProposals = createWritersRoomProposalCards(roomMeeting);
    const generatedProposalIds = generatedProposals.map((proposal) => proposal.proposal_id);
    setProposals((current) => [
      ...generatedProposals.filter(
        (proposal) => !current.some((existingProposal) => existingProposal.proposal_id === proposal.proposal_id),
      ),
      ...current,
    ]);
    setRoomMeeting({
      ...roomMeeting,
      generated_proposals: Array.from(new Set([...roomMeeting.generated_proposals, ...generatedProposalIds])),
      author_decision: {
        decision: "create_proposal_cards",
        decided_at: new Date().toISOString(),
      },
    });
    setStorageStatus(`${generatedProposalIds.length} Writers' Room proposal card(s) ready for review.`);
  }

  return (
    <div className="app-shell">
      <TopBar
        autosaveLabel={autosaveLabel}
        changedChapterCount={changedChapterCount}
        chapterTitle={`Chapter ${activeChapter.id} - ${activeChapter.title}`}
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
        onSelectChapter={setActiveChapterId}
        projectPathInput={projectPathInput}
        projectTitle={projectTitle}
        workspaceStatus={workspaceStatus}
      />
      <ManuscriptEditor
        metadata={`${wordCount.toLocaleString()} words · Draft`}
        onChange={updateActiveChapter}
        title={`Chapter ${activeChapter.id} - ${activeChapter.title}`}
        value={activeChapter.body}
      />
      <StudioCoordinatorPanel
        acceptedEventCount={acceptedEventCount}
        characterState={characterState}
        items={coordinatorItems}
        latestAcceptedEvent={acceptedEvents[0]}
        openLoopState={openLoopState}
        onAcceptProposal={acceptProposal}
        onCreateRoomProposalCards={createProposalCardsFromRoom}
        onCreateMockProposal={createMockProposal}
        onOpenWritersRoom={openWritersRoom}
        onRejectProposal={rejectProposal}
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
