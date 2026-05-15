import { t } from "@twlr/ui";

interface TopBarProps {
  projectTitle: string;
  chapterTitle: string;
  autosaveLabel: string;
  changedItemCount: number;
  onSaveSnapshot: () => void;
}

export function TopBar({ autosaveLabel, changedItemCount, chapterTitle, onSaveSnapshot, projectTitle }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="project-title">{projectTitle}</div>
      <div className="chapter-title">{chapterTitle}</div>
      <div className="top-spacer" />
      <div className="autosave">
        <span className="status-dot" />
        {autosaveLabel}
      </div>
      <button className="secondary-button" disabled={changedItemCount === 0} onClick={onSaveSnapshot}>
        {t("snapshot.save")}
      </button>
      <button className="icon-button" aria-label="Search">
        /
      </button>
      <button className="icon-button" aria-label="Settings">
        ...
      </button>
    </header>
  );
}
