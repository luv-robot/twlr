export type ProjectKind = "web_novel" | "script" | "light_novel" | "genre_fiction" | "other";
export type ChapterStatus = "outline" | "draft" | "revision" | "locked";
export type ProposalStatus = "pending" | "accepted" | "edited" | "rejected";
export type CoordinatorSeverity = "info" | "review" | "warning" | "risk";

export interface TwlrProject {
  schema_version: 1;
  project_id: string;
  title: string;
  kind: ProjectKind;
  language: string;
  created_at: string;
  updated_at: string;
  settings: {
    default_chapter_directory: "manuscript";
    snapshot_mode: "manual";
    developer_mode: boolean;
  };
}

export interface ChapterMetadata {
  id: string;
  title: string;
  order: number;
  status: ChapterStatus;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface StateProposal {
  proposal_id: string;
  created_at: string;
  status: ProposalStatus;
  summary: string;
  evidence: string[];
  affected: {
    chapters: string[];
    characters: string[];
    open_loops: string[];
    timeline_events: string[];
  };
}

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
  }>;
}
