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

export type ProjectDirectory = (typeof TWLR_PROJECT_DIRECTORIES)[number];

export interface ProjectHealthSummary {
  pendingProposals: number;
  unresolvedOpenLoops: number;
  changedChaptersSinceSnapshot: number;
  timelineConflicts: number;
  unreviewedMeetingFollowups: number;
}

export function createEmptyProjectHealthSummary(): ProjectHealthSummary {
  return {
    pendingProposals: 0,
    unresolvedOpenLoops: 0,
    changedChaptersSinceSnapshot: 0,
    timelineConflicts: 0,
    unreviewedMeetingFollowups: 0,
  };
}
