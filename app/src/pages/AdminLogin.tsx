import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ADMIN_EMAILS = [
  'zezhaschool@zohomail.in',
  'zezhaschool@gmail.com',
  'zezhatalenties@gmail.com',
];

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
      toast.error('Access denied. This email is not authorized for admin access.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error('Invalid credentials.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    await supabase.from('login_history').insert({
      user_id: data.user.id,
      email,
      full_name: profile.full_name ?? 'Admin',
      role: 'admin',
      status: 'success',
    });

    toast.success('Welcome, Admin!');
    navigate('/admin');
  };

  return (
    <div className="auth-wrapper" style={{ position: 'relative', background: '#0b0f19', overflow: 'hidden' }}>
      {/* Abstract Glowing Blobs */}
      <div className="auth-bg-container">
        <div className="auth-bg-blob auth-bg-blob-1"></div>
        <div className="auth-bg-blob auth-bg-blob-2"></div>
        <div className="auth-bg-blob auth-bg-blob-3"></div>
      </div>

      <div className="auth-card auth-card-glass">
        <div className="auth-logo" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <img src="/logo-icon.png" alt="ZezhaSchool" style={{ height: '110px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <h2 className="auth-title" style={{ color: '#ffffff', fontSize: '1.6rem', fontWeight: 800 }}>Admin Portal</h2>
        <p className="auth-subtitle" style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: 32 }}>Authorized personnel only</p>

        <form onSubmit={handleSubmit}>
          <div className="form-floating">
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Admin Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email"><FiMail style={{ marginRight: 6 }} />Admin Email</label>
          </div>

          <div className="form-floating" style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              id="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password"><FiLock style={{ marginRight: 6 }} />Password</label>
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}></span>
                <span>Verifying...</span>
              </>
            ) : 'Admin Sign In'}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 28 }}>
          <Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'}>
            ← Back to Student Login
          </Link>
        </p>
      </div>
    </div>
  );
}
