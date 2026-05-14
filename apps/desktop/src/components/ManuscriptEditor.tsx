interface ManuscriptEditorProps {
  title: string;
  metadata: string;
  paragraphs: string[];
}

export function ManuscriptEditor({ title, metadata, paragraphs }: ManuscriptEditorProps) {
  return (
    <main className="editor-region">
      <article className="writing-column">
        <h2>{title}</h2>
        <div className="chapter-meta">{metadata}</div>
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
    </main>
  );
}
