import { useMemo, useState } from 'react';
import { examples, type Example } from './catalog';

const categoryLabel: Record<Example['category'], string> = {
  react: 'React',
  html: 'HTML',
};

function App() {
  const [selectedId, setSelectedId] = useState(examples[0]?.id ?? '');
  const selected = useMemo(
    () => examples.find((example) => example.id === selectedId) ?? examples[0],
    [selectedId],
  );

  if (!selected) {
    return null;
  }

  return (
    <main className="lab-shell">
      <aside className="sidebar" aria-label="组件目录">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <h1>My Code Lab</h1>
            <p>HTML / React / CSS effects</p>
          </div>
        </div>

        <div className="example-list">
          {examples.map((example) => (
            <button
              key={example.id}
              className="example-button"
              data-active={example.id === selected.id}
              type="button"
              onClick={() => setSelectedId(example.id)}
            >
              <span>{example.title}</span>
              <small>{categoryLabel[example.category]}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <span className="category-pill">{categoryLabel[selected.category]}</span>
            <h2>{selected.title}</h2>
            <p>{selected.description}</p>
          </div>
          <a className="source-link" href={`/${selected.sourcePath}`} target="_blank" rel="noreferrer">
            Source
          </a>
        </header>

        <div className="tag-row">
          {selected.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <section className="preview-surface" aria-label={`${selected.title} 预览`}>
          {selected.category === 'react' ? (
            <selected.Component />
          ) : (
            <iframe title={selected.title} src={selected.previewUrl} />
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
