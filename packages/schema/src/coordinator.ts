export type CoordinatorSeverity = "info" | "review" | "warning" | "risk";

export interface StudioCoordinatorStatus {
  generated_at: string;
  project_id: string;
  summary: string;
  metrics: {
    pending_proposals: number;
    unresolved_open_loops: number;
    changed_chapters_since_snapshot: number;
    timeline_conflicts: number;
    unreviewed_meeting_followups: number;
  };
  alerts: Array<{
    severity: CoordinatorSeverity;
    message: string;
    related?: {
      chapters?: string[];
      open_loops?: string[];
      proposals?: string[];
      meetings?: string[];
    };
  }>;
  next_actions: Array<{
    action_id: string;
    label: string;
    target: "proposals" | "open_loops" | "timeline" | "snapshots" | "writers_room";
  }>;
}
