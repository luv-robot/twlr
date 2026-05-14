import type { ChapterListItem } from "../data/demoWorkspace";

interface ProjectNavigatorProps {
  projectTitle: string;
  chapters: ChapterListItem[];
  activeChapterId: string;
  projectPathInput: string;
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
  workspaceStatus,
}: ProjectNavigatorProps) {
  return (
    <aside className="navigator">
      <h1>{projectTitle}</h1>
      <section className="workspace-card">
        <div className="section-label">Local workspace</div>
        <input
          aria-label="Local project path"
          className="path-input"
          onChange={(event) => onProjectPathInput(event.target.value)}
          value={projectPathInput}
        />
        <div className="workspace-actions">
          <button className="secondary-button" onClick={onOpenLocalProject}>
            Open
          </button>
          <button className="primary-button compact" onClick={onCreateLocalProject}>
            Create
          </button>
        </div>
        <p>{workspaceStatus}</p>
      </section>
      <button className="part-pill">Act I</button>
      <div className="section-heading">
        <div className="section-label">Chapters</div>
        <button className="icon-button" aria-label="Create chapter" onClick={onCreateChapter}>
          +
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
