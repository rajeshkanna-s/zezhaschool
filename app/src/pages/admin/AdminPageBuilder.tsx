import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import PageRenderer from '../../components/PageRenderer';
import type { PageBlock, PageBlockType, CardItem } from '../../types';
import {
  FiArrowLeft, FiSave, FiEye, FiTrash2, FiChevronUp, FiChevronDown, FiPlus,
  FiType, FiAlignLeft, FiImage, FiVideo, FiAlertCircle, FiSquare, FiGrid, FiMinus,
} from 'react-icons/fi';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);

const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `b_${Date.now()}_${Math.random().toString(36).slice(2)}`);

function newBlock(type: PageBlockType): PageBlock {
  const id = uid();
  switch (type) {
    case 'heading': return { id, type, text: 'New heading', level: 2 };
    case 'text': return { id, type, text: '' };
    case 'image': return { id, type, url: '', caption: '' };
    case 'video': return { id, type, url: '' };
    case 'callout': return { id, type, text: '', variant: 'info' };
    case 'button': return { id, type, label: 'Learn more', href: '' };
    case 'cards': return { id, type, items: [{ icon: '⭐', title: 'Card title', text: '', buttonLabel: '', buttonHref: '' }] };
    case 'divider': return { id, type };
  }
}

const palette: { type: PageBlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'heading', label: 'Heading', icon: <FiType /> },
  { type: 'text', label: 'Text', icon: <FiAlignLeft /> },
  { type: 'image', label: 'Image', icon: <FiImage /> },
  { type: 'video', label: 'Video', icon: <FiVideo /> },
  { type: 'callout', label: 'Callout', icon: <FiAlertCircle /> },
  { type: 'button', label: 'Button', icon: <FiSquare /> },
  { type: 'cards', label: 'Card grid', icon: <FiGrid /> },
  { type: 'divider', label: 'Divider', icon: <FiMinus /> },
];

