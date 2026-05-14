export type ChapterStatus = "outline" | "draft" | "revision" | "locked";

export interface ChapterMetadata {
  id: string;
  title: string;
  order: number;
  status: ChapterStatus;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChapterDocument {
  metadata: ChapterMetadata;
  body: string;
  file_path: string;
}
