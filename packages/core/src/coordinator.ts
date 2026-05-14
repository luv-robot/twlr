import type { StudioCoordinatorStatus } from "@twlr/schema";

export interface CoordinatorMetricsInput {
  projectId: string;
  pendingProposals: number;
  unresolvedOpenLoops: number;
  changedChaptersSinceSnapshot: number;
  timelineConflicts: number;
  unreviewedMeetingFollowups: number;
  now?: string;
}

export function createStudioCoordinatorStatus(input: CoordinatorMetricsInput): StudioCoordinatorStatus {
  const alerts: StudioCoordinatorStatus["alerts"] = [];
  const nextActions: StudioCoordinatorStatus["next_actions"] = [];

  if (input.pendingProposals > 0) {
    alerts.push({
      severity: "review",
      message: `${input.pendingProposals} pending state updates need review.`,
    });
    nextActions.push({
      action_id: "review_pending_updates",
      label: "Review pending updates",
      target: "proposals",
    });
  }

  if (input.unresolvedOpenLoops > 0) {
    alerts.push({
      severity: "info",
      message: `${input.unresolvedOpenLoops} unresolved threads remain open.`,
    });
  }

  if (input.timelineConflicts > 0) {
    alerts.push({
      severity: "warning",
      message: `${input.timelineConflicts} possible timeline conflict needs review.`,
    });
    nextActions.push({
      action_id: "review_timeline",
      label: "Review timeline",
      target: "timeline",
    });
  }

  if (input.changedChaptersSinceSnapshot > 0) {
    nextActions.push({
      action_id: "review_impact",
      label: "Review affected chapters",
      target: "snapshots",
    });
  }

  return {
    generated_at: input.now ?? new Date().toISOString(),
    project_id: input.projectId,
    summary: [
      `${input.pendingProposals} pending updates`,
      `${input.unresolvedOpenLoops} unresolved threads`,
      `${input.timelineConflicts} possible timeline conflicts`,
    ].join(", "),
    metrics: {
      pending_proposals: input.pendingProposals,
      unresolved_open_loops: input.unresolvedOpenLoops,
      changed_chapters_since_snapshot: input.changedChaptersSinceSnapshot,
      timeline_conflicts: input.timelineConflicts,
      unreviewed_meeting_followups: input.unreviewedMeetingFollowups,
    },
    alerts,
    next_actions: nextActions,
  };
}
