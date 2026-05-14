import { useEffect, useMemo, useState } from "react";
import { countWords } from "@twlr/core";
import type { StateProposal } from "@twlr/schema";
import { createMockCharacterProposal, demoChapters } from "../data/demoWorkspace";
import { AppRail } from "./AppRail";
import { ManuscriptEditor } from "./ManuscriptEditor";
import { ProjectNavigator } from "./ProjectNavigator";
import { StudioCoordinatorPanel } from "./StudioCoordinatorPanel";
import { TopBar } from "./TopBar";

export function AppShell() {
  const [chapters, setChapters] = useState(demoChapters);
  const [activeChapterId, setActiveChapterId] = useState("03");
  const [proposals, setProposals] = useState<StateProposal[]>([]);
  const [acceptedEventCount, setAcceptedEventCount] = useState(0);
  const [autosaveLabel, setAutosaveLabel] = useState("Autosaved locally");
  const [changedChapterIds, setChangedChapterIds] = useState<Set<string>>(() => new Set());

  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0];
  const wordCount = countWords(activeChapter.body);
  const changedChapterCount = changedChapterIds.size;

  const coordinatorItems = useMemo(
    () => [
      { count: String(proposals.length), label: "pending updates", tone: "proposal" as const },
      { count: String(changedChapterCount), label: "changed chapters", tone: "warning" as const },
      { count: "2", label: "unresolved threads", tone: "warning" as const },
      { count: "1", label: "possible timeline issue", tone: "risk" as const },
    ],
    [changedChapterCount, proposals.length],
  );

  useEffect(() => {
    if (autosaveLabel !== "Saving locally...") {
      return;
    }

    const saveTimer = window.setTimeout(() => setAutosaveLabel("Autosaved locally"), 500);
    return () => window.clearTimeout(saveTimer);
  }, [autosaveLabel]);

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

  function saveSnapshot() {
    setChangedChapterIds(new Set());
    setAutosaveLabel("Snapshot saved locally");
  }

  function createMockProposal() {
    setProposals((current) => {
      if (current.some((proposal) => proposal.status === "pending")) {
        return current;
      }

      return [createMockCharacterProposal(), ...current];
    });
  }

  function acceptProposal(proposalId: string) {
    setProposals((current) => current.filter((proposal) => proposal.proposal_id !== proposalId));
    setAcceptedEventCount((count) => count + 1);
  }

  function rejectProposal(proposalId: string) {
    setProposals((current) => current.filter((proposal) => proposal.proposal_id !== proposalId));
  }

  return (
    <div className="app-shell">
      <TopBar
        autosaveLabel={autosaveLabel}
        changedChapterCount={changedChapterCount}
        chapterTitle={`Chapter ${activeChapter.id} - ${activeChapter.title}`}
        onSaveSnapshot={saveSnapshot}
        projectTitle="The Glass City"
      />
      <AppRail />
      <ProjectNavigator
        activeChapterId={activeChapter.id}
        chapters={chapters}
        onSelectChapter={setActiveChapterId}
        projectTitle="The Glass City"
      />
      <ManuscriptEditor
        metadata={`${wordCount.toLocaleString()} words · Draft`}
        onChange={updateActiveChapter}
        title={`Chapter ${activeChapter.id} - ${activeChapter.title}`}
        value={activeChapter.body}
      />
      <StudioCoordinatorPanel
        acceptedEventCount={acceptedEventCount}
        items={coordinatorItems}
        onAcceptProposal={acceptProposal}
        onCreateMockProposal={createMockProposal}
        onRejectProposal={rejectProposal}
        proposals={proposals}
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
