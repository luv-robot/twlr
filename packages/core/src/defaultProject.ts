import type { ProjectKind, TwlrProject } from "@twlr/schema";
import { makeProjectId } from "./ids";

export interface CreateProjectTemplateInput {
  title: string;
  kind: ProjectKind;
  language?: string;
  now?: string;
}

export interface ProjectFileTemplate {
  path: string;
  content: string;
}

export function createProjectManifest(input: CreateProjectTemplateInput): TwlrProject {
  const now = input.now ?? new Date().toISOString();

  return {
    schema_version: 1,
    project_id: makeProjectId(input.title),
    title: input.title,
    kind: input.kind,
    language: input.language ?? "en",
    created_at: now,
    updated_at: now,
    settings: {
      default_chapter_directory: "manuscript",
      snapshot_mode: "manual",
      developer_mode: false,
    },
  };
}

export function createInitialProjectFiles(input: CreateProjectTemplateInput): ProjectFileTemplate[] {
  const now = input.now ?? new Date().toISOString();
  const manifest = createProjectManifest({ ...input, now });
  const chapterTitle = "Untitled Chapter";

  return [
    {
      path: "twlr.project.json",
      content: `${JSON.stringify(manifest, null, 2)}\n`,
    },
    {
      path: ".gitignore",
      content: ["cache/", "*.sqlite", ".DS_Store", ""].join("\n"),
    },
    {
      path: "manuscript/chapter-001.md",
      content: [
        "---",
        "id: chapter_001",
        `title: ${chapterTitle}`,
        "order: 1",
        "status: draft",
        "word_count: 0",
        `created_at: ${now}`,
        `updated_at: ${now}`,
        "---",
        "",
        `# ${chapterTitle}`,
        "",
      ].join("\n"),
    },
    {
      path: "state/work.json",
      content: `${JSON.stringify(
        {
          schema_version: 1,
          work_id: "work_main",
          title: input.title,
          genre: [],
          format: input.kind,
          current_phase: "draft",
          main_plot_status: "not_started",
          active_chapter_id: "chapter_001",
          last_main_plot_update_at: null,
          tags: [],
        },
        null,
        2,
      )}\n`,
    },
    { path: "state/characters.json", content: `${JSON.stringify({ schema_version: 1, characters: [] }, null, 2)}\n` },
    {
      path: "state/relationships.json",
      content: `${JSON.stringify({ schema_version: 1, relationships: [] }, null, 2)}\n`,
    },
    {
      path: "state/timeline.json",
      content: `${JSON.stringify({ schema_version: 1, timeline_events: [] }, null, 2)}\n`,
    },
    {
      path: "state/open_loops.json",
      content: `${JSON.stringify({ schema_version: 1, open_loops: [] }, null, 2)}\n`,
    },
    { path: "state/themes.json", content: `${JSON.stringify({ schema_version: 1, themes: [] }, null, 2)}\n` },
    {
      path: "state/world_rules.json",
      content: `${JSON.stringify({ schema_version: 1, world_rules: [] }, null, 2)}\n`,
    },
    { path: "events/narrative_events.jsonl", content: "" },
    { path: "proposals/state_proposals.jsonl", content: "" },
    { path: "meetings/room_meetings.jsonl", content: "" },
    { path: "assets/.gitkeep", content: "" },
    { path: "cache/.gitkeep", content: "" },
  ];
}
