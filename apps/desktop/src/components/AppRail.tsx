const railItems = [
  { glyph: "M", label: "Manuscript" },
  { glyph: "C", label: "Studio Coordinator" },
  { glyph: "S", label: "State" },
  { glyph: "K", label: "Skills" },
  { glyph: "R", label: "Writers' Room" },
  { glyph: "P", label: "Snapshots" },
];

export function AppRail() {
  return (
    <aside className="app-rail" aria-label="Primary navigation">
      {railItems.map((item, index) => (
        <button className={index === 0 ? "rail-item active" : "rail-item"} key={item.label} aria-label={item.label}>
          {item.glyph}
        </button>
      ))}
      <button className="rail-item rail-settings" aria-label="Settings">
        ...
      </button>
    </aside>
  );
}
