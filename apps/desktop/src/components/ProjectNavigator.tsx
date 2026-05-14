import type { ChapterListItem } from "../data/demoWorkspace";

interface ProjectNavigatorProps {
  projectTitle: string;
  chapters: ChapterListItem[];
}

export function ProjectNavigator({ projectTitle, chapters }: ProjectNavigatorProps) {
  return (
    <aside className="navigator">
      <h1>{projectTitle}</h1>
      <button className="part-pill">Act I</button>
      <div className="section-label">Chapters</div>
      <div className="chapter-list">
        {chapters.map((chapter) => (
          <button className={chapter.state === "active" ? "chapter-row active" : "chapter-row"} key={chapter.id}>
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
