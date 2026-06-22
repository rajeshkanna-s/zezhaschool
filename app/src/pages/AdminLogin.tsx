import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error && error !== 'ALREADY_LOGGED_IN') {
      toast.error(error);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email)
      .single();

    if (!profile || profile.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    toast.success('Welcome, Admin!');
    navigate('/admin');
  };

  return (
    <div className="auth-wrapper" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <FiShield size={28} color="#4f46e5" />
            <img src="/logo.png" alt="ZezhaSchool" />
          </div>
        </div>
        <h2 className="auth-title">Admin Portal</h2>
        <p className="auth-subtitle">Authorized personnel only</p>

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

          <div className="form-floating">
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password"><FiLock style={{ marginRight: 6 }} />Password</label>
          </div>

          <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
            {loading ? 'Verifying...' : 'Admin Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">← Back to Student Login</Link>
        </p>
      </div>
    </div>
  );
}
