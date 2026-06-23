import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type {
  MissionStep, MissionStepType, LearnStep, SortStep, QuizStep, LearnCard, SortItem, QuizQuestion,
} from '../../types';
import {
  FiArrowLeft, FiSave, FiPlay, FiTrash2, FiChevronUp, FiChevronDown, FiPlus,
  FiBookOpen, FiGrid, FiHelpCircle,
} from 'react-icons/fi';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`);

function newStep(type: MissionStepType): MissionStep {
  const id = uid();
  if (type === 'learn') return { id, type, title: 'Learn', cards: [{ icon: '💡', heading: '', text: '' }] };
  if (type === 'sort') return {
    id, type, title: 'Sort it out', prompt: 'Sort each item into the right group.',
    buckets: [{ label: 'OK to share', emoji: '✅' }, { label: 'Keep private', emoji: '🔒' }],
    items: [{ text: '', bucket: 0 }],
  };
  return { id, type, title: 'Quick quiz', questions: [{ q: '', options: ['', ''], answer: 0 }] };
}

const stepPalette: { type: MissionStepType; label: string; icon: React.ReactNode }[] = [
  { type: 'learn', label: 'Learn', icon: <FiBookOpen /> },
  { type: 'sort', label: 'Play (sort)', icon: <FiGrid /> },
  { type: 'quiz', label: 'Quiz', icon: <FiHelpCircle /> },
];

export default function AdminMissionBuilder() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [icon, setIcon] = useState('🚀');
  const [summary, setSummary] = useState('');
  const [xp, setXp] = useState(100);
  const [orderIndex, setOrderIndex] = useState(0);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [steps, setSteps] = useState<MissionStep[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from('missions').select('*').eq('id', id).single();
      if (error || !data) { toast.error('Mission not found'); navigate('/admin/missions'); return; }
      setTitle(data.title); setSlug(data.slug); setSlugTouched(true);
      setIcon(data.icon ?? '🚀'); setSummary(data.summary ?? '');
      setXp(data.xp ?? 100); setOrderIndex(data.order_index ?? 0);
      setStatus(data.status); setSteps(Array.isArray(data.steps) ? data.steps : []);
      setLoading(false);
    })();
  }, [id, isEdit, navigate]);

  const onTitleChange = (v: string) => { setTitle(v); if (!slugTouched) setSlug(slugify(v)); };

  const addStep = (type: MissionStepType) => setSteps(s => [...s, newStep(type)]);
  const removeStep = (sid: string) => setSteps(s => s.filter(x => x.id !== sid));
  const moveStep = (sid: string, dir: -1 | 1) => setSteps(s => {
    const i = s.findIndex(x => x.id === sid); const j = i + dir;
    if (i < 0 || j < 0 || j >= s.length) return s;
    const c = [...s]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });
  const patchStep = (sid: string, patch: Record<string, unknown>) =>
    setSteps(s => s.map(x => (x.id === sid ? { ...x, ...patch } as MissionStep : x)));

  const persist = async (newStatus: 'draft' | 'published'): Promise<string | null> => {
    if (!title.trim()) { toast.error('Title is required'); return null; }
    const finalSlug = slug.trim() || slugify(title);
    setSaving(true);
    const payload: Record<string, unknown> = {
      title: title.trim(), slug: finalSlug, summary: summary.trim(), icon: icon || '🚀',
      xp: Number(xp) || 0, order_index: Number(orderIndex) || 0, steps, status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
    };
    let error;
    if (isEdit) ({ error } = await supabase.from('missions').update(payload).eq('id', id));
    else { payload.created_by = user?.id ?? null; ({ error } = await supabase.from('missions').insert(payload)); }
    setSaving(false);
    if (error) {
      if ((error as any).code === '23505') toast.error('That slug is already used — pick another.');
      else toast.error(error.message || 'Failed to save');
      return null;
    }
    setStatus(newStatus);
    return finalSlug;
  };

  const handleSave = async (newStatus: 'draft' | 'published') => {
    const s = await persist(newStatus);
    if (s) { toast.success(isEdit ? 'Mission saved' : 'Mission created'); navigate('/admin/missions'); }
  };

  const handleTestPlay = async () => {
    const s = await persist(status); // save with current status, keep draft if draft
    if (s) window.open(`/missions/${s}`, '_blank');
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}><div className="spinner" /></div>;
  }

  return (
    <div className="builder">
      <div className="builder-toolbar">
        <button className="btn-link-arrow" onClick={() => navigate('/admin/missions')}><FiArrowLeft /> Missions</button>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="builder-toggle" disabled={saving} onClick={handleTestPlay}><FiPlay /> Save &amp; test play</button>
          <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} disabled={saving} onClick={() => handleSave('draft')}>Save draft</button>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={saving} onClick={() => handleSave('published')}>
            <FiSave style={{ marginRight: 6 }} /> {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="content-card mb-3">
        <div className="row g-3">
          <div className="col-2 col-md-1">
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Icon</label>
            <input className="form-control" style={{ textAlign: 'center', fontSize: '1.1rem' }} value={icon} onChange={e => setIcon(e.target.value)} maxLength={4} />
          </div>
          <div className="col-10 col-md-7">
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Mission title</label>
            <input className="form-control" placeholder="e.g. What is private information?" value={title} onChange={e => onTitleChange(e.target.value)} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>XP reward</label>
            <input type="number" className="form-control" value={xp} onChange={e => setXp(Number(e.target.value))} min={0} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Order</label>
            <input type="number" className="form-control" value={orderIndex} onChange={e => setOrderIndex(Number(e.target.value))} />
          </div>
          <div className="col-md-6">
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Slug (URL)</label>
            <div className="input-group-slug">
              <span>/missions/</span>
              <input className="form-control" value={slug} onChange={e => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} placeholder="what-is-private-information" />
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Summary</label>
            <input className="form-control" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Shown on the mission card…" />
          </div>
        </div>
      </div>

      {/* Steps */}
      {steps.length === 0 ? (
        <div className="content-card dash-empty" style={{ padding: '30px 20px' }}>
          <FiBookOpen /><h4>No steps yet</h4><p>Add Learn, Play and Quiz steps below.</p>
        </div>
      ) : (
        steps.map((step, i) => (
          <div className="block-card" key={step.id}>
            <div className="block-card-head">
              <span className="block-type">{i + 1}. {step.type === 'sort' ? 'play' : step.type}</span>
              <div className="block-actions">
                <button title="Move up" disabled={i === 0} onClick={() => moveStep(step.id, -1)}><FiChevronUp /></button>
                <button title="Move down" disabled={i === steps.length - 1} onClick={() => moveStep(step.id, 1)}><FiChevronDown /></button>
                <button title="Delete" className="danger" onClick={() => removeStep(step.id)}><FiTrash2 /></button>
              </div>
            </div>
            <div className="block-card-body">
              <StepEditor step={step} patch={(p) => patchStep(step.id, p)} />
            </div>
          </div>
        ))
      )}

      <div className="content-card mt-3">
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
          <FiPlus style={{ marginRight: 4 }} /> Add a step
        </div>
        <div className="palette">
          {stepPalette.map(p => (
            <button key={p.type} className="palette-btn" onClick={() => addStep(p.type)}>
              <span className="palette-icon">{p.icon}</span>{p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepEditor({ step, patch }: { step: MissionStep; patch: (p: Record<string, unknown>) => void }) {
  if (step.type === 'learn') return <LearnEditor step={step} patch={patch} />;
  if (step.type === 'sort') return <SortEditor step={step} patch={patch} />;
  return <QuizEditor step={step} patch={patch} />;
}

function LearnEditor({ step, patch }: { step: LearnStep; patch: (p: Record<string, unknown>) => void }) {
  const setCards = (cards: LearnCard[]) => patch({ cards });
  const upd = (i: number, p: Partial<LearnCard>) => setCards(step.cards.map((c, idx) => idx === i ? { ...c, ...p } : c));
  return (
    <div>
      <input className="form-control mb-2" value={step.title} onChange={e => patch({ title: e.target.value })} placeholder="Step title (e.g. What counts as private)" />
      {step.cards.map((c, i) => (
        <div className="card-edit-row" key={i}>
          <div className="row g-2">
            <div className="col-2"><input className="form-control" style={{ textAlign: 'center' }} value={c.icon ?? ''} onChange={e => upd(i, { icon: e.target.value })} maxLength={4} placeholder="🪪" /></div>
            <div className="col-10"><input className="form-control" value={c.heading} onChange={e => upd(i, { heading: e.target.value })} placeholder="Card heading" /></div>
            <div className="col-12"><textarea className="form-control" rows={2} value={c.text} onChange={e => upd(i, { text: e.target.value })} placeholder="Explanation text…" /></div>
          </div>
          {step.cards.length > 1 && <button className="link-remove" onClick={() => setCards(step.cards.filter((_, idx) => idx !== i))}>Remove card</button>}
        </div>
      ))}
      <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setCards([...step.cards, { icon: '💡', heading: '', text: '' }])}>
        <FiPlus style={{ marginRight: 4 }} /> Add learn card
      </button>
    </div>
  );
}

function SortEditor({ step, patch }: { step: SortStep; patch: (p: Record<string, unknown>) => void }) {
  const setItems = (items: SortItem[]) => patch({ items });
  return (
    <div>
      <input className="form-control mb-2" value={step.title} onChange={e => patch({ title: e.target.value })} placeholder="Step title (e.g. Share or Keep Private?)" />
      <input className="form-control mb-2" value={step.prompt} onChange={e => patch({ prompt: e.target.value })} placeholder="Prompt / instructions" />

      <div className="row g-2 mb-2">
        {step.buckets.map((b, bi) => (
          <div className="col-6" key={bi}>
            <div className="d-flex gap-2">
              <input className="form-control" style={{ maxWidth: 64, textAlign: 'center' }} value={b.emoji ?? ''} onChange={e => patch({ buckets: step.buckets.map((x, idx) => idx === bi ? { ...x, emoji: e.target.value } : x) })} maxLength={4} placeholder="✅" />
              <input className="form-control" value={b.label} onChange={e => patch({ buckets: step.buckets.map((x, idx) => idx === bi ? { ...x, label: e.target.value } : x) })} placeholder={`Group ${bi + 1} label`} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', margin: '6px 0' }}>ITEMS TO SORT</div>
      {step.items.map((it, i) => (
        <div className="card-edit-row" key={i}>
          <div className="d-flex gap-2 align-items-center">
            <input className="form-control" value={it.text} onChange={e => setItems(step.items.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))} placeholder="Item text (e.g. Your home address)" />
            <select className="form-select" style={{ maxWidth: 180 }} value={it.bucket} onChange={e => setItems(step.items.map((x, idx) => idx === i ? { ...x, bucket: Number(e.target.value) } : x))}>
              {step.buckets.map((b, bi) => <option key={bi} value={bi}>{b.emoji} {b.label}</option>)}
            </select>
            {step.items.length > 1 && <button className="icon-btn-danger" onClick={() => setItems(step.items.filter((_, idx) => idx !== i))}><FiTrash2 /></button>}
          </div>
        </div>
      ))}
      <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setItems([...step.items, { text: '', bucket: 0 }])}>
        <FiPlus style={{ marginRight: 4 }} /> Add item
      </button>
    </div>
  );
}

function QuizEditor({ step, patch }: { step: QuizStep; patch: (p: Record<string, unknown>) => void }) {
  const setQs = (questions: QuizQuestion[]) => patch({ questions });
  const updQ = (i: number, p: Partial<QuizQuestion>) => setQs(step.questions.map((q, idx) => idx === i ? { ...q, ...p } : q));
  return (
    <div>
      <input className="form-control mb-2" value={step.title} onChange={e => patch({ title: e.target.value })} placeholder="Step title (e.g. Quick quiz)" />
      {step.questions.map((q, qi) => (
        <div className="card-edit-row" key={qi}>
          <input className="form-control mb-2" value={q.q} onChange={e => updQ(qi, { q: e.target.value })} placeholder={`Question ${qi + 1}`} />
          {q.options.map((opt, oi) => (
            <div className="d-flex gap-2 align-items-center mb-1" key={oi}>
              <input type="radio" name={`ans-${step.id}-${qi}`} checked={q.answer === oi} onChange={() => updQ(qi, { answer: oi })} title="Mark as correct" />
              <input className="form-control" value={opt} onChange={e => updQ(qi, { options: q.options.map((o, idx) => idx === oi ? e.target.value : o) })} placeholder={`Option ${oi + 1}`} />
              {q.options.length > 2 && <button className="icon-btn-danger" onClick={() => updQ(qi, { options: q.options.filter((_, idx) => idx !== oi), answer: Math.min(q.answer, q.options.length - 2) })}><FiTrash2 /></button>}
            </div>
          ))}
          <div className="d-flex gap-2 mt-1">
            <button className="link-add" onClick={() => updQ(qi, { options: [...q.options, ''] })}>+ Option</button>
            {step.questions.length > 1 && <button className="link-remove" onClick={() => setQs(step.questions.filter((_, idx) => idx !== qi))}>Remove question</button>}
          </div>
        </div>
      ))}
      <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setQs([...step.questions, { q: '', options: ['', ''], answer: 0 }])}>
        <FiPlus style={{ marginRight: 4 }} /> Add question
      </button>
    </div>
  );
}
