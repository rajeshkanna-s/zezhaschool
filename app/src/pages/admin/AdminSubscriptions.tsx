import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { SubscriptionPlan } from '../../types';
import {
  FiCreditCard, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiUsers, FiLayers,
} from 'react-icons/fi';

type Tab = 'plans' | 'subscribers';

const blankPlan: Partial<SubscriptionPlan> = {
  name: '', description: '', price: 0, duration_days: 30, features: [], is_active: true,
};

export default function AdminSubscriptions() {
  const [tab, setTab] = useState<Tab>('plans');

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 16 }}>Subscription Management</h2>
      <div className="settings-tabs" style={{ maxWidth: 360 }}>
        <button className={`settings-tab ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>
          <FiLayers /><span>Plans</span>
        </button>
        <button className={`settings-tab ${tab === 'subscribers' ? 'active' : ''}`} onClick={() => setTab('subscribers')}>
          <FiUsers /><span>Subscribers</span>
        </button>
      </div>
      {tab === 'plans' ? <PlansTab /> : <SubscribersTab />}
    </div>
  );
}

/* ---------------- Plans management ---------------- */
function PlansTab() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<SubscriptionPlan> | null>(null);

  const load = async () => {
    const { data } = await supabase.from('subscription_plans').select('*').order('price', { ascending: true });
    if (data) setPlans(data as SubscriptionPlan[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (p: SubscriptionPlan) => {
    setPlans(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x));
    const { error } = await supabase.from('subscription_plans').update({ is_active: !p.is_active }).eq('id', p.id);
    if (error) { toast.error(error.message); load(); return; }
    toast.success(`${p.name} ${!p.is_active ? 'shown to' : 'hidden from'} students`);
  };

  const remove = async (p: SubscriptionPlan) => {
    if (!confirm(`Delete the "${p.name}" plan? Existing subscribers keep their record, but no one can subscribe to it again.`)) return;
    const { error } = await supabase.from('subscription_plans').delete().eq('id', p.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Plan deleted');
    setPlans(prev => prev.filter(x => x.id !== p.id));
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 240 }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
          {plans.length} plan{plans.length === 1 ? '' : 's'} · changes apply to students immediately.
        </p>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setEditing({ ...blankPlan })}>
          <FiPlus style={{ marginRight: 6 }} /> Add Plan
        </button>
      </div>

      <div className="row g-3">
        {plans.map(p => (
          <div className="col-md-6 col-lg-4" key={p.id}>
            <div className="content-card admin-plan-card" style={{ opacity: p.is_active ? 1 : 0.6 }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{p.name}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{Number(p.price).toLocaleString()}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}> / {p.duration_days}d</span>
                  </div>
                </div>
                <span className={`status-badge ${p.is_active ? 'published' : 'draft'}`}>{p.is_active ? 'Active' : 'Hidden'}</span>
              </div>
              {p.description && <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '8px 0' }}>{p.description}</p>}
              <ul className="admin-plan-features">
                {(Array.isArray(p.features) ? p.features : []).map((f, i) => (
                  <li key={i}><FiCheck /> {f}</li>
                ))}
              </ul>
              <div className="admin-plan-actions">
                <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setEditing(p)}>
                  <FiEdit2 style={{ marginRight: 4 }} /> Edit
                </button>
                <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={() => toggleActive(p)}>
                  {p.is_active ? 'Hide' : 'Show'}
                </button>
                <button className="row-action danger" title="Delete" onClick={() => remove(p)}><FiTrash2 /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <PlanEditor
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function PlanEditor({ plan, onClose, onSaved }: { plan: Partial<SubscriptionPlan>; onClose: () => void; onSaved: () => void }) {
  const isEdit = Boolean(plan.id);
  const [name, setName] = useState(plan.name ?? '');
  const [description, setDescription] = useState(plan.description ?? '');
  const [price, setPrice] = useState<number>(Number(plan.price ?? 0));
  const [duration, setDuration] = useState<number>(plan.duration_days ?? 30);
  const [features, setFeatures] = useState<string[]>(Array.isArray(plan.features) ? plan.features : []);
  const [isActive, setIsActive] = useState<boolean>(plan.is_active ?? true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { toast.error('Plan name is required'); return; }
    setSaving(true);
    const payload = {
      name: name.trim(), description: description.trim(), price: Number(price) || 0,
      duration_days: Number(duration) || 0, features: features.filter(f => f.trim()), is_active: isActive,
    };
    const { error } = isEdit
      ? await supabase.from('subscription_plans').update(payload).eq('id', plan.id)
      : await supabase.from('subscription_plans').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isEdit ? 'Plan updated' : 'Plan created');
    onSaved();
  };

  return (
    <div className="modal-overlay" onMouseDown={() => !saving && onClose()}>
      <div className="modal-card" style={{ width: 540, maxHeight: '90vh', overflowY: 'auto' }} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <h4>{isEdit ? 'Edit plan' : 'New plan'}</h4>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div className="row g-3">
          <div className="col-md-7">
            <label className="settings-label">Plan name</label>
            <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pro" />
          </div>
          <div className="col-md-5">
            <label className="settings-label">Status</label>
            <div className="pref-row" style={{ padding: '6px 0', borderBottom: 'none' }}>
              <span className="pref-desc">{isActive ? 'Visible to students' : 'Hidden'}</span>
              <button type="button" className={`switch ${isActive ? 'on' : ''}`} onClick={() => setIsActive(v => !v)}><span className="switch-knob" /></button>
            </div>
          </div>
          <div className="col-12">
            <label className="settings-label">Description</label>
            <input className="form-control" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short tagline shown on the plan card" />
          </div>
          <div className="col-md-6">
            <label className="settings-label">Price (₹)</label>
            <input type="number" min={0} className="form-control" value={price} onChange={e => setPrice(Number(e.target.value))} />
          </div>
          <div className="col-md-6">
            <label className="settings-label">Duration (days)</label>
            <input type="number" min={0} className="form-control" value={duration} onChange={e => setDuration(Number(e.target.value))} />
            <small className="text-muted">30 = monthly · 365 = yearly</small>
          </div>
          <div className="col-12">
            <label className="settings-label">Features</label>
            <div className="d-flex flex-column gap-2">
              {features.map((f, i) => (
                <div className="d-flex gap-2 align-items-center" key={i}>
                  <input className="form-control" value={f} onChange={e => setFeatures(features.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`Feature ${i + 1}`} />
                  <button className="icon-btn-danger" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}><FiTrash2 /></button>
                </div>
              ))}
              <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setFeatures([...features, ''])}>
                <FiPlus style={{ marginRight: 4 }} /> Add feature
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Subscribers list ---------------- */
interface SubRow {
  id: string; status: string; starts_at: string; expires_at: string; created_at: string;
  plan: { name: string; price: number } | null;
  profile: { full_name: string; email: string } | null;
}

function SubscribersTab() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('*, plan:subscription_plans(name, price), profile:profiles(full_name, email)')
        .order('created_at', { ascending: false });
      if (data) setSubs(data as any);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 240 }}><div className="spinner" /></div>;
  }

  if (subs.length === 0) {
    return <div className="empty-state"><FiCreditCard /><h3>No subscriptions yet</h3></div>;
  }

  return (
    <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr><th>User</th><th>Plan</th><th>Price</th><th>Status</th><th>Started</th><th>Expires</th></tr>
          </thead>
          <tbody>
            {subs.map(sub => (
              <tr key={sub.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{sub.profile?.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub.profile?.email}</div>
                </td>
                <td style={{ fontWeight: 600 }}>{sub.plan?.name || 'N/A'}</td>
                <td>₹{sub.plan?.price || 0}</td>
                <td><span className={`status-badge ${sub.status}`}>{sub.status}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(sub.starts_at).toLocaleDateString()}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(sub.expires_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
