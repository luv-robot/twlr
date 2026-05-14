interface TopBarProps {
  projectTitle: string;
  chapterTitle: string;
  autosaveLabel: string;
}

export function TopBar({ projectTitle, chapterTitle, autosaveLabel }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="project-title">{projectTitle}</div>
      <div className="chapter-title">{chapterTitle}</div>
      <div className="top-spacer" />
      <div className="autosave">
        <span className="status-dot" />
        {autosaveLabel}
      </div>
      <button className="secondary-button">Save Snapshot</button>
      <button className="icon-button" aria-label="Search">
        /
      </button>
      <button className="icon-button" aria-label="Settings">
        ...
      </button>
    </header>
  );
}
