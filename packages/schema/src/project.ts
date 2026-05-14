export type ProjectKind = "web_novel" | "script" | "light_novel" | "genre_fiction" | "other";

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
