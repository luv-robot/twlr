import { useMemo, useState } from "react";
import type { StateProposal } from "@twlr/schema";
import { createMockCharacterProposal, demoChapterBody, demoChapters } from "../data/demoWorkspace";
import { AppRail } from "./AppRail";
import { ManuscriptEditor } from "./ManuscriptEditor";
import { ProjectNavigator } from "./ProjectNavigator";
import { StudioCoordinatorPanel } from "./StudioCoordinatorPanel";
import { TopBar } from "./TopBar";

export function AppShell() {
  const [proposals, setProposals] = useState<StateProposal[]>([]);
  const [acceptedEventCount, setAcceptedEventCount] = useState(0);

  const coordinatorItems = useMemo(
    () => [
      { count: String(proposals.length), label: "pending updates", tone: "proposal" as const },
      { count: "2", label: "unresolved threads", tone: "warning" as const },
      { count: "1", label: "possible timeline issue", tone: "risk" as const },
    ],
    [proposals.length],
  );

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
        autosaveLabel="Autosaved 12s ago"
        chapterTitle="Chapter 03 - A Name Removed"
        projectTitle="The Glass City"
      />
      <AppRail />
      <ProjectNavigator chapters={demoChapters} projectTitle="The Glass City" />
      <ManuscriptEditor
        metadata="2,418 words · Autosaved 12s ago · Draft"
        paragraphs={demoChapterBody}
        title="Chapter 03 - A Name Removed"
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
