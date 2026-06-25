import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import DocRenderer from '../../components/DocRenderer';
import { FiSave, FiEye, FiExternalLink } from 'react-icons/fi';

interface Doc { slug: string; title: string; content: string; sort_order: number }

export default function AdminDocuments() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('site_documents').select('*').order('sort_order', { ascending: true });
    if (data) {
      setDocs(data as Doc[]);
      if (!activeSlug && data.length) selectDoc(data[0] as Doc);
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const selectDoc = (d: Doc) => { setActiveSlug(d.slug); setTitle(d.title); setContent(d.content); };

  const onSelect = (slug: string) => {
    const d = docs.find(x => x.slug === slug);
    if (d) selectDoc(d);
  };

  const save = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const { error } = await supabase.from('site_documents')
      .update({ title: title.trim(), content, updated_at: new Date().toISOString() })
      .eq('slug', activeSlug);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Saved — students see the change immediately');
    setDocs(docs.map(d => d.slug === activeSlug ? { ...d, title: title.trim(), content } : d));
  };

  const publicPath = activeSlug ? `/${activeSlug}` : '';

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Legal &amp; Help Pages</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            Edit the content students see. Changes save to the database and apply immediately.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={() => window.open(publicPath, '_blank')}>
            <FiExternalLink style={{ marginRight: 6 }} /> View live
          </button>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={save} disabled={saving}>
            <FiSave style={{ marginRight: 6 }} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Document selector */}
      <div className="settings-tabs" style={{ maxWidth: 560 }}>
        {docs.map(d => (
          <button key={d.slug} className={`settings-tab ${activeSlug === d.slug ? 'active' : ''}`} onClick={() => onSelect(d.slug)}>
            <span>{d.title}</span>
          </button>
        ))}
      </div>

      <div className="content-card mb-3">
        <label className="settings-label">Page title</label>
        <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
      </div>

      <div className="builder-grid with-preview">
        <div className="builder-editor">
          <div className="content-card" style={{ height: '100%' }}>
            <label className="settings-label">Content</label>
            <textarea
              className="form-control"
              style={{ minHeight: 420, fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: '0.85rem', lineHeight: 1.6 }}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <small className="text-muted">
              Formatting: <code>## Heading</code> · <code>- bullet</code> · <code>**bold**</code> · blank line = new paragraph.
              For FAQ/Help, write each question as <code>## Question</code> with the answer below it.
            </small>
          </div>
        </div>
        <div className="builder-preview">
          <div className="builder-preview-head"><FiEye /> Live preview</div>
          <div className="builder-preview-body">
            <div className="legal-page" style={{ maxWidth: '100%' }}>
              <div className="content-card">
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 14 }}>{title}</h2>
                <div className="legal-body"><DocRenderer content={content} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
