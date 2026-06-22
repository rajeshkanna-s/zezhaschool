import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';
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
