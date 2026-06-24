import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, ACCENTS } from '../contexts/ThemeContext';
import type { ThemeMode, Density } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  FiUser, FiLock, FiSave, FiSun, FiMoon, FiMonitor, FiBell, FiSliders,
  FiCamera, FiLogOut, FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

type Tab = 'profile' | 'appearance' | 'notifications' | 'security';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <FiUser /> },
  { id: 'appearance', label: 'Appearance', icon: <FiSliders /> },
  { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
  { id: 'security', label: 'Security', icon: <FiLock /> },
];

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span className="switch-knob" />
    </button>
  );
}

export default function Settings() {
  const { profile, updateProfile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div style={{ maxWidth: 760 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 18 }}>Settings</h2>

      <div className="settings-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`settings-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab key="p" profile={profile} user={user} updateProfile={updateProfile} refreshProfile={refreshProfile} />}
      {tab === 'appearance' && <AppearanceTab />}
      {tab === 'notifications' && <NotificationsTab userId={user?.id} />}
      {tab === 'security' && <SecurityTab email={user?.email} updateProfile={updateProfile} navigate={navigate} />}
    </div>
  );
}

/* ---------- Profile ---------- */
function ProfileTab({ profile, user, updateProfile, refreshProfile }: any) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [mobile, setMobile] = useState(profile?.mobile || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = (profile?.full_name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(mobile)) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setSaving(true);
    const { error } = await updateProfile({ full_name: fullName, mobile });
    setSaving(false);
    toast[error ? 'error' : 'success'](error || 'Profile updated');
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('Image must be under 3 MB'); return; }
    setUploading(true);
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/avatar_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error } = await updateProfile({ avatar_url: data.publicUrl });
    setUploading(false);
    if (error) { toast.error(error); return; }
    await refreshProfile();
    toast.success('Photo updated');
  };

  return (
    <div className="settings-section">
      <h3><FiUser style={{ marginRight: 8 }} /> Profile Information</h3>

      <div className="avatar-row">
        <div className="avatar-lg">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name} /> : <span>{initials}</span>}
        </div>
        <div>
          <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto' }} disabled={uploading} onClick={() => fileRef.current?.click()}>
            <FiCamera style={{ marginRight: 6 }} /> {uploading ? 'Uploading…' : 'Change photo'}
          </button>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>JPG or PNG, up to 3 MB</div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatar} />
        </div>
      </div>

      <form onSubmit={onSave}>
        <div className="mb-3">
          <label className="form-label settings-label">Full Name</label>
          <input type="text" className="form-control" value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label settings-label">Email Address</label>
          <input type="email" className="form-control" value={profile?.email || ''} disabled />
          <small className="text-muted">Email cannot be changed</small>
        </div>
        <div className="mb-3">
          <label className="form-label settings-label">Mobile Number</label>
          <input type="tel" className="form-control" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'auto' }}>
          <FiSave style={{ marginRight: 6 }} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

