export type NarrativeEventType =
  | "character_created"
  | "character_state_changed"
  | "relationship_state_changed"
  | "timeline_event_created"
  | "timeline_event_changed"
  | "open_loop_created"
  | "open_loop_changed"
  | "open_loop_paid_off"
  | "theme_changed"
  | "world_rule_changed"
  | "chapter_metadata_changed";

export interface NarrativeEvent {
  event_id: string;
  event_type: NarrativeEventType;
  created_at: string;
  source: {
    kind: "user" | "accepted_proposal" | "import" | "system";
    proposal_id?: string;
  };
  references: {
    chapters: string[];
    characters: string[];
    open_loops: string[];
    timeline_events: string[];
  };
  payload: {
    target_type: "work" | "chapter" | "character" | "relationship" | "timeline_event" | "open_loop" | "theme" | "world_rule";
    target_id: string;
    field?: string;
    old_value?: unknown;
    new_value?: unknown;
  };
}
