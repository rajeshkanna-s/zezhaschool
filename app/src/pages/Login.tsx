import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { supabase } from '../lib/supabase';
import { FiMail, FiLock, FiAlertTriangle, FiTool, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ADMIN_EMAILS = [
  'zezhaschool@zohomail.in',
  'zezhaschool@gmail.com',
  'zezhatalenties@gmail.com',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionConflict, setSessionConflict] = useState(false);
  const { settings } = useSiteSettings();
  const { signIn, forceSignIn } = useAuth() as ReturnType<typeof useAuth> & {
    forceSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  };
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
      toast.error('Admin accounts must use the Admin Login page.');
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error === 'ALREADY_LOGGED_IN') {
      setSessionConflict(true);
      setLoading(false);
      return;
    }

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    // Double-check role after login
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (profile?.role === 'admin') {
      toast.error('Admin accounts must use the Admin Login page.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    toast.success('Welcome back!');
    navigate('/');
  };

  const handleForceLogin = async () => {
    setLoading(true);
    const { error } = await forceSignIn(email, password);
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    setSessionConflict(false);
    toast.success('Logged in successfully!');
    navigate('/');
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left visual side */}
      <div className="auth-split-visual">
        <div className="auth-split-overlay" />
        
        {/* Horizontal Navigation Header Bar */}
        <div className="auth-split-top-bar">
          <div className="auth-split-brand">
            <img src="/logo-icon.png" alt="ZEZHASCHOOL" className="auth-split-logo-img" />
            <span className="auth-split-logo-txt">ZEZHASCHOOL</span>
          </div>
          <Link to="/" className="auth-split-back-home">
            <FiArrowLeft /> Back to Landing Page
          </Link>
        </div>

        <div className="auth-split-visual-content">
          <h1 className="auth-split-heading">
            Learn & Grow with <span className="text-highlight">Life Fundamentals</span>
          </h1>

          {/* Polaroid-framed banner image */}
          <div className="auth-split-image-container">
            <img src="/auth-banner.png" alt="Education Illustration" className="auth-split-vector-img" />
          </div>
        </div>
      </div>

      {/* Right form side */}
      <div className="auth-split-form">
        {/* Mobile-only back button */}
        <Link to="/" className="auth-mobile-back-home">
          <FiArrowLeft /> Back to Landing Page
        </Link>

        {/* Mobile-only logo/brand */}
        <div className="auth-logo-header-mobile">
          <img src="/logo-icon.png" alt="ZEZHASCHOOL Logo" style={{ height: '48px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}>ZEZHASCHOOL</span>
        </div>

        <div className="auth-split-card">
          <div className="auth-card" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue your learning journey</p>

            {settings.maintenance_mode && (
              <div className="login-maintenance-note">
                <FiTool />
                <span>{settings.maintenance_message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-floating">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="email"><FiMail style={{ marginRight: 6 }} />Email address</label>
              </div>

              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <label htmlFor="password"><FiLock style={{ marginRight: 6 }} />Password</label>
              </div>

              <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider"><span>or</span></div>

            <Link to="/admin/login" className="btn btn-outline-primary w-100">
              Admin Login
            </Link>

            <p className="auth-footer">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>

      {sessionConflict && (
        <div className="session-modal-overlay">
          <div className="session-modal">
            <FiAlertTriangle />
            <h3>Active Session Detected</h3>
            <p>
              This account is already logged in on another device or browser.
              Would you like to log out from the other session and continue here?
            </p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary flex-fill"
                onClick={() => setSessionConflict(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary flex-fill"
                onClick={handleForceLogin}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Logout Other & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
