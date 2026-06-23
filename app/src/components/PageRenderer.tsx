import type { PageBlock, CalloutVariant } from '../types';

interface PageRendererProps {
  blocks: PageBlock[];
}

const calloutStyles: Record<CalloutVariant, { bg: string; border: string; color: string; icon: string }> = {
  info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', icon: 'ℹ️' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', icon: '✅' },
  warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: '⚠️' },
  danger: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: '🚫' },
};

function toEmbedUrl(url: string): string {
  // Normalize common YouTube formats to an embeddable URL
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export default function PageRenderer({ blocks }: PageRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="page-render-empty">
        Nothing here yet — add some blocks to see them rendered.
      </div>
    );
  }

  return (
    <div className="page-render">
      {blocks.map(block => {
        switch (block.type) {
          case 'heading': {
            const Tag = (`h${block.level}` as 'h1' | 'h2' | 'h3');
            return <Tag key={block.id} className={`pr-heading pr-h${block.level}`}>{block.text}</Tag>;
          }
          case 'text':
            return <p key={block.id} className="pr-text">{block.text}</p>;
          case 'image':
            return (
              <figure key={block.id} className="pr-figure">
                {block.url
                  ? <img src={block.url} alt={block.caption || ''} className="pr-image" />
                  : <div className="pr-image-placeholder">Image URL not set</div>}
                {block.caption && <figcaption className="pr-caption">{block.caption}</figcaption>}
              </figure>
            );
          case 'video':
            return (
              <div key={block.id} className="pr-video">
                {block.url
                  ? <iframe src={toEmbedUrl(block.url)} title="Embedded video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  : <div className="pr-image-placeholder">Video URL not set</div>}
              </div>
            );
          case 'callout': {
            const s = calloutStyles[block.variant] ?? calloutStyles.info;
            return (
              <div key={block.id} className="pr-callout" style={{ background: s.bg, borderColor: s.border, color: s.color }}>
                <span className="pr-callout-icon">{s.icon}</span>
                <span>{block.text}</span>
              </div>
            );
          }
          case 'button':
            return (
              <div key={block.id} className="pr-button-wrap">
                <a className="pr-button" href={block.href || '#'} target={block.href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  {block.label || 'Button'} →
                </a>
              </div>
            );
          case 'cards':
            return (
              <div key={block.id} className="pr-cards">
                {block.items.map((it, i) => (
                  <div className="pr-card" key={i}>
                    {it.icon && <div className="pr-card-icon">{it.icon}</div>}
                    <div className="pr-card-title">{it.title}</div>
                    {it.text && <div className="pr-card-text">{it.text}</div>}
                    {it.buttonLabel && (
                      <a className="pr-card-btn" href={it.buttonHref || '#'} target={it.buttonHref?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                        {it.buttonLabel} →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            );
          case 'divider':
            return <hr key={block.id} className="pr-divider" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
