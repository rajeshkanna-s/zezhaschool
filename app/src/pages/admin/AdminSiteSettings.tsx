import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import type { SiteSettings } from '../../contexts/SiteSettingsContext';
import { FiSave, FiGlobe, FiBell, FiShare2, FiTool } from 'react-icons/fi';

export default function AdminSiteSettings() {
  const { settings, refresh } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (data) setForm(f => ({ ...f, ...data }));
      setLoading(false);
    })();
  }, []);

  const set = (patch: Partial<SiteSettings>) => setForm(f => ({ ...f, ...patch }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('site_settings').update({
      site_name: form.site_name, tagline: form.tagline, contact_email: form.contact_email,
      support_url: form.support_url, announcement: form.announcement,
      announcement_active: form.announcement_active, announcement_variant: form.announcement_variant,
      social_twitter: form.social_twitter, social_facebook: form.social_facebook,
      social_instagram: form.social_instagram, maintenance_mode: form.maintenance_mode,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refresh();
    toast.success('Site settings saved');
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
          <div className="col-md-8">
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
        </div>
      </div>

      {/* Social */}
      <div className="settings-section">
        <h3><FiShare2 style={{ marginRight: 8 }} /> Social Links</h3>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="settings-label">Twitter / X</label>
            <input className="form-control" value={form.social_twitter} onChange={e => set({ social_twitter: e.target.value })} placeholder="https://x.com/…" />
          </div>
          <div className="col-md-4">
            <label className="settings-label">Facebook</label>
            <input className="form-control" value={form.social_facebook} onChange={e => set({ social_facebook: e.target.value })} placeholder="https://facebook.com/…" />
          </div>
          <div className="col-md-4">
            <label className="settings-label">Instagram</label>
            <input className="form-control" value={form.social_instagram} onChange={e => set({ social_instagram: e.target.value })} placeholder="https://instagram.com/…" />
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="settings-section">
        <h3><FiTool style={{ marginRight: 8 }} /> Maintenance</h3>
        <div className="pref-row">
          <div><div className="pref-title">Maintenance mode</div><div className="pref-desc">Show a maintenance notice to students (admins keep access).</div></div>
          <button type="button" className={`switch ${form.maintenance_mode ? 'on' : ''}`} onClick={() => set({ maintenance_mode: !form.maintenance_mode })}><span className="switch-knob" /></button>
        </div>
      </div>
    </div>
  );
}
