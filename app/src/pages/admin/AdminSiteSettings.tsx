import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import type { SiteSettings } from '../../contexts/SiteSettingsContext';
import { FiSave, FiGlobe, FiBell, FiShare2, FiTool, FiLock, FiX } from 'react-icons/fi';

export default function AdminSiteSettings() {
  const { user } = useAuth();
  const { settings, refresh } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Maintenance password-confirm modal
  const [pwModal, setPwModal] = useState(false);
  const [pw, setPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (data) setForm(f => ({ ...f, ...data }));
      setLoading(false);
    })();
  }, []);

  const set = (patch: Partial<SiteSettings>) => setForm(f => ({ ...f, ...patch }));

  // Save a specific group of fields (used by the per-section buttons)
  const saveFields = async (fields: Partial<SiteSettings>, message = 'Saved') => {
    const { error } = await supabase.from('site_settings')
      .update({ ...fields, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) { toast.error(error.message); return; }
    await refresh();
    toast.success(message);
  };

  const save = async () => {
    setSaving(true);
    await saveFields({
      site_name: form.site_name, tagline: form.tagline, contact_email: form.contact_email,
      support_url: form.support_url, announcement: form.announcement,
      announcement_active: form.announcement_active, announcement_variant: form.announcement_variant,
      announcement_audience: form.announcement_audience,
      social_instagram: form.social_instagram, social_linkedin: form.social_linkedin,
      social_website: form.social_website, maintenance_message: form.maintenance_message,
    }, 'Site settings saved');
    setSaving(false);
  };

  // Maintenance takes effect immediately (independent of "Save changes")
  const setMaintenance = async (value: boolean) => {
    const { error } = await supabase.from('site_settings')
      .update({ maintenance_mode: value, maintenance_message: form.maintenance_message, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (error) { toast.error(error.message); return false; }
    set({ maintenance_mode: value });
    await refresh();
    return true;
  };

  const onToggleMaintenance = async () => {
    if (form.maintenance_mode) {
      // turning OFF — restore access immediately
      if (await setMaintenance(false)) toast.success('Maintenance mode disabled');
    } else {
      // turning ON — require password confirmation first
      setPw(''); setPwError(''); setPwModal(true);
    }
  };

  const confirmEnable = async () => {
    if (!user?.email) return;
    setPwBusy(true); setPwError('');
    const { error: authErr } = await supabase.auth.signInWithPassword({ email: user.email, password: pw });
    if (authErr) { setPwError('Incorrect password. Please try again.'); setPwBusy(false); return; }
    const ok = await setMaintenance(true);
    setPwBusy(false);
    if (ok) { setPwModal(false); toast.success('Maintenance mode enabled — students will see the notice'); }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}><div className="spinner" /></div>;
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Site Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Control site-wide branding, announcements and contact info.</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={save} disabled={saving}>
          <FiSave style={{ marginRight: 6 }} /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Branding */}
      <div className="settings-section">
        <h3><FiGlobe style={{ marginRight: 8 }} /> Branding</h3>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="settings-label">Site name</label>
            <input className="form-control" value={form.site_name} onChange={e => set({ site_name: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="settings-label">Tagline</label>
            <input className="form-control" value={form.tagline} onChange={e => set({ tagline: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="settings-label">Contact email</label>
            <input className="form-control" value={form.contact_email} onChange={e => set({ contact_email: e.target.value })} placeholder="support@example.com" />
          </div>
          <div className="col-md-6">
            <label className="settings-label">Support URL</label>
            <input className="form-control" value={form.support_url} onChange={e => set({ support_url: e.target.value })} placeholder="https://…" />
          </div>
        </div>
      </div>

      {/* Announcement */}
      <div className="settings-section">
        <h3><FiBell style={{ marginRight: 8 }} /> Announcement Banner</h3>
        <div className="pref-row">
          <div><div className="pref-title">Show announcement</div><div className="pref-desc">Displays a banner at the top of every page.</div></div>
          <button type="button" className={`switch ${form.announcement_active ? 'on' : ''}`} onClick={() => set({ announcement_active: !form.announcement_active })}><span className="switch-knob" /></button>
        </div>
        <div className="row g-3 mt-1">
          <div className="col-12">
            <label className="settings-label">Message</label>
            <input className="form-control" value={form.announcement} onChange={e => set({ announcement: e.target.value })} placeholder="e.g. New courses added this week!" />
          </div>
          <div className="col-md-4">
            <label className="settings-label">Style</label>
            <select className="form-select" value={form.announcement_variant} onChange={e => set({ announcement_variant: e.target.value as SiteSettings['announcement_variant'] })}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </div>
          <div className="col-md-8">
            <label className="settings-label">Show to (audience)</label>
            <select className="form-select" value={form.announcement_audience} onChange={e => set({ announcement_audience: e.target.value as SiteSettings['announcement_audience'] })}>
              <option value="all">All students</option>
              <option value="subscribers">Subscribed students only</option>
              <option value="free">Free (non-subscribed) students only</option>
            </select>
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }}
            onClick={() => saveFields({
              announcement: form.announcement, announcement_active: form.announcement_active,
              announcement_variant: form.announcement_variant, announcement_audience: form.announcement_audience,
            }, 'Announcement saved')}>
            <FiSave style={{ marginRight: 6 }} /> Save announcement
          </button>
        </div>
      </div>

      {/* Social */}
      <div className="settings-section">
        <h3><FiShare2 style={{ marginRight: 8 }} /> Social Links</h3>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="settings-label">Instagram</label>
            <input className="form-control" value={form.social_instagram} onChange={e => set({ social_instagram: e.target.value })} placeholder="https://instagram.com/…" />
          </div>
          <div className="col-md-4">
            <label className="settings-label">LinkedIn</label>
            <input className="form-control" value={form.social_linkedin} onChange={e => set({ social_linkedin: e.target.value })} placeholder="https://linkedin.com/…" />
          </div>
          <div className="col-md-4">
            <label className="settings-label">Website</label>
            <input className="form-control" value={form.social_website} onChange={e => set({ social_website: e.target.value })} placeholder="https://…" />
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '10px 0 0' }}>Shown in the footer on student pages.</p>
        <div className="d-flex justify-content-end mt-2">
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }}
            onClick={() => saveFields({
              social_instagram: form.social_instagram, social_linkedin: form.social_linkedin, social_website: form.social_website,
            }, 'Social links saved')}>
            <FiSave style={{ marginRight: 6 }} /> Save links
          </button>
        </div>
      </div>

      {/* Maintenance */}
      <div className="settings-section">
        <h3><FiTool style={{ marginRight: 8 }} /> Maintenance</h3>
        <div className="pref-row">
          <div>
            <div className="pref-title">Maintenance mode {form.maintenance_mode && <span className="status-badge published" style={{ marginLeft: 6 }}>ON</span>}</div>
            <div className="pref-desc">Students see a maintenance notice and can't use the app. Admins keep full access.</div>
          </div>
          <button type="button" className={`switch ${form.maintenance_mode ? 'on' : ''}`} onClick={onToggleMaintenance}><span className="switch-knob" /></button>
        </div>
        <div className="mt-2">
          <label className="settings-label">Notice shown to students</label>
          <textarea className="form-control" rows={2} value={form.maintenance_message} onChange={e => set({ maintenance_message: e.target.value })} placeholder="We're performing scheduled maintenance…" />
          <small className="text-muted">Saved with “Save changes”; applied live while maintenance is on.</small>
        </div>
      </div>

      {/* Password confirmation modal */}
      {pwModal && (
        <div className="modal-overlay" onMouseDown={() => !pwBusy && setPwModal(false)}>
          <div className="modal-card" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <h4><FiLock style={{ marginRight: 8 }} /> Confirm with your password</h4>
              <button className="modal-close" onClick={() => !pwBusy && setPwModal(false)}><FiX /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 14 }}>
              Enabling maintenance mode will lock out all students immediately. Enter your admin password to confirm.
            </p>
            <input
              type="password" className="form-control" autoFocus value={pw}
              onChange={e => { setPw(e.target.value); setPwError(''); }}
              onKeyDown={e => { if (e.key === 'Enter' && pw) confirmEnable(); }}
              placeholder="Admin password"
            />
            {pwError && <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: 8 }}>{pwError}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setPwModal(false)} disabled={pwBusy}>Cancel</button>
              <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={confirmEnable} disabled={!pw || pwBusy}>
                {pwBusy ? 'Verifying…' : 'Enable maintenance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
