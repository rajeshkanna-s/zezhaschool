import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { profile, updateProfile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [mobile, setMobile] = useState(profile?.mobile || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      setSaving(false);
      return;
    }

    const { error } = await updateProfile({ full_name: fullName, mobile });

    if (error) {
      toast.error(error);
    } else {
      toast.success('Profile updated successfully!');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      toast.error('Current password is incorrect');
      setChangingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setChangingPassword(false);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Settings</h2>

      {/* Profile Section */}
      <div className="settings-section">
        <h3><FiUser style={{ marginRight: 8 }} /> Profile Information</h3>
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              value={profile?.email || ''}
              disabled
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--bg-main)' }}
            />
            <small className="text-muted">Email cannot be changed</small>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              Mobile Number
            </label>
            <input
              type="tel"
              className="form-control"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'auto' }}>
            <FiSave style={{ marginRight: 6 }} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="settings-section">
        <h3><FiLock style={{ marginRight: 8 }} /> Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              Current Password
            </label>
            <input
              type="password"
              className="form-control"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={{ borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={changingPassword} style={{ width: 'auto' }}>
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
