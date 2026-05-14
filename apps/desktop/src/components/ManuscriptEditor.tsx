interface ManuscriptEditorProps {
  title: string;
  metadata: string;
  value: string;
  onChange: (value: string) => void;
}

export function ManuscriptEditor({ title, metadata, onChange, value }: ManuscriptEditorProps) {
  return (
    <main className="editor-region">
      <article className="writing-column">
        <h2>{title}</h2>
        <div className="chapter-meta">{metadata}</div>
        <textarea
          aria-label="Chapter manuscript"
          className="chapter-editor"
          onChange={(event) => onChange(event.target.value)}
          spellCheck
          value={value}
        />
      </article>
    </main>
  );
}
