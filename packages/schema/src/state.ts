export interface WorkState {
  schema_version: 1;
  work_id: string;
  title: string;
  genre: string[];
  format: string;
  current_phase: string;
  main_plot_status: string;
  active_chapter_id: string | null;
  last_main_plot_update_at: string | null;
  tags: string[];
}

export interface CharacterState {
  character_id: string;
  name: string;
  role: string;
  current_status: string;
  desire?: string;
  fear?: string;
  arc_stage?: string;
  secrets?: string[];
  open_loops: string[];
  relationships: string[];
  referenced_chapters: string[];
  updated_at: string;
}

export interface CharacterStateFile {
  schema_version: 1;
  characters: CharacterState[];
}

export interface RelationshipState {
  relationship_id: string;
  character_ids: string[];
  type: string;
  current_status: string;
  tension?: string;
  open_loops: string[];
  referenced_chapters: string[];
  updated_at: string;
}

export interface RelationshipStateFile {
  schema_version: 1;
  relationships: RelationshipState[];
}

export type TimelineCertainty = "confirmed" | "inferred" | "contradicted" | "needs_review";

export interface TimelineEvent {
  timeline_event_id: string;
  label: string;
  story_time: string;
  chapter_id: string | null;
  scene_id: string | null;
  characters: string[];
  summary: string;
  certainty: TimelineCertainty;
  updated_at: string;
}

export interface TimelineStateFile {
  schema_version: 1;
  timeline_events: TimelineEvent[];
}

export type OpenLoopStatus = "open" | "developing" | "paid_off" | "dropped" | "needs_review";

export interface OpenLoop {
  open_loop_id: string;
  title: string;
  status: OpenLoopStatus;
  introduced_in: string | null;
  expected_payoff: string;
  related_characters: string[];
  related_chapters: string[];
  notes: string;
  updated_at: string;
}

export interface OpenLoopStateFile {
  schema_version: 1;
  open_loops: OpenLoop[];
}

export interface ThemeStateFile {
  schema_version: 1;
  themes: Array<{
    theme_id: string;
    label: string;
    description: string;
    related_chapters: string[];
    related_open_loops: string[];
    updated_at: string;
  }>;
}

export interface WorldRuleStateFile {
  schema_version: 1;
  world_rules: Array<{
    world_rule_id: string;
    title: string;
    description: string;
    status: "confirmed" | "needs_review";
    related_chapters: string[];
    updated_at: string;
  }>;
}
