import { invoke } from "@tauri-apps/api/core";
import type { CharacterStateFile, NarrativeEvent, OpenLoopStateFile, RoomMeeting, StateProposal } from "@twlr/schema";

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

export interface CreateChapterRequest {
  project_path: string;
  title?: string;
}

export interface AppendProjectRecordsRequest<TRecord> {
  project_path: string;
  records: TRecord[];
}

export interface SaveSnapshotRequest {
  project_path: string;
  message?: string;
}

export interface WriteProjectJsonRequest<TValue> {
  project_path: string;
  value: TValue;
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

export interface SnapshotSummary {
  snapshot_id: string;
  message: string;
  changed_files: number;
}

export interface SnapshotStatus {
  changed_files: number;
  changed_chapters: number;
  changed_state_files: number;
  has_snapshot: boolean;
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

export async function createChapter(request: CreateChapterRequest): Promise<ChapterContent> {
  return invoke<ChapterContent>("create_chapter", { request });
}

export async function appendNarrativeEvents(
  request: AppendProjectRecordsRequest<NarrativeEvent>,
): Promise<number> {
  return invoke<number>("append_narrative_events", { request });
}

export async function readNarrativeEvents(projectPath: string): Promise<NarrativeEvent[]> {
  return invoke<NarrativeEvent[]>("read_narrative_events", { projectPath });
}

export async function appendStateProposals(request: AppendProjectRecordsRequest<StateProposal>): Promise<number> {
  return invoke<number>("append_state_proposals", { request });
}

export async function appendRoomMeetings(request: AppendProjectRecordsRequest<RoomMeeting>): Promise<number> {
  return invoke<number>("append_room_meetings", { request });
}

export async function saveSnapshot(request: SaveSnapshotRequest): Promise<SnapshotSummary> {
  return invoke<SnapshotSummary>("save_snapshot", { request });
}

export async function getSnapshotStatus(projectPath: string): Promise<SnapshotStatus> {
  return invoke<SnapshotStatus>("snapshot_status", { projectPath });
}

export async function readCharacterState(projectPath: string): Promise<CharacterStateFile> {
  return invoke<CharacterStateFile>("read_character_state", { projectPath });
}

export async function writeCharacterState(request: WriteProjectJsonRequest<CharacterStateFile>): Promise<void> {
  return invoke<void>("write_character_state", { request });
}

export async function readOpenLoopState(projectPath: string): Promise<OpenLoopStateFile> {
  return invoke<OpenLoopStateFile>("read_open_loop_state", { projectPath });
}

export async function writeOpenLoopState(request: WriteProjectJsonRequest<OpenLoopStateFile>): Promise<void> {
  return invoke<void>("write_open_loop_state", { request });
}
