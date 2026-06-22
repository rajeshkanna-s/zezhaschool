import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FiMail, FiLock, FiAlertTriangle } from 'react-icons/fi';
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
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="ZezhaSchool" />
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue your learning journey</p>

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
