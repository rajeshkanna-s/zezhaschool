import type { ReactNode } from 'react';

/** Inline formatting: **bold** */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

/**
 * Minimal, safe markdown for admin-authored documents.
 * Parsed line-by-line so a "## Heading" is only the heading line — the text
 * beneath it becomes its own paragraph.
 * Supports:  ## Heading · # Title · - bullet · blank-line paragraphs · **bold**
 */
export default function DocRenderer({ content }: { content: string }) {
  if (!content.trim()) {
    return <p style={{ color: 'var(--text-muted)' }}>No content yet.</p>;
  }

  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const out: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (!para.length) return;
    const ls = [...para];
    out.push(
      <p key={`p${key++}`}>
        {ls.map((l, j) => <span key={j}>{inline(l)}{j < ls.length - 1 ? <br /> : null}</span>)}
      </p>
    );
    para = [];
  };
  const flushList = () => {
    if (!list.length) return;
    const items = [...list];
    out.push(<ul key={`u${key++}`}>{items.map((l, j) => <li key={j}>{inline(l)}</li>)}</ul>);
    list = [];
  };

  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { flushPara(); flushList(); continue; }
    if (t.startsWith('## ')) { flushPara(); flushList(); out.push(<h3 key={`h${key++}`}>{inline(t.slice(3))}</h3>); }
    else if (t.startsWith('# ')) { flushPara(); flushList(); out.push(<h2 key={`h${key++}`}>{inline(t.slice(2))}</h2>); }
    else if (t.startsWith('- ')) { flushPara(); list.push(t.slice(2)); }
    else { flushList(); para.push(t); }
  }
  flushPara();
  flushList();

  return <>{out}</>;
}
