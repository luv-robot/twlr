export const TWLR_PROJECT_FILE = "twlr.project.json";

export const TWLR_PROJECT_DIRECTORIES = [
  "manuscript",
  "state",
  "events",
  "proposals",
  "meetings",
  "notes",
  "assets",
  "cache",
] as const;

export const TWLR_INITIAL_STATE_FILES = [
  "state/work.json",
  "state/characters.json",
  "state/relationships.json",
  "state/timeline.json",
  "state/open_loops.json",
  "state/themes.json",
  "state/world_rules.json",
] as const;

export const TWLR_LOG_FILES = [
  "events/narrative_events.jsonl",
  "proposals/state_proposals.jsonl",
  "meetings/room_meetings.jsonl",
] as const;

export type ProjectDirectory = (typeof TWLR_PROJECT_DIRECTORIES)[number];
export type InitialStateFile = (typeof TWLR_INITIAL_STATE_FILES)[number];
export type LogFile = (typeof TWLR_LOG_FILES)[number];
