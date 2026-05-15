import { useEffect, useState } from "react";
import { t } from "@twlr/ui";
import type { StateProposal } from "@twlr/schema";

interface ProposalCardProps {
  proposal: StateProposal;
  busyAction: "accept" | "reject" | null;
  onAccept: (proposalId: string) => void;
  onEdit: (proposalId: string, draft: { evidence: string; summary: string }) => void;
  onReject: (proposalId: string) => void;
}

export function ProposalCard({ busyAction, proposal, onAccept, onEdit, onReject }: ProposalCardProps) {
  const providerLabel = proposal.source.llm_provider === "remote" ? "Remote" : "Mock";
  const sourceLabel =
    proposal.source.kind === "writers_room" ? proposal.source.name : `${proposal.source.name} Proposal`;
  const kicker = `${sourceLabel} - ${providerLabel}`;
  const [isEditing, setIsEditing] = useState(false);
  const [draftSummary, setDraftSummary] = useState(proposal.summary);
  const [draftEvidence, setDraftEvidence] = useState(proposal.evidence[0] ?? "");
  const isBusy = Boolean(busyAction);
  const canSaveEdit = draftSummary.trim().length > 0 && !isBusy;

  useEffect(() => {
    setDraftSummary(proposal.summary);
    setDraftEvidence(proposal.evidence[0] ?? "");
  }, [proposal.evidence, proposal.summary]);

  function saveEdit() {
    onEdit(proposal.proposal_id, {
      evidence: draftEvidence,
      summary: draftSummary,
    });
    setIsEditing(false);
  }

  return (
    <section className="proposal-card" aria-busy={isBusy}>
      <div className="proposal-kicker">{kicker}</div>
      {isEditing ? (
        <textarea
          className="proposal-edit-field summary"
          onChange={(event) => setDraftSummary(event.target.value)}
          value={draftSummary}
        />
      ) : (
        <h3>{proposal.summary}</h3>
      )}
      <div className="proposal-scope">
        <span>{proposal.affected.chapters.length} chapter</span>
        <span>{proposal.affected.characters.length} character</span>
        <span>{proposal.affected.open_loops.length} unresolved thread</span>
        {proposal.affected.timeline_events.length > 0 ? (
          <span>{proposal.affected.timeline_events.length} timeline event</span>
        ) : null}
      </div>
      <div className="proposal-evidence">
        <strong>{t("proposal.evidence")}</strong>
        {isEditing ? (
          <textarea
            className="proposal-edit-field evidence"
            onChange={(event) => setDraftEvidence(event.target.value)}
            value={draftEvidence}
          />
        ) : (
          <p>{proposal.evidence[0]}</p>
        )}
      </div>
      <div className="proposal-actions">
        {isEditing ? (
          <>
            <button className="secondary-button" disabled={isBusy} onClick={() => setIsEditing(false)}>
              {t("proposal.cancel")}
            </button>
            <button className="primary-button compact" disabled={!canSaveEdit} onClick={saveEdit}>
              {t("proposal.save")}
            </button>
          </>
        ) : (
          <>
            <button className="secondary-button" disabled={isBusy} onClick={() => onReject(proposal.proposal_id)}>
              {busyAction === "reject" ? t("proposal.rejecting") : t("proposal.reject")}
            </button>
            <button className="secondary-button" disabled={isBusy} onClick={() => setIsEditing(true)}>
              {t("proposal.edit")}
            </button>
            <button className="primary-button compact" disabled={isBusy} onClick={() => onAccept(proposal.proposal_id)}>
              {busyAction === "accept" ? t("proposal.accepting") : t("proposal.accept")}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
