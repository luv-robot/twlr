import { invoke } from "@tauri-apps/api/core";

export interface CreateProjectRequest {
  project_path: string;
  title: string;
  kind: string;
  language?: string;
  created_at?: string;
}

export interface WriteChapterRequest {
  project_path: string;
  file_path: string;
  content: string;
}

export interface ProjectSummary {
  project_path: string;
  project_id: string;
  title: string;
  kind: string;
  chapter_count: number;
  git_initialized: boolean;
}

export interface ChapterSummary {
  chapter_id: string;
  title: string;
  order: number;
  status: string;
  word_count: number;
  file_path: string;
  updated_at?: string;
}

export interface ChapterContent {
  summary: ChapterSummary;
  content: string;
}

export async function createProject(request: CreateProjectRequest): Promise<ProjectSummary> {
  return invoke<ProjectSummary>("create_project", { request });
}

export async function openProject(projectPath: string): Promise<ProjectSummary> {
  return invoke<ProjectSummary>("open_project", { projectPath });
}

export async function listChapters(projectPath: string): Promise<ChapterSummary[]> {
  return invoke<ChapterSummary[]>("list_chapters", { projectPath });
}

export async function readChapter(projectPath: string, filePath: string): Promise<ChapterContent> {
  return invoke<ChapterContent>("read_chapter", { projectPath, filePath });
}

export async function writeChapter(request: WriteChapterRequest): Promise<ChapterSummary> {
  return invoke<ChapterSummary>("write_chapter", { request });
}
