import { countWords, parseChapterMarkdown, replaceChapterMarkdownBody } from "@twlr/core";
import type { DemoChapter } from "../data/demoWorkspace";
import {
  createProject,
  listChapters,
  openProject,
  readChapter,
  writeChapter,
  type ChapterContent,
  type ProjectSummary,
} from "./twlrCommands";
import { isTauriRuntime } from "./tauriRuntime";

export interface LoadedWorkspace {
  project: ProjectSummary;
  chapters: DemoChapter[];
}

export async function createLocalWorkspace(projectPath: string, title: string): Promise<LoadedWorkspace> {
  assertTauriRuntime();
  await createProject({
    project_path: projectPath,
    title,
    kind: "web_novel",
    language: "en",
    created_at: new Date().toISOString(),
  });
  return loadLocalWorkspace(projectPath);
}

export async function loadLocalWorkspace(projectPath: string): Promise<LoadedWorkspace> {
  assertTauriRuntime();
  const [project, summaries] = await Promise.all([openProject(projectPath), listChapters(projectPath)]);
  const contents = await Promise.all(
    summaries.map((summary) => readChapter(projectPath, summary.file_path)),
  );

  return {
    project,
    chapters: contents.map((content, index) => chapterContentToItem(content, index)),
  };
}

export async function saveWorkspaceChapter(projectPath: string, chapter: DemoChapter): Promise<void> {
  if (!chapter.filePath) {
    return;
  }

  assertTauriRuntime();
  await writeChapter({
    project_path: projectPath,
    file_path: chapter.filePath,
    content: replaceChapterMarkdownBody(chapter.content, chapter.body),
  });
}

function chapterContentToItem(chapter: ChapterContent, index: number): DemoChapter {
  const parsed = parseChapterMarkdown(chapter.content);
  const body = parsed.body;
  const title = typeof parsed.metadata.title === "string" ? parsed.metadata.title : chapter.summary.title;

  return {
    id: String(index + 1).padStart(2, "0"),
    title,
    meta: formatCompactWordCount(countWords(body)),
    state: index === 0 ? "active" : "saved",
    body,
    content: chapter.content,
    filePath: chapter.summary.file_path,
  };
}

function assertTauriRuntime() {
  if (!isTauriRuntime()) {
    throw new Error("Local project storage is available in the Tauri desktop app.");
  }
}

function formatCompactWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }

  return String(count);
}