export default function AdminPageBuilder() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState('');
  const [icon, setIcon] = useState('📄');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from('content_pages').select('*').eq('id', id).single();
      if (error || !data) {
        toast.error('Page not found');
        navigate('/admin/pages');
        return;
      }
      setTitle(data.title);
      setSlug(data.slug);
      setSlugTouched(true);
      setSummary(data.summary ?? '');
      setIcon(data.icon ?? '📄');
      setCoverImage(data.cover_image ?? '');
      setStatus(data.status);
      setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
      setLoading(false);
    })();
  }, [id, isEdit, navigate]);

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const addBlock = (type: PageBlockType) => setBlocks(b => [...b, newBlock(type)]);
  const removeBlock = (bid: string) => setBlocks(b => b.filter(x => x.id !== bid));
  const move = (bid: string, dir: -1 | 1) => setBlocks(b => {
    const i = b.findIndex(x => x.id === bid);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= b.length) return b;
    const copy = [...b];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  });
  const patchBlock = (bid: string, patch: Record<string, unknown>) =>
    setBlocks(b => b.map(x => (x.id === bid ? { ...x, ...patch } as PageBlock : x)));

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    const finalSlug = slug.trim() || slugify(title);
    const finalStatus = publish === undefined ? status : (publish ? 'published' : 'draft');

    setSaving(true);
    const payload: Record<string, unknown> = {
      title: title.trim(),
      slug: finalSlug,
      summary: summary.trim(),
      icon: icon || '📄',
      cover_image: coverImage.trim() || null,
      blocks,
      status: finalStatus,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('content_pages').update(payload).eq('id', id));
    } else {
      payload.created_by = user?.id ?? null;
      ({ error } = await supabase.from('content_pages').insert(payload));
    }
    setSaving(false);

    if (error) {
      if ((error as any).code === '23505') toast.error('That slug is already used — pick another.');
      else toast.error(error.message || 'Failed to save');
      return;
    }
    setStatus(finalStatus);
    toast.success(isEdit ? 'Page updated' : 'Page created');
    navigate('/admin/pages');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="builder">
      {/* Toolbar */}
      <div className="builder-toolbar">
        <button className="btn-link-arrow" onClick={() => navigate('/admin/pages')}>
          <FiArrowLeft /> Pages
        </button>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className={`builder-toggle ${showPreview ? 'on' : ''}`} onClick={() => setShowPreview(p => !p)}>
            <FiEye /> {showPreview ? 'Hide' : 'Show'} preview
          </button>
          <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} disabled={saving} onClick={() => handleSave(false)}>
            Save draft
          </button>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={saving} onClick={() => handleSave(true)}>
            <FiSave style={{ marginRight: 6 }} /> {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      <div className={`builder-grid ${showPreview ? 'with-preview' : ''}`}>
        {/* Editor column */}
        <div className="builder-editor">
          {/* Page meta */}
          <div className="content-card mb-3">
            <div className="row g-3">
              <div className="col-2 col-md-1">
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Icon</label>
                <input className="form-control" style={{ textAlign: 'center', fontSize: '1.1rem' }} value={icon} onChange={e => setIcon(e.target.value)} maxLength={4} />
              </div>
              <div className="col-10 col-md-11">
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Page title</label>
                <input className="form-control" placeholder="e.g. What is AI?" value={title} onChange={e => onTitleChange(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Slug (URL)</label>
                <div className="input-group-slug">
                  <span>/explore/</span>
                  <input className="form-control" value={slug} onChange={e => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} placeholder="what-is-ai" />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Cover image URL (optional)</label>
                <input className="form-control" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://…" />
              </div>
              <div className="col-12">
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Summary (shown on the Explore card)</label>
                <textarea className="form-control" rows={2} value={summary} onChange={e => setSummary(e.target.value)} placeholder="One or two lines describing this page…" />
              </div>
            </div>
          </div>

          {/* Blocks */}
          {blocks.length === 0 ? (
            <div className="content-card dash-empty" style={{ padding: '30px 20px' }}>
              <FiGrid />
              <h4>No content blocks yet</h4>
              <p>Add blocks below to build your page.</p>
            </div>
          ) : (
            blocks.map((block, i) => (
              <div className="block-card" key={block.id}>
                <div className="block-card-head">
                  <span className="block-type">{block.type}</span>
                  <div className="block-actions">
                    <button title="Move up" disabled={i === 0} onClick={() => move(block.id, -1)}><FiChevronUp /></button>
                    <button title="Move down" disabled={i === blocks.length - 1} onClick={() => move(block.id, 1)}><FiChevronDown /></button>
                    <button title="Delete" className="danger" onClick={() => removeBlock(block.id)}><FiTrash2 /></button>
                  </div>
                </div>
                <div className="block-card-body">
                  <BlockEditor block={block} patch={(p) => patchBlock(block.id, p)} />
                </div>
              </div>
            ))
          )}

          {/* Palette */}
          <div className="content-card mt-3">
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
              <FiPlus style={{ marginRight: 4 }} /> Add a block
            </div>
            <div className="palette">
              {palette.map(p => (
                <button key={p.type} className="palette-btn" onClick={() => addBlock(p.type)}>
                  <span className="palette-icon">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live preview column */}
        {showPreview && (
          <div className="builder-preview">
            <div className="builder-preview-head">
              <FiEye /> Live preview
              <span className={`status-badge ${status}`} style={{ marginLeft: 'auto' }}>{status}</span>
            </div>
            <div className="builder-preview-body">
              <div className="page-view-shell">
                <div className="page-view-header">
                  <div className="page-view-icon">{icon}</div>
                  <h1>{title || 'Untitled page'}</h1>
                  {summary && <p>{summary}</p>}
                </div>
                {coverImage && <img src={coverImage} alt="" className="page-view-cover" />}
                <PageRenderer blocks={blocks} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Per-block editing fields ---- */
function BlockEditor({ block, patch }: { block: PageBlock; patch: (p: Record<string, unknown>) => void }) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="row g-2">
          <div className="col-9">
            <input className="form-control" value={block.text} onChange={e => patch({ text: e.target.value })} placeholder="Heading text" />
          </div>
          <div className="col-3">
            <select className="form-select" value={block.level} onChange={e => patch({ level: Number(e.target.value) })}>
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
          </div>
        </div>
      );
    case 'text':
      return <textarea className="form-control" rows={3} value={block.text} onChange={e => patch({ text: e.target.value })} placeholder="Paragraph text…" />;
    case 'image':
      return (
        <div className="row g-2">
          <div className="col-12"><input className="form-control" value={block.url} onChange={e => patch({ url: e.target.value })} placeholder="Image URL" /></div>
          <div className="col-12"><input className="form-control" value={block.caption ?? ''} onChange={e => patch({ caption: e.target.value })} placeholder="Caption (optional)" /></div>
        </div>
      );
    case 'video':
      return <input className="form-control" value={block.url} onChange={e => patch({ url: e.target.value })} placeholder="YouTube / Vimeo / embed URL" />;
    case 'callout':
      return (
        <div className="row g-2">
          <div className="col-8"><input className="form-control" value={block.text} onChange={e => patch({ text: e.target.value })} placeholder="Callout message" /></div>
          <div className="col-4">
            <select className="form-select" value={block.variant} onChange={e => patch({ variant: e.target.value })}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </div>
        </div>
      );
    case 'button':
      return (
        <div className="row g-2">
          <div className="col-5"><input className="form-control" value={block.label} onChange={e => patch({ label: e.target.value })} placeholder="Button label" /></div>
          <div className="col-7"><input className="form-control" value={block.href} onChange={e => patch({ href: e.target.value })} placeholder="Link (https://… or /path)" /></div>
        </div>
      );
    case 'cards':
      return <CardsEditor items={block.items} onChange={(items) => patch({ items })} />;
    case 'divider':
      return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>A horizontal divider line.</div>;
    default:
      return null;
  }
}

function CardsEditor({ items, onChange }: { items: CardItem[]; onChange: (items: CardItem[]) => void }) {
  const update = (i: number, patch: Partial<CardItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const add = () => onChange([...items, { icon: '⭐', title: 'New card', text: '', buttonLabel: '', buttonHref: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="cards-editor">
      {items.map((it, i) => (
        <div className="card-edit-row" key={i}>
          <div className="row g-2">
            <div className="col-2"><input className="form-control" style={{ textAlign: 'center' }} value={it.icon ?? ''} onChange={e => update(i, { icon: e.target.value })} maxLength={4} placeholder="🙂" /></div>
            <div className="col-10"><input className="form-control" value={it.title} onChange={e => update(i, { title: e.target.value })} placeholder="Card title" /></div>
            <div className="col-12"><input className="form-control" value={it.text ?? ''} onChange={e => update(i, { text: e.target.value })} placeholder="Card text (optional)" /></div>
            <div className="col-6"><input className="form-control" value={it.buttonLabel ?? ''} onChange={e => update(i, { buttonLabel: e.target.value })} placeholder="Button label (optional)" /></div>
            <div className="col-6 d-flex gap-2">
              <input className="form-control" value={it.buttonHref ?? ''} onChange={e => update(i, { buttonHref: e.target.value })} placeholder="Button link" />
              <button className="icon-btn-danger" title="Remove card" onClick={() => remove(i)}><FiTrash2 /></button>
            </div>
          </div>
        </div>
      ))}
      <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={add}>
        <FiPlus style={{ marginRight: 4 }} /> Add card
      </button>
    </div>
  );
}
