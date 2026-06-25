import type { ReactNode } from 'react';

/** Inline formatting: **bold** */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

/**
 * Minimal, safe markdown for admin-authored documents.
 * Supports:  ## Heading  ·  - bullet  ·  blank-line paragraphs  ·  **bold**
 */
export default function DocRenderer({ content }: { content: string }) {
  if (!content.trim()) {
    return <p style={{ color: 'var(--text-muted)' }}>No content yet.</p>;
  }
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  return (
    <>
      {blocks.map((raw, i) => {
        const block = raw.trim();
        if (!block) return null;
        if (block.startsWith('## ')) return <h3 key={i}>{inline(block.slice(3))}</h3>;
        if (block.startsWith('# ')) return <h2 key={i}>{inline(block.slice(2))}</h2>;
        const lines = block.split('\n');
        if (lines.every(l => l.trim().startsWith('- '))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.trim().slice(2))}</li>)}</ul>;
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>{inline(l)}{j < lines.length - 1 ? <br /> : null}</span>
            ))}
          </p>
        );
      })}
    </>
  );
}
