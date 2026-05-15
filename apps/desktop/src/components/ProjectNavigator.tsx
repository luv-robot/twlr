import type { ChapterListItem } from "../data/demoWorkspace";

export type WorkspaceAction = "creating" | "creating_chapter" | "opening" | null;

interface ProjectNavigatorProps {
  projectTitle: string;
  chapters: ChapterListItem[];
  activeChapterId: string;
  projectPathInput: string;
  workspaceAction: WorkspaceAction;
  workspaceStatus: string;
  onCreateChapter: () => void;
  onCreateLocalProject: () => void;
  onOpenLocalProject: () => void;
  onProjectPathInput: (value: string) => void;
  onSelectChapter: (chapterId: string) => void;
}

export function ProjectNavigator({
  activeChapterId,
  chapters,
  onCreateChapter,
  onCreateLocalProject,
  onOpenLocalProject,
  onProjectPathInput,
  onSelectChapter,
  projectPathInput,
  projectTitle,
  workspaceAction,
  workspaceStatus,
}: ProjectNavigatorProps) {
  const isWorking = Boolean(workspaceAction);
  const isOpening = workspaceAction === "opening";
  const isCreating = workspaceAction === "creating";
  const isCreatingChapter = workspaceAction === "creating_chapter";

  return (
    <aside className="navigator">
      <h1>{projectTitle}</h1>
      <section className="workspace-card">
        <div className="section-label">Local workspace</div>
        <input
          aria-label="Local project path"
          className="path-input"
          disabled={isWorking}
          onChange={(event) => onProjectPathInput(event.target.value)}
          value={projectPathInput}
        />
        <div className="workspace-actions">
          <button className="secondary-button" disabled={isWorking} onClick={onOpenLocalProject}>
            {isOpening ? "Opening..." : "Open"}
          </button>
          <button className="primary-button compact" disabled={isWorking} onClick={onCreateLocalProject}>
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
        <p>{workspaceStatus}</p>
      </section>
      <button className="part-pill">Act I</button>
      <div className="section-heading">
        <div className="section-label">Chapters</div>
        <button className="icon-button" aria-label="Create chapter" disabled={isWorking} onClick={onCreateChapter}>
          {isCreatingChapter ? "..." : "+"}
        </button>
      </div>
      <div className="chapter-list">
        {chapters.map((chapter) => (
          <button
            className={chapter.id === activeChapterId ? "chapter-row active" : "chapter-row"}
            key={chapter.id}
            onClick={() => onSelectChapter(chapter.id)}
          >
            <span className="chapter-number">{chapter.id}</span>
            <span className="chapter-copy">
              <span>{chapter.title}</span>
              <small>{chapter.meta}</small>
            </span>
            <span className={`chapter-state ${chapter.state}`} />
          </button>
        ))}
      </div>
    </aside>
  );
}
