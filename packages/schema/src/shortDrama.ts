export type ShortDramaSourceType = "online_url" | "local_video" | "subtitle_only" | "manual";

export type ShortDramaTranscriptSource = "subtitle" | "asr" | "manual";

export type ShortDramaActionTag =
  | "enter"
  | "exit"
  | "block_path"
  | "reveal_object"
  | "hide_object"
  | "grab"
  | "push_away"
  | "kneel"
  | "slap"
  | "turn_away"
  | "watch_silently"
  | "threaten"
  | "protect"
  | "humiliate"
  | "counterattack";

export interface ShortDramaSourceMetadata {
  series_title: string;
  episode_number: number;
  source_type: ShortDramaSourceType;
  source_url: string | null;
  local_video_path: string | null;
  duration_seconds: number | null;
  language: string;
  created_at: string;
}

export interface ShortDramaTranscriptFile {
  series_title: string;
  episode_number: number;
  language: string;
  segments: ShortDramaTranscriptSegment[];
}

export interface ShortDramaTranscriptSegment {
  segment_id: string;
  scene_id?: string;
  start_time: string;
  end_time: string;
  speaker_id: string;
  speaker_label: string | null;
  text: string;
  source: ShortDramaTranscriptSource;
  confidence: number | null;
}

export interface ShortDramaVisualContextFile {
  series_title: string;
  episode_number: number;
  frames: ShortDramaVisualFrame[];
  scene_level_notes: ShortDramaVisualSceneNote[];
}

export interface ShortDramaVisualFrame {
  frame_id: string;
  timecode: string;
  image_path: string;
  location: string | null;
  characters_visible: string[];
  body_position: string | null;
  obvious_action: string | null;
  action_tags: ShortDramaActionTag[];
  props: string[];
  emotional_state: string | null;
  shot_type: string | null;
  power_relation: string | null;
  scene_function_hint: string | null;
  confidence: number | null;
}

export interface ShortDramaVisualSceneNote {
  start_time?: string;
  end_time?: string;
  time_range?: string;
  summary?: string;
  visual_pattern?: string;
  possible_function?: string;
  evidence_frame_ids?: string[];
  confidence?: number | null;
}

export interface ShortDramaVisualSceneMapFile {
  series_title: string;
  episode_number: number;
  scenes: ShortDramaVisualSceneMapEntry[];
  open_questions: string[];
}

export interface ShortDramaVisualSceneMapEntry {
  scene_id: string;
  start_time: string;
  end_time: string;
  location: string | null;
  visual_summary: string;
  possible_dramatic_function: string | null;
  visible_conflict: string | null;
  power_relation: string | null;
  action_tags: ShortDramaActionTag[];
  evidence_frame_ids: string[];
  needs_dialogue_confirmation: string[];
}

export interface ShortDramaReconstructedScript {
  series_title: string;
  episode_number: number;
  genre_tags: string[];
  target_audience: string | null;
  characters: ShortDramaCharacterCard[];
  scenes: ShortDramaScene[];
  episode_hook: string | null;
  episode_cliffhanger: string | null;
  open_questions: string[];
}

export interface ShortDramaCharacterCard {
  character_id: string;
  name: string;
  aliases: string[];
  role_function: string | null;
  episode_goal: string | null;
  obstacle: string | null;
  key_action: string | null;
  relationship_tension: string | null;
  issues: string[];
}

export interface ShortDramaScene {
  scene_id: string;
  start_time: string;
  end_time: string;
  location: string | null;
  characters: string[];
  dramatic_function: string | null;
  conflict: ShortDramaSceneConflict;
  dialogue_segment_ids: string[];
  action_beats: string[];
  visual_evidence_frame_ids: string[];
  turning_point: string | null;
  issues: string[];
}

export interface ShortDramaSceneConflict {
  who_wants_what: string | null;
  who_blocks: string | null;
  stakes: string | null;
  escalation: string | null;
  result_changes_situation: boolean | null;
}

export interface ShortDramaHumanCorrections {
  character_name_map: Record<string, string>;
  scene_boundary_edits: ShortDramaSceneBoundaryEdit[];
  wrong_judgments: string[];
  confirmed_key_judgments: string[];
  notes: string;
}

export interface ShortDramaSceneBoundaryEdit {
  scene_id: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface ShortDramaDiagnosisScore {
  genre_completion: number | null;
  conflict_strength: number | null;
  character_motivation: number | null;
  dialogue_efficiency: number | null;
  rhythm: number | null;
  follow_up_drive: number | null;
  commercial_potential: number | null;
}