/* ---------- Appearance ---------- */
function AppearanceTab() {
  const { mode, setMode, accent, setAccentId, density, setDensity } = useTheme();
  const modes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Light', icon: <FiSun /> },
    { id: 'dark', label: 'Dark', icon: <FiMoon /> },
    { id: 'system', label: 'System', icon: <FiMonitor /> },
  ];
  const densities: { id: Density; label: string }[] = [
    { id: 'comfortable', label: 'Comfortable' },
    { id: 'compact', label: 'Compact' },
  ];

  return (
    <div className="settings-section">
      <h3><FiSliders style={{ marginRight: 8 }} /> Appearance</h3>

      <div className="mb-4">
        <label className="form-label settings-label">Theme</label>
        <div className="seg-group">
          {modes.map(m => (
            <button key={m.id} className={`seg ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
              {m.icon}<span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label settings-label">Accent color</label>
        <div className="accent-swatches">
          {ACCENTS.map(a => (
            <button
              key={a.id}
              className={`accent-swatch ${accent.id === a.id ? 'active' : ''}`}
              style={{ background: a.primary }}
              title={a.name}
              aria-label={a.name}
              onClick={() => setAccentId(a.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="form-label settings-label">Density</label>
        <div className="seg-group">
          {densities.map(d => (
            <button key={d.id} className={`seg ${density === d.id ? 'active' : ''}`} onClick={() => setDensity(d.id)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Notifications ---------- */
function NotificationsTab({ userId }: { userId?: string }) {
  const [prefs, setPrefs] = useState({ email_product: true, email_subscription: true, email_marketing: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle();
      if (data) setPrefs({ email_product: data.email_product, email_subscription: data.email_subscription, email_marketing: data.email_marketing });
      setLoading(false);
    })();
  }, [userId]);

  const save = async (next: typeof prefs) => {
    setPrefs(next);
    if (!userId) return;
    setSaving(true);
    await supabase.from('user_preferences').upsert({ user_id: userId, ...next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    setSaving(false);
  };

  const rows: { key: keyof typeof prefs; title: string; desc: string }[] = [
    { key: 'email_product', title: 'Product updates', desc: 'New courses, missions, and feature announcements.' },
    { key: 'email_subscription', title: 'Subscription & billing', desc: 'Renewal reminders and payment receipts.' },
    { key: 'email_marketing', title: 'Tips & promotions', desc: 'Occasional offers and learning tips.' },
  ];

  if (loading) return <div className="settings-section"><div className="spinner" /></div>;

  return (
    <div className="settings-section">
      <h3><FiBell style={{ marginRight: 8 }} /> Email Notifications {saving && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>· saving…</span>}</h3>
      {rows.map(r => (
        <div className="pref-row" key={r.key}>
          <div>
            <div className="pref-title">{r.title}</div>
            <div className="pref-desc">{r.desc}</div>
          </div>
          <Switch checked={prefs[r.key]} onChange={v => save({ ...prefs, [r.key]: v })} />
        </div>
      ))}
    </div>
  );
}

/* ---------- Security ---------- */
function SecurityTab({ email, updateProfile, navigate }: any) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChanging(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email || '', password: currentPassword });
    if (signInError) { toast.error('Current password is incorrect'); setChanging(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChanging(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Password changed');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const signOutEverywhere = async () => {
    if (!confirm('Sign out of all devices? You will need to log in again.')) return;
    await supabase.auth.signOut({ scope: 'global' });
    navigate('/login');
  };

  const deactivate = async () => {
    if (!confirm('Deactivate your account? You will be signed out and an admin must reactivate it.')) return;
    await updateProfile({ is_active: false });
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <div className="settings-section">
        <h3><FiLock style={{ marginRight: 8 }} /> Change Password</h3>
        <form onSubmit={onChangePassword}>
          <div className="mb-3">
            <label className="form-label settings-label">Current Password</label>
            <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label settings-label">New Password</label>
            <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="mb-3">
            <label className="form-label settings-label">Confirm New Password</label>
            <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={changing} style={{ width: 'auto' }}>
            {changing ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h3><FiLogOut style={{ marginRight: 8 }} /> Sessions</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 12 }}>
          Signed in as <strong>{email}</strong>. Sign out everywhere to revoke access on all devices.
        </p>
        <button className="btn btn-outline-secondary" style={{ width: 'auto' }} onClick={signOutEverywhere}>
          <FiLogOut style={{ marginRight: 6 }} /> Sign out of all devices
        </button>
      </div>

      <div className="settings-section danger-zone">
        <h3><FiAlertTriangle style={{ marginRight: 8 }} /> Danger Zone</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 12 }}>
          Deactivating disables your account and signs you out. An admin can reactivate it later.
        </p>
        <button className="btn-danger-outline" onClick={deactivate}>Deactivate my account</button>
      </div>
    </>
  );
}
