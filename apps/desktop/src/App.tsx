const chapters = [
  { id: "01", title: "Rain at the South Gate", meta: "2.1k", state: "saved" },
  { id: "02", title: "The False Receipt", meta: "1.8k", state: "saved" },
  { id: "03", title: "A Name Removed", meta: "2.4k", state: "active" },
  { id: "04", title: "The Lantern Room", meta: "Draft", state: "review" },
];

const coordinatorItems = [
  { count: "3", label: "pending updates", tone: "proposal" },
  { count: "2", label: "unresolved threads", tone: "warning" },
  { count: "1", label: "possible timeline issue", tone: "risk" },
];

export function App() {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="project-title">The Glass City</div>
        <div className="chapter-title">Chapter 03 - A Name Removed</div>
        <div className="top-spacer" />
        <div className="autosave">
          <span className="status-dot" />
          Autosaved 12s ago
        </div>
        <button className="secondary-button">Save Snapshot</button>
        <button className="icon-button" aria-label="Search">
          /
        </button>
        <button className="icon-button" aria-label="Settings">
          ...
        </button>
      </header>

      <aside className="app-rail" aria-label="Primary navigation">
        {["M", "C", "S", "K", "R", "P"].map((item, index) => (
          <button
            className={index === 0 ? "rail-item active" : "rail-item"}
            key={item}
            aria-label={["Manuscript", "Studio Coordinator", "State", "Skills", "Writers' Room", "Snapshots"][index]}
          >
            {item}
          </button>
        ))}
        <button className="rail-item rail-settings" aria-label="Settings">
          ...
        </button>
      </aside>

      <aside className="navigator">
        <h1>The Glass City</h1>
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

      <main className="editor-region">
        <article className="writing-column">
          <h2>Chapter 03 - A Name Removed</h2>
          <div className="chapter-meta">2,418 words · Autosaved 12s ago · Draft</div>
          <p>
            Mira noticed the receipt before anyone else did. The paper was old, but the ink had the faint wet shine of
            something written in a hurry.
          </p>
          <p>
            Outside the archive window, the south gate bells started again. Three slow notes, then silence. It was the
            kind of silence that made every drawer in the room feel watched.
          </p>
          <p>
            Shen Yao stood near the door with his hands folded behind his back. He did not ask what she had found. That
            was the first thing that made her afraid.
          </p>
          <p>
            The name had not been erased. It had been replaced. Whoever changed the record wanted the lie to look older
            than the truth.
          </p>
        </article>
      </main>

      <aside className="context-panel">
        <div className="panel-header">
          <h2>Studio Coordinator</h2>
          <div className="tabs">
            <button className="tab active">Room</button>
            <button className="tab">State</button>
            <button className="tab">Impact</button>
          </div>
        </div>

        <section className="coordinator-card">
          <div className="section-label">Project status</div>
          {coordinatorItems.map((item) => (
            <div className="status-row" key={item.label}>
              <strong className={item.tone}>{item.count}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        <section className="coordinator-card">
          <div className="section-label">Next useful actions</div>
          <button className="primary-button">Review pending updates</button>
          <button className="secondary-button wide">Check affected chapters</button>
          <button className="secondary-button wide">Open Writers' Room</button>
        </section>
      </aside>
    </div>
  );
}
